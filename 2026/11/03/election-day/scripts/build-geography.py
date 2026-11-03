"""Offline map preparation. Requires numpy, shapely>=2.1 and pyproj.

Usage: python scripts/build-geography.py /path/to/official-precincts.geojson
Source URL and provenance are recorded in README.md. No network at
build time; the browser only downloads the prepared geometry. Shared coordinates
are transformed together, never scaled independently by municipality.
"""
from pathlib import Path
import json, sys, hashlib
import numpy as np
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.ops import transform, unary_union, polygonize
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
POPULATION = {
    'Barrington':16961,'Bristol':21970,'Warren':11070,'Coventry':36281,
    'East Greenwich':14790,'Warwick':84187,'West Greenwich':6750,'West Warwick':31487,
    'Jamestown':5480,'Little Compton':3535,'Middletown':16502,'Newport':24251,
    'Portsmouth':17474,'Tiverton':15809,'Burrillville':16927,'Central Falls':23124,
    'Cranston':84647,'Cumberland':37615,'East Providence':48249,'Foster':4628,
    'Glocester':10612,'Johnston':30494,'Lincoln':23713,'North Providence':34833,
    'North Smithfield':12990,'Pawtucket':77065,'Providence':195310,'Scituate':10767,
    'Smithfield':22625,'Woonsocket':44580,'Charlestown':8002,'Exeter':6540,
    'Hopkinton':8393,'Narragansett':14291,'New Shoreham':1408,'North Kingstown':27885,
    'Richmond':8128,'South Kingstown':32009,'Westerly':23139,
}
assert sum(POPULATION.values()) == 1114521
DISTRICTS = {'Coventry','Cumberland','Johnston','Lincoln','North Providence','Pawtucket'}
SOURCE = 'https://services2.arcgis.com/S8zZg9pg23JUEexQ/ArcGIS/rest/services/BND_Voting_Precincts_2022/FeatureServer/0'
POP_SOURCE = 'https://dlt.ri.gov/sites/g/files/xkgbur571/files/2026-05/townest.pdf'

def polygons(g):
    if g.geom_type == 'Polygon': return [g]
    return [p for part in g.geoms for p in polygons(part)] if hasattr(g, 'geoms') else []

def polygon_only(g):
    parts = polygons(shapely.make_valid(g))
    return unary_union(parts)

def rings(g):
    return [np.asarray(r.coords) for p in polygons(g) for r in [p.exterior, *p.interiors]]

def reconstruct(coords, templates):
    return [MultiPolygon([Polygon(coords[outer], [coords[inner] for inner in inners]) for outer, inners in parts]) for parts in templates]

def continuous_cartogram(geometries, weights):
    # A synchronous rubber-sheet field based on Dougenik, Chrisman & Niemeyer
    # (1985). Every shared vertex is one array entry. Adaptive steps reject
    # invalid polygons, and intermediate animation frames are checked below.
    index, vertices, templates = {}, [], []
    def ids(ring):
        found=[]
        for xy in ring.coords:
            key=tuple(xy)
            if key not in index: index[key]=len(vertices); vertices.append(key)
            found.append(index[key])
        return np.array(found)
    for g in geometries:
        templates.append([(ids(p.exterior), [ids(h) for h in p.interiors]) for p in polygons(g)])
    original=np.asarray(vertices); points=original.copy()
    weights=np.asarray(weights)/sum(weights)
    gs=geometries
    for iteration in range(1600):
        areas=np.asarray([g.area for g in gs]); desired=areas.sum()*weights
        errors=np.abs(areas/desired-1)
        if iteration % 50 == 0: print('cartogram',iteration,'maximum area error',float(errors.max()),flush=True)
        if errors.max()<0.001: break
        centers=np.asarray([[g.centroid.x,g.centroid.y] for g in gs])
        radius=np.sqrt(areas/np.pi); mass=np.sqrt(desired/np.pi)-radius
        change=np.zeros_like(points)
        damping=1/(1+np.maximum(areas/desired,desired/areas).mean())
        for center,r,m in zip(centers,radius,mass):
            delta=points-center; distance=np.linalg.norm(delta,axis=1)
            ratio=distance/r
            magnitude=np.where(distance>r,m/np.maximum(ratio,1e-12),m*ratio**2*(4-3*ratio))
            change+=delta*(magnitude/np.maximum(distance,1e-12))[:,None]
        step=damping
        for attempt in range(16):
            candidate=points+step*change
            proposed=reconstruct(candidate,templates)
            # Tiny rings can be sensitive; reducing the global step preserves
            # every shared border and avoids local geometry repair/distortion.
            if all(g.is_valid for g in proposed): break
            step*=0.5
        else: raise RuntimeError('Could not preserve cartogram topology at '+str(iteration)+': '+str([(name,shapely.is_valid_reason(g)) for name,g in zip(sorted(POPULATION),proposed) if not g.is_valid]))
        points=candidate;gs=proposed
    errors=np.abs(np.array([g.area for g in gs])/sum(g.area for g in gs)/weights-1)
    assert errors.max()<0.01, f'Population area error too large: {errors.max()}'
    # Straight vertex interpolation is the actual browser animation. Validate
    # 41 positions, including endpoints, rather than only a plausible final map.
    max_overlap=0.0
    for progress in np.linspace(0,1,41):
        frame=reconstruct(original+(points-original)*progress,templates)
        assert all(g.is_valid for g in frame), f'Invalid animation frame {progress}'
        assert shapely.coverage_is_valid(frame), f'Mismatched borders in animation frame {progress}'
        overlap=(sum(g.area for g in frame)-unary_union(frame).area)/sum(g.area for g in frame)
        max_overlap=max(max_overlap,overlap)
        assert overlap<0.00001, f'Overlapping animation frame {progress}: {overlap}'
    return gs, {'algorithm':'Shared-vertex continuous area cartogram (Dougenik et al., 1985)',
        'iterations':iteration,'maxRelativeAreaError':float(errors.max()),'animationFramesChecked':41,
        'maxOverlapFraction':max_overlap,'relativeAreaErrors':dict(zip(sorted(POPULATION),errors.tolist()))}

def main():
    source=Path(sys.argv[1]); raw=source.read_bytes(); features=json.loads(raw)['features']
    # Local equal-area projection: population shares are compared with areas,
    # so longitude/latitude or Web Mercator area would be inappropriate.
    project=Transformer.from_crs('EPSG:4326','+proj=aea +lat_1=41 +lat_2=42 +lat_0=41.5 +lon_0=-71.5 +datum=WGS84 +units=m',always_xy=True).transform
    original=[polygon_only(transform(project,shape(f['geometry']))) for f in features]
    original=[shapely.set_precision(g,0.05) for g in original]
    # Node the full border network before simplifying, so neighboring regions
    # retain the same boundary coordinates (including multipart coastlines).
    faces=list(polygonize(unary_union([g.boundary for g in original])))
    tree=shapely.STRtree(original); assigned=[[] for _ in original]
    for face in faces:
        point=face.representative_point(); candidates=tree.query(point,predicate='intersects')
        if not len(candidates): continue
        owner=max(candidates,key=lambda i:face.intersection(original[i]).area)
        assigned[owner].append(face)
    clean=[unary_union(parts) for parts in assigned]
    deltas=[a.symmetric_difference(b).area/max(a.area,1) for a,b in zip(original,clean)]
    assert max(deltas)<0.001, 'Geometry repair changes too much land'
    assert shapely.coverage_is_valid(clean), 'Precinct boundaries do not form a valid coverage'
    simplified=list(shapely.coverage_simplify(clean,20))
    assert shapely.coverage_is_valid(simplified)
    precincts=[]; towns=[]; wards=[]
    for f,g in zip(features,simplified):
        p=f['properties'];code=str(p['DISTRICT']);ward=str(p['Ward']) if p['Ward'] else None
        note='No voters in this precinct.' if code=='0727' else 'No results reported for this map area.' if code=='28XX' else None
        precincts.append({'id':'precinct:'+code,'code':code,'town':p['TOWN'],'ward':ward,'name':'Precinct '+code,'geometry':g,**({'notice':note} if note else {})})
    for town in sorted(POPULATION):
        members=[p for p in precincts if p['town']==town]
        g=unary_union([p['geometry'] for p in members])
        # A second coverage simplification for state-level display is below.
        towns.append({'id':'town:'+town,'name':town,'population':POPULATION[town],'geometry':g,'wardLabel':'Council districts' if town in DISTRICTS else 'Wards','precinctIds':[p['id'] for p in members]})
        for ward in sorted(set(p['ward'] for p in members if p['ward']),key=int):
            wards.append({'id':'ward:'+town+':'+ward,'town':town,'ward':ward,'name':('Council district ' if town in DISTRICTS else 'Ward ')+ward,'geometry':unary_union([p['geometry'] for p in members if p['ward']==ward])})
    town_geoms=list(shapely.coverage_simplify([t['geometry'] for t in towns],65))
    # Keep long straight edges sampled: deformation otherwise only moves their
    # endpoints and can cut corners, overlap neighbors or spoil area accuracy.
    sampled=[shapely.segmentize(g,500) for g in town_geoms]
    # Coverage simplification preserves every shared border but can retain
    # centimeter-scale shore slivers. They have no visible extent at statewide
    # scale, yet a curved deformation of a sampled edge can fold through them.
    # One common 5 m grid removes these numeric details before deformation.
    # Apply it to the whole coverage and verify adjacency; never repair an
    # independently transformed municipality. Precinct detail is unchanged.
    town_geoms=[shapely.set_precision(g,5) for g in sampled]
    precision_deltas=[a.symmetric_difference(b).area/a.area for a,b in zip(sampled,town_geoms)]
    assert max(precision_deltas)<0.003, 'Town precision reduction changes too much land'
    assert all(g.is_valid for g in town_geoms)
    assert shapely.coverage_is_valid(town_geoms)
    population_geoms,cartogram=continuous_cartogram(town_geoms,[t['population'] for t in towns])
    all_bounds=shapely.total_bounds(town_geoms+population_geoms)
    x0,y0,x1,y1=all_bounds;scale=min(780/(x1-x0),880/(y1-y0))
    def to_screen(g): return transform(lambda x,y,z=None:((np.asarray(x)-x0)*scale+10,(y1-np.asarray(y))*scale+10),g)
    # Validate the same rounded coordinates shipped to browsers. Floating-point
    # checks before serialization alone would miss a collapsed small ring.
    def screen_rounded(g):
        return transform(lambda x,y,z=None:(np.round(x,4),np.round(y,4)),to_screen(g))
    screen_geo=[screen_rounded(g) for g in town_geoms]
    screen_pop=[screen_rounded(g) for g in population_geoms]
    screen_templates=[]
    for g in screen_geo:
        cursor=0; parts=[]
        for p in polygons(g):
            outer=np.arange(cursor,cursor+len(p.exterior.coords));cursor+=len(p.exterior.coords)
            inners=[]
            for hole in p.interiors:
                inner=np.arange(cursor,cursor+len(hole.coords));cursor+=len(hole.coords);inners.append(inner)
            parts.append((outer,inners))
        screen_templates.append(parts)
    rounded_overlap=0.0
    for progress in np.linspace(0,1,41):
        frame=[]
        for a,b,template in zip(screen_geo,screen_pop,screen_templates):
            start=np.concatenate(rings(a));end=np.concatenate(rings(b))
            frame.append(reconstruct(start+(end-start)*progress,[template])[0])
        assert all(g.is_valid for g in frame), f'Invalid serialized animation frame {progress}'
        assert shapely.coverage_is_valid(frame), f'Mismatched serialized borders at {progress}'
        overlap=(sum(g.area for g in frame)-unary_union(frame).area)/sum(g.area for g in frame)
        rounded_overlap=max(rounded_overlap,overlap)
        assert overlap<0.00001, f'Overlapping serialized animation frame {progress}'
    serialized_errors=np.abs(np.asarray([g.area for g in screen_pop])/sum(g.area for g in screen_pop)/
        (np.asarray([t['population'] for t in towns])/sum(POPULATION.values()))-1)
    assert serialized_errors.max()<0.01
    cartogram['serializedFramesChecked']=41
    cartogram['maxSerializedOverlapFraction']=float(rounded_overlap)
    cartogram['maxSerializedRelativeAreaError']=float(serialized_errors.max())
    cartogram['sharedBordersValidAtEveryCheckedFrame']=True
    def serialize(record,geom=None):
        record=record.copy();g=to_screen(geom or record.pop('geometry'))
        record.pop('geometry',None)
        record['rings']=[np.round(r,4).tolist() for r in rings(g)]
        point=g.representative_point();record['centroid']=[round(point.x,4),round(point.y,4)]
        return record
    out_towns=[]
    for t,g,p in zip(towns,town_geoms,population_geoms):
        record=serialize(t,g);pop=serialize(t,p)
        assert [len(r) for r in record['rings']]==[len(r) for r in pop['rings']], 'Animation vertex mismatch'
        record['populationRings']=pop['rings'];record['populationCentroid']=pop['centroid']
        out_towns.append(record)
    payload={'schemaVersion':1,'bounds':[0,0,float((x1-x0)*scale+20),float((y1-y0)*scale+20)],
        'towns':out_towns,'precincts':[serialize(p) for p in precincts],'wards':[serialize(w) for w in wards],
        'populationYear':2025,'cartogram':cartogram,
        'sources':[{'label':'Current published RIGIS precinct boundaries, checked November 3, 2026','url':SOURCE},
                   {'label':'U.S. Census Bureau July 2025 population estimates via RI DLT','url':POP_SOURCE}],
        'provenance':{'sourceSha256':hashlib.sha256(raw).hexdigest(),'dataLastEdited':'2023-11-27','serviceLastEdited':'2024-09-11',
          'checkedAt':'2026-11-03','projection':'Local Albers equal-area','precinctSimplificationMeters':20,'municipalSimplificationMeters':65,
          'municipalPrecisionMeters':5,'maxRelativePrecisionAreaChange':float(max(precision_deltas)),
          'maxRelativeRepairAreaChange':max(deltas),'geometryFeatures':len(features),'reportingGeographies':414,
          'unmatchedMapAreas':['precinct:0727','precinct:28XX']}}
    dest=ROOT/'assets/results/geography.json';dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(payload,separators=(',',':'))+'\n')
    report=ROOT/'data/results/geography-audit.json';report.parent.mkdir(parents=True,exist_ok=True)
    report.write_text(json.dumps({'populationTotal':sum(POPULATION.values()),'cartogram':cartogram,'provenance':payload['provenance']},indent=2)+'\n')
    print('Wrote',dest,'bytes',dest.stat().st_size,flush=True)

if __name__=='__main__': main()
