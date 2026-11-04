import { CONFIG } from './config.mjs?v=20261103-launch';
import { createFeed, LIVE_MESSAGE } from './feed.mjs?v=20261103-launch';
import { describeFreshness } from './freshness.mjs?v=20261103-launch';
import { safeColor, leadOf, leaderColors, tint } from './map-colors.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const count = new Intl.NumberFormat('en-US');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const titles = { governor: 'Governor', mayor: 'Mayor of Providence', question7: 'Question 7' };
const coverage = {
  governor: ['Read more →', 'ballot.html#governor-title'],
  mayor: ['Read more →', 'ballot.html#mayor-title'],
  question7: ['Read more →', 'ballot.html#question-7'],
};
const total = values => (values || []).reduce((sum, value) => sum + value, 0);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const percentage = (votes, denominator) => denominator > 0 ? `${(votes / denominator * 100).toFixed(1)}%` : '—';
function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
function svgNode(tag, attributes = {}) { const element = document.createElementNS(SVG_NS, tag); for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value); return element; }
function pathData(rings, other, fraction = 0) {
  return rings.map((ring, index) => ring.map((point, pointIndex) => {
    const target = other?.[index]?.[pointIndex] || point;
    const x = point[0] + (target[0] - point[0]) * fraction;
    const y = point[1] + (target[1] - point[1]) * fraction;
    return `${pointIndex ? 'L' : 'M'}${x.toFixed(4)},${y.toFixed(4)}`;
  }).join('') + 'Z').join('');
}
function extent(rings) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const ring of rings) for (const [x, y] of ring) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  return Number.isFinite(left) ? [left, top, right, bottom] : [0, 0, 800, 900];
}
function midpoint(rings) { const [left, top, right, bottom] = extent(rings); return [(left + right) / 2, (top + bottom) / 2]; }
function sortedChoices(contest, area) { return contest.choices.map((choice, index) => ({ ...choice, index, votes: area?.votes?.[index] || 0 })).sort((a, b) => b.votes - a.votes || a.index - b.index); }

class ContestView {
  constructor(id, geography) {
    this.id = id;
    this.geo = geography;
    this.geoById = new Map([...geography.towns, ...geography.precincts, ...geography.wards].map(feature => [feature.id, feature]));
    this.state = { town: id === 'governor' ? null : 'Providence', layer: 'precinct', ward: null, mode: 'geographic', selected: null, hover: null, zoom: 1, pan: [0, 0], morph: 0 };
    this.paths = new Map();
    this.pointers = new Map();
    this.regions = [];
    this.frame = null;
    this.section = node('section', 'contest-section');
    this.section.id = id;
    this.section.setAttribute('aria-labelledby', `${id}-heading`);
    // This template is fixed application markup. All source-provided text is
    // inserted with textContent, never interpreted as HTML.
    this.section.innerHTML = `
      <div class="contest-heading"><div><div class="race-picker"><h2 id="${id}-heading"></h2><span class="race-picker-caret" aria-hidden="true"></span><button type="button" class="race-select" aria-label="Choose a race" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}-race-menu"></button><div class="race-menu" id="${id}-race-menu" role="menu" aria-label="Choose a race" hidden></div></div><a class="contest-coverage"></a></div></div>
      <p class="contest-notice" hidden></p>
      <div class="contest-content">
        <div class="contest-summary"><div class="summary-table"></div><div class="summary-total"><span>Votes reported</span><strong></strong></div></div>
        <div class="map-column">
          <button type="button" class="map-back" hidden></button>
          <div class="map-heading"><h3 id="${id}-map-heading"></h3><div class="map-view-buttons" role="group" aria-label="Map view"><button type="button" data-view="first"></button><button type="button" data-view="second"></button></div></div>
          <div class="map-canvas"><svg class="results-map" role="group" aria-labelledby="${id}-map-heading"></svg><div class="map-zoom" role="group" aria-label="Map zoom"><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset">Reset</button></div></div>
          <div class="map-legend" aria-label="Map color key"></div>
          <label class="area-select-label"><select class="area-select" aria-label="Choose an area for ${titles[id]}"></select></label>

        </div>
      </div>`;
    this.q = selector => this.section.querySelector(selector);
    this.q('h2').textContent = titles[id];
    for (const [value, title] of Object.entries(titles)) {
      const option = node('button', 'race-option', title);
      option.type = 'button'; option.setAttribute('role', 'menuitemradio');
      option.setAttribute('aria-checked', String(value === id)); option.tabIndex = -1;
      option.addEventListener('click', () => {
        selectedContest = value; selectContest(); updateURL();
        views.get(selectedContest)?.q('.race-select').focus({ preventScroll: true });
      });
      this.q('.race-menu').append(option);
    }
    this.q('.race-select').addEventListener('click', () => this.toggleRaceMenu());
    this.q('.race-select').addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); this.toggleRaceMenu(true); }
    });
    this.q('.race-menu').addEventListener('keydown', event => {
      const options = [...this.q('.race-menu').children], at = options.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); this.toggleRaceMenu(false); this.q('.race-select').focus({ preventScroll: true }); }
      else if (event.key === 'Tab') { this.toggleRaceMenu(false); this.q('.race-select').focus({ preventScroll: true }); }
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (at + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus({ preventScroll: true });
      }
    });
    this.q('.race-picker').addEventListener('focusout', event => { if (!this.q('.race-picker').contains(event.relatedTarget)) this.toggleRaceMenu(false); });
    this.q('.contest-coverage').textContent = coverage[id][0];
    this.q('.contest-coverage').href = coverage[id][1];
    this.tooltip = node('div', 'map-tooltip');
    this.tooltip.id = `${id}-tooltip`;
    this.tooltip.setAttribute('role', 'tooltip');
    this.tooltip.hidden = true;
    this.q('.map-canvas').append(this.tooltip);
    this.svg = this.q('.results-map');
    this.definitions = svgNode('defs');
    this.tiePatterns = new Map();
    this.mapGroup = svgNode('g');
    this.shapeGroup = svgNode('g');
    this.labelGroup = svgNode('g', { 'aria-hidden': 'true' });
    this.highlightGroup = svgNode('g', { 'aria-hidden': 'true', class: 'map-highlight' });
    this.mapGroup.append(this.shapeGroup, this.labelGroup, this.highlightGroup);
    this.svg.append(this.definitions, this.mapGroup);
    this.q('.map-back').addEventListener('click', () => this.goBack());
    this.q('[data-view="first"]').addEventListener('click', () => this.switchView(false));
    this.q('[data-view="second"]').addEventListener('click', () => this.switchView(true));
    this.q('.area-select').addEventListener('change', event => {
      const id = event.target.value || null, region = this.regionsById.get(id);
      this.tooltipPoint = null;
      if (this.canDrill(region)) { this.drill(region); return; }
      this.state.selected = id; this.state.hover = null; this.paintSelection(); this.renderTooltip();
    });
    this.q('[data-zoom="in"]').addEventListener('click', () => this.zoomBy(1.5));
    this.q('[data-zoom="out"]').addEventListener('click', () => this.zoomBy(1 / 1.5));
    this.q('[data-zoom="reset"]').addEventListener('click', () => this.resetZoom());
    this.installPointerHandling();
    document.addEventListener('pointerdown', event => {
      if (!this.section.contains(event.target)) this.clearTooltip();
      if (!this.q('.race-picker').contains(event.target)) this.toggleRaceMenu(false);
    });
    this.section.addEventListener('keydown', event => { if (event.key === 'Escape') this.clearTooltip(); });
    window.addEventListener('resize', () => this.positionTooltip());
    window.addEventListener('scroll', () => { if (!this.tooltip.hidden) { this.tooltipPoint = null; this.positionTooltip(); } }, { passive: true });
  }

  toggleRaceMenu(open = this.q('.race-menu').hidden) {
    this.q('.race-menu').hidden = !open;
    this.q('.race-select').setAttribute('aria-expanded', String(open));
    if (open) this.q('.race-menu [aria-checked="true"]').focus({ preventScroll: true });
  }

  update(contest, snapshot) {
    this.contest = contest;
    this.snapshot = snapshot;
    this.areas = Object.fromEntries(Object.entries(contest?.areas || {}).map(([id, area]) => [id, { ...area, id }]));
    const unavailable = !contest || contest.available === false;
    this.q('.contest-notice').hidden = !contest?.notice;
    this.q('.contest-notice').textContent = contest?.notice || '';
    this.q('.contest-content').hidden = unavailable;
    if (unavailable) {
      this.q('.contest-notice').hidden = false;
      this.q('.contest-notice').textContent = contest?.notice || 'This contest is not included in the selected data.';
      return;
    }
    this.renderSummary();
    this.renderMap();
  }

  renderSummary() {
    const area = this.areas[this.contest.totalArea];
    const table = node('table', 'candidate-table');
    table.setAttribute('aria-label', `${titles[this.id]} vote totals`);
    const head = node('thead'), header = node('tr');
    for (const label of [this.id === 'question7' ? 'Answer' : 'Candidate', 'Votes', 'Share']) { const th = node('th', '', label); th.scope = 'col'; header.append(th); }
    head.append(header); table.append(head);
    const body = node('tbody');
    for (const choice of sortedChoices(this.contest, area)) {
      const row = node('tr'); row.style.setProperty('--choice-color', safeColor(choice.color));
      const nameCell = node('td'), name = node('span', 'candidate-name');
      name.append(node('span', 'candidate-dot'), node('span', '', choice.name)); nameCell.append(name);
      if (choice.party && choice.party !== 'NONPARTISAN') nameCell.append(node('span', 'candidate-party', ({ DEMOCRAT: 'Democrat', REPUBLICAN: 'Republican' })[choice.party] || choice.party));
      const votesCell = node('td', 'candidate-count', area?.reporting.reported ? count.format(choice.votes) : '—');
      const shareCell = node('td', 'candidate-share'), shareLine = node('div', 'share-line'), shareText = node('span', 'share-value', percentage(choice.votes, area?.total));
      const bar = node('div', 'candidate-bar'), fill = node('span'); bar.setAttribute('aria-hidden', 'true'); fill.style.width = `${area?.total ? choice.votes / area.total * 100 : 0}%`; bar.append(fill); shareLine.append(bar, shareText); shareCell.append(shareLine);
      row.append(nameCell, votesCell, shareCell); body.append(row);
    }
    table.append(body); this.q('.summary-table').replaceChildren(table);
    this.q('.summary-total strong').textContent = area?.reporting.reported ? count.format(area.total) : '—';
  }

  currentTown() { return this.geo.towns.find(town => town.name === this.state.town || town.id === this.state.town); }
  hasWards() {
    const town = this.currentTown();
    return Boolean(town && Object.values(this.areas).some(area => area.kind === 'ward' && area.town === town.name && this.geoById.has(area.id)));
  }

  getRegions() {
    if (!this.state.town) return this.geo.towns.map(feature => ({ ...feature, record: this.areas[feature.id] }));
    const town = this.currentTown();
    if (!town) return [];
    const ward = this.state.ward;
    if (this.state.layer === 'ward' && !ward && this.hasWards()) {
      return this.geo.wards.filter(feature => feature.town === town.name).map(feature => ({ ...feature, record: this.areas[feature.id] }));
    }
    const covered = new Set();
    const units = Object.values(this.areas).filter(area => area.kind === 'precinct' && area.town === town.name);
    const regions = [];
    for (const record of units) {
      const shapes = (record.geometryIds || [record.id]).map(id => this.geoById.get(id)).filter(Boolean);
      if (ward && !shapes.every(shape => String(shape.ward) === String(ward))) continue;
      const rings = shapes.flatMap(shape => shape.rings);
      if (!rings.length) continue;
      shapes.forEach(shape => covered.add(shape.id));
      regions.push({ id: record.id, name: record.name, rings, centroid: midpoint(rings), record });
    }
    for (const feature of this.geo.precincts) {
      if (feature.town !== town.name || covered.has(feature.id) || (ward && String(feature.ward) !== String(ward))) continue;
      regions.push({ ...feature, record: undefined });
    }
    return regions.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }

  renderMap() {
    const focusedRegion = document.activeElement?.getAttribute('data-region');
    if (!this.hasWards()) { this.state.layer = 'precinct'; this.state.ward = null; }
    this.regions = this.getRegions();
    this.regionsById = new Map(this.regions.map(region => [region.id, region]));
    if (!this.regionsById.has(this.state.selected)) this.state.selected = null;
    if (!this.regionsById.has(this.state.hover)) this.state.hover = null;
    const mapKey = `${this.state.town}|${this.state.layer}|${this.state.ward}|${this.regions.map(region => region.id).join(',')}`;
    const changed = this.mapKey !== mapKey;
    if (changed) {
      this.mapKey = mapKey;
      this.paths.clear(); this.shapeGroup.replaceChildren();
      for (const region of this.regions) {
        const path = svgNode('path', { class: 'region-path', 'fill-rule': 'evenodd', role: 'button', tabindex: this.paths.size ? -1 : 0, 'data-region': region.id });
        path.addEventListener('pointerenter', event => { if (event.pointerType === 'touch' || this.dragged || this.pointers.size) return; this.state.hover = region.id; this.tooltipPoint = { x: event.clientX, y: event.clientY }; this.paintSelection(); this.renderTooltip(); });
        path.addEventListener('pointermove', event => { if (event.pointerType === 'mouse' && !this.pointers.size) { this.tooltipPoint = { x: event.clientX, y: event.clientY }; this.positionTooltip(); } });
        path.addEventListener('pointerleave', event => { if (event.pointerType === 'touch' || this.pointers.size) return; this.state.hover = null; this.paintSelection(); this.renderTooltip(); });
        path.addEventListener('focus', () => { for (const item of this.paths.values()) item.setAttribute('tabindex', item === path ? 0 : -1); this.state.hover = region.id; this.tooltipPoint = null; this.paintSelection(); this.renderTooltip(); });
        path.addEventListener('blur', () => { this.state.hover = null; this.paintSelection(); this.renderTooltip(); });
        path.addEventListener('keydown', event => {
          if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const paths = [...this.paths.values()], at = paths.indexOf(path);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? paths.length - 1 : (at + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + paths.length) % paths.length;
            paths[next]?.focus({ preventScroll: true });
          }
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.activateRegion(region.id, true); }
          if (event.key === 'Escape') { this.state.selected = null; this.state.hover = null; this.paintSelection(); this.renderTooltip(); }
        });
        this.shapeGroup.append(path); this.paths.set(region.id, path);
      }
      const allRings = this.regions.flatMap(region => [...region.rings, ...(!this.state.town ? region.populationRings || [] : [])]);
      const [left, top, right, bottom] = extent(allRings);
      const pad = Math.max(right - left, bottom - top) * .055;
      this.baseBox = [left - pad, top - pad, right - left + pad * 2, bottom - top + pad * 2];
      this.svg.setAttribute('viewBox', this.baseBox.join(' '));
      this.resetZoom();
      if (focusedRegion && this.paths.has(focusedRegion)) this.paths.get(focusedRegion).focus({ preventScroll: true });
    }
    this.renderMapControls();
    this.paintPaths();
    this.paintSelection();
    this.renderLegend();
    this.renderAreaOptions();
    this.renderTooltip();
  }

  renderMapControls() {
    const town = this.currentTown();
    const wardLabel = town?.wardLabel || 'Wards';
    const title = !town ? 'Rhode Island' : this.state.ward ? `${town.name} · ${wardLabel === 'Council districts' ? 'District' : 'Ward'} ${this.state.ward}` : town.name;
    this.q('.map-heading h3').textContent = title;
    const back = this.q('.map-back');
    back.hidden = !this.state.ward && (!this.state.town || this.id !== 'governor');
    back.textContent = this.state.ward ? `← ${town?.name} ${wardLabel.toLowerCase()}` : '← All Rhode Island towns';
    const first = this.q('[data-view="first"]'), second = this.q('[data-view="second"]');
    this.q('.map-view-buttons').hidden = Boolean(this.state.ward) || Boolean(town && !this.hasWards());
    first.textContent = town ? 'Precincts' : 'Geographic';
    second.textContent = town ? wardLabel : 'Population';
    const secondSelected = town ? this.state.layer === 'ward' : this.state.mode === 'population';
    first.setAttribute('aria-pressed', String(!secondSelected)); second.setAttribute('aria-pressed', String(secondSelected));
    second.disabled = !town && this.geo.towns.some(feature => !feature.populationRings?.length);

  }

  tieFill(colors) {
    const key = colors.join(',');
    if (!this.tiePatterns.has(key)) {
      const id = `${this.id}-tie-${this.tiePatterns.size}`;
      const pattern = svgNode('pattern', { id, width: colors.length * 4, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
      colors.forEach((color, index) => pattern.append(svgNode('rect', { x: index * 4, y: 0, width: 4, height: 8, fill: color })));
      this.definitions.append(pattern); this.tiePatterns.set(key, id);
    }
    return `url(#${this.tiePatterns.get(key)})`;
  }

  paintPaths() {
    for (const region of this.regions) {
      const path = this.paths.get(region.id);
      const fraction = this.state.town ? 0 : this.state.morph;
      path.setAttribute('d', pathData(region.rings, region.populationRings, fraction));
      const lead = leadOf(region.record);
      const fill = !lead ? '#deded9' : lead.tie ? this.tieFill(leaderColors(region.record, this.contest.choices)) : tint(this.contest.choices[lead.index]?.color, .25 + .68 * Math.min(lead.margin / .4, 1));
      path.setAttribute('fill', fill);
      path.classList.toggle('is-unmatched', !region.record);
      const description = !region.record ? `${region.name}: ${region.notice || 'no matching reporting unit'}` : !region.record.total ? `${region.name}: ${region.record.reporting.reported ? 'reported zero valid votes' : 'no votes reported'}` : `${region.name}: ${lead.tie ? 'tied' : `${this.contest.choices[lead.index].name} leads`}, ${count.format(region.record.total)} valid votes`;
      path.setAttribute('aria-label', description);
    }
    this.paintSelection();
    this.labelGroup.replaceChildren();
    if (!this.state.town) {
      for (const region of this.regions.filter(item => ['Providence', 'Warwick', 'Newport', 'Westerly'].includes(item.name))) {
        const point = region.centroid || midpoint(region.rings), target = region.populationCentroid || point;
        const x = point[0] + (target[0] - point[0]) * this.state.morph;
        const y = point[1] + (target[1] - point[1]) * this.state.morph;
        const label = svgNode('text', { class: 'region-label', x, y: y - this.baseBox[3] * .008, 'font-size': this.baseBox[2] * .019 });
        label.style.fontSize = `${this.baseBox[2] * .019}px`;
        label.textContent = region.name; this.labelGroup.append(label);
      }
    }
  }

  paintSelection() {
    this.highlightGroup.replaceChildren();
    const active = this.state.hover || this.state.selected;
    for (const [id, path] of this.paths) {
      path.setAttribute('aria-pressed', String(id === this.state.selected));
      if (id === active) {
        // Paint the full outline after every polygon. Neighboring fills cannot
        // cover half of a shared border as they can with the shape's own stroke.
        this.highlightGroup.append(svgNode('path', { d: path.getAttribute('d'), class: 'region-outline', 'fill-rule': 'evenodd' }));
        path.setAttribute('aria-describedby', this.tooltip.id);
      } else path.removeAttribute('aria-describedby');
    }
    this.q('.area-select').value = this.state.selected || '';
  }

  renderLegend() {
    const legend = this.q('.map-legend'); legend.replaceChildren();
    legend.append(node('span', 'legend-label', 'Leading'));
    for (const choice of this.contest.choices.filter(choice => !/write.?in/i.test(choice.name))) {
      const item = node('span', 'legend-item'), swatch = node('span', 'legend-swatch');
      const color = safeColor(choice.color);
      swatch.style.background = `linear-gradient(to right, ${tint(color, .25)}, ${tint(color, .93)})`;
      item.append(swatch, node('span', '', choice.name.split(' ').at(-1))); legend.append(item);
    }
    for (const [label, className] of [['No results', 'legend-empty'], ['Tie', 'legend-tie']]) {
      const item = node('span', 'legend-item'), swatch = node('span', `legend-swatch ${className}`);
      if (label === 'Tie') {
        item.title = 'Stripes use the tied leaders’ colors in each area.';
      }
      item.append(swatch, node('span', '', label)); legend.append(item);
    }
    legend.append(node('span', 'legend-strength', 'Darker = larger lead'));
    if (!this.state.town && this.state.mode === 'population') legend.append(node('span', 'legend-population', `Area: ${this.geo.populationYear || 2025} population`));
  }

  renderAreaOptions() {
    const select = this.q('.area-select');
    const focused = document.activeElement === select;
    const options = [new Option(this.state.town ? 'Choose a reporting area' : 'Choose a city or town', '')];
    for (const region of this.regions) options.push(new Option(region.name, region.id));
    select.replaceChildren(...options); select.value = this.state.selected || '';
    if (focused) select.focus({ preventScroll: true });
  }

  activeRegion() { return this.regionsById.get(this.state.hover || this.state.selected); }
  canDrill(region) {
    if (!region?.record) return false;
    if (!this.state.town && region.record.kind === 'town') return this.geo.precincts.some(precinct => precinct.town === region.name);
    if (region.record.kind === 'ward' && !this.state.ward) {
      const ward = region.record.ward ?? this.geoById.get(region.id)?.ward;
      return this.geo.precincts.some(precinct => precinct.town === this.state.town && String(precinct.ward) === String(ward));
    }
    return false;
  }

  clearTooltip() {
    this.state.selected = null; this.state.hover = null;
    this.tooltip.hidden = true; this.paintSelection();
  }

  positionTooltip() {
    if (this.tooltip.hidden || this.section.hidden) return;
    const region = this.activeRegion(), shape = region && this.paths.get(region.id);
    const bounds = shape?.getBoundingClientRect() || this.svg.getBoundingClientRect();
    const point = this.tooltipPoint || { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    const popup = this.tooltip.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
    const width = viewport?.width || window.innerWidth, height = viewport?.height || window.innerHeight;
    let x = point.x + 18, y = point.y + 18;
    if (x + popup.width > left + width - 12) x = point.x - popup.width - 18;
    if (y + popup.height > top + height - 12) y = point.y - popup.height - 18;
    this.tooltip.style.left = `${clamp(x, left + 12, Math.max(left + 12, left + width - popup.width - 12))}px`;
    this.tooltip.style.top = `${clamp(y, top + 12, Math.max(top + 12, top + height - popup.height - 12))}px`;
  }

  renderTooltip() {
    const region = this.activeRegion();
    const panel = this.tooltip;
    panel.hidden = !region || this.section.hidden;
    if (panel.hidden) return;
    const record = region.record;
    const heading = node('h4', '', region.name); heading.id = `${this.id}-tooltip-heading`;
    panel.replaceChildren(heading);
    const pinned = Boolean(this.state.selected && !this.state.hover);
    panel.classList.toggle('is-pinned', pinned);
    panel.setAttribute('role', pinned ? 'region' : 'tooltip');
    panel.setAttribute('aria-labelledby', heading.id);
    if (!record) panel.append(node('p', 'tooltip-note', region.notice || 'No results reported for this map area.'));
    else {
      if (record.geometryIds?.length > 1) panel.append(node('p', 'tooltip-note', 'Combined reporting area'));
      if (!record.reporting.reported) panel.append(node('p', 'tooltip-note', 'Awaiting results'));
      const votes = node('div', 'tooltip-votes');
      for (const choice of sortedChoices(this.contest, record)) {
        const row = node('div', 'tooltip-vote'), label = node('span', 'tooltip-choice'), swatch = node('span', 'legend-dot');
        swatch.style.setProperty('--choice-color', safeColor(choice.color));
        label.append(swatch, node('span', '', choice.name));
        row.append(label, node('span', '', record.reporting.reported ? count.format(choice.votes) : '—'), node('strong', '', percentage(choice.votes, record.total))); votes.append(row);
      }
      panel.append(votes);
      const totals = node('div', 'tooltip-total'); totals.append(node('span', '', 'Votes reported'), node('strong', '', record.reporting.reported ? count.format(record.total) : '—')); panel.append(totals);
      const methods = node('div', 'tooltip-methods');
      for (const [key, label] of [['electionDay', 'Election Day'], ['early', 'Early'], ['mail', 'Mail']]) {
        const item = node('span', '', label); item.append(node('strong', '', record.reporting.reported ? count.format(total(record.methods[key])) : '—')); methods.append(item);
      }
      panel.append(methods);
      if (record.unmappedVotes > 0) panel.append(node('p', 'tooltip-note', `${count.format(record.unmappedVotes)} votes have no precinct location.`));
      if (this.state.selected && this.canDrill(region)) {
        const drill = node('button', 'tooltip-drill', 'View precincts →'); drill.type = 'button'; drill.addEventListener('click', () => this.drill(region)); panel.append(drill);
      }
    }
    this.positionTooltip();
  }

  activateRegion(id, twoStep) {
    const region = this.regionsById.get(id); if (!region) return;
    if (this.canDrill(region) && (!twoStep || this.state.selected === id)) { this.drill(region); return; }
    if (!this.canDrill(region) && (!twoStep || this.state.selected === id)) this.zoomToRegion(region);
    this.state.selected = id; this.state.hover = null; this.paintSelection(); this.renderTooltip();
  }

  zoomToRegion(region) {
    const [left, top, right, bottom] = extent(region.rings);
    const [bx, by, bw, bh] = this.baseBox;
    this.state.zoom = clamp(Math.min(bw / Math.max(1, right - left), bh / Math.max(1, bottom - top)) * .8, 1, 8);
    this.state.pan = [this.state.zoom * (bx + bw / 2 - (left + right) / 2), this.state.zoom * (by + bh / 2 - (top + bottom) / 2)];
    this.applyTransform();
  }

  drill(region) {
    if (!this.canDrill(region)) return;
    if (region.record.kind === 'town') { this.state.town = region.name; this.state.layer = 'precinct'; this.state.ward = null; }
    else this.state.ward = region.record.ward ?? this.geoById.get(region.id)?.ward;
    this.state.selected = null; this.state.hover = null; this.renderMap();
    this.q('.map-back').focus({ preventScroll: true });
  }

  goBack() {
    if (this.state.ward) this.state.ward = null;
    else if (this.id === 'governor') this.state.town = null;
    this.state.selected = null; this.state.hover = null;
    this.renderMap(); this.q('.area-select').focus({ preventScroll: true });
  }

  switchView(second) {
    if (this.state.town) { this.state.layer = second ? 'ward' : 'precinct'; this.state.selected = null; this.state.hover = null; this.renderMap(); return; }
    this.state.mode = second ? 'population' : 'geographic'; this.renderMapControls(); this.renderLegend();
    const start = this.state.morph, end = second ? 1 : 0;
    if (this.frame) cancelAnimationFrame(this.frame);
    if (motionPreference.matches) { this.state.morph = end; this.paintPaths(); return; }
    const begun = performance.now();
    const animate = now => {
      const elapsed = clamp((now - begun) / 750, 0, 1);
      const easing = elapsed < .5 ? 4 * elapsed ** 3 : 1 - (-2 * elapsed + 2) ** 3 / 2;
      this.state.morph = start + (end - start) * easing; this.paintPaths();
      this.frame = elapsed < 1 ? requestAnimationFrame(animate) : null;
    };
    this.frame = requestAnimationFrame(animate);
  }

  resetZoom() { this.state.zoom = 1; this.state.pan = [0, 0]; this.applyTransform(); }
  zoomBy(factor) { this.state.zoom = clamp(this.state.zoom * factor, 1, 8); this.applyTransform(); }
  applyTransform() {
    if (!this.baseBox) return;
    const [left, top, width, height] = this.baseBox, cx = left + width / 2, cy = top + height / 2;
    this.state.pan[0] = clamp(this.state.pan[0], -width * (this.state.zoom - 1) / 2, width * (this.state.zoom - 1) / 2);
    this.state.pan[1] = clamp(this.state.pan[1], -height * (this.state.zoom - 1) / 2, height * (this.state.zoom - 1) / 2);
    this.mapGroup.setAttribute('transform', `translate(${cx + this.state.pan[0]} ${cy + this.state.pan[1]}) scale(${this.state.zoom}) translate(${-cx} ${-cy})`);
    this.q('[data-zoom="out"]').disabled = this.state.zoom <= 1;
    this.q('[data-zoom="in"]').disabled = this.state.zoom >= 8;
  }

  coordinates(event) { const matrix = this.svg.getScreenCTM(); const point = new DOMPoint(event.clientX, event.clientY); return matrix ? point.matrixTransform(matrix.inverse()) : point; }
  installPointerHandling() {
    this.svg.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      this.pointers.set(event.pointerId, this.coordinates(event));
      this.svg.setPointerCapture(event.pointerId);
      this.state.hover = null; this.tooltip.hidden = true;
      if (this.pointers.size === 1) {
        this.dragged = false;
        this.gesture = { start: this.coordinates(event), clientX: event.clientX, clientY: event.clientY, pan: [...this.state.pan], region: event.target.closest('[data-region]')?.getAttribute('data-region'), pointerType: event.pointerType };
      } else {
        const [a, b] = [...this.pointers.values()];
        this.dragged = true;
        this.pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.state.zoom };
      }
    });
    this.svg.addEventListener('pointermove', event => {
      if (!this.pointers.has(event.pointerId)) return;
      const point = this.coordinates(event); this.pointers.set(event.pointerId, point);
      if (this.pointers.size > 1 && this.pinch) {
        const [a, b] = [...this.pointers.values()];
        this.state.zoom = clamp(this.pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, this.pinch.distance), 1, 8); this.applyTransform(); return;
      }
      if (!this.gesture) return;
      if (Math.hypot(event.clientX - this.gesture.clientX, event.clientY - this.gesture.clientY) > 7) this.dragged = true;
      if (this.dragged) { this.state.pan = [this.gesture.pan[0] + point.x - this.gesture.start.x, this.gesture.pan[1] + point.y - this.gesture.start.y]; this.applyTransform(); }
    });
    const finish = (event, cancelled) => {
      if (!this.pointers.has(event.pointerId)) return;
      this.pointers.delete(event.pointerId);
      if (this.svg.hasPointerCapture(event.pointerId)) this.svg.releasePointerCapture(event.pointerId);
      if (!this.pointers.size) {
        if (!cancelled && !this.dragged && this.gesture?.region) { this.tooltipPoint = { x: event.clientX, y: event.clientY }; this.activateRegion(this.gesture.region, this.gesture.pointerType !== 'mouse'); }
        else if (!this.dragged) this.clearTooltip();
        this.gesture = null; this.pinch = null; this.dragged = false;
      } else if (this.gesture) { this.dragged = true; }
    };
    this.svg.addEventListener('pointerup', event => finish(event, false));
    this.svg.addEventListener('pointercancel', event => finish(event, true));
    this.svg.addEventListener('lostpointercapture', event => { if (this.pointers.has(event.pointerId)) finish(event, true); });
  }
}

const params = new URLSearchParams(location.search);
const mode = 'live';
let feed, lastSnapshot;
let lastStatus = { kind: 'loading', message: 'Preparing results…', mode }, freshnessTimer;
const views = new Map();
let selectedContest = Object.hasOwn(titles, params.get('contest')) ? params.get('contest') : Object.hasOwn(titles, location.hash.slice(1)) ? location.hash.slice(1) : 'governor';
function selectContest() {
  for (const [id, view] of views) { view.toggleRaceMenu(false); view.section.hidden = id !== selectedContest; view.clearTooltip(); }
}
function onStatus(status) {
  lastStatus = status;
  renderStatus();
}
function renderStatus() {
  const status = lastStatus;
  const freshness = describeFreshness({ snapshot: lastSnapshot, status, connected: !!CONFIG.endpoint });
  const indicator = document.getElementById('results-live-indicator');
  indicator.hidden = !status.updating;
  indicator.setAttribute('aria-label', status.mode === 'mock' ? 'Automatic simulation checks are enabled' : 'Automatic results checks are enabled');
  indicator.title = 'Automatic checks are enabled. See the last verified time below.';
  document.getElementById('results-status').dataset.kind = status.kind;
  const message = status.message || LIVE_MESSAGE;
  const messageElement = document.getElementById('status-message');
  if (messageElement.textContent !== message) messageElement.textContent = message;
  const note = document.getElementById('results-freshness');
  note.hidden = !freshness.text;
  if (note.textContent !== freshness.text) note.textContent = freshness.text;
  note.title = freshness.title;
  note.dataset.lastVerified = status.lastChecked || '';
  note.dataset.sourceUpdated = lastSnapshot?.sourceUpdated || '';
}
function onSnapshot(snapshot) {
  lastSnapshot = snapshot;
  for (const [id, view] of views) view.update(snapshot.contests[id], snapshot);
}
function updateURL() {
  const url = new URL(location.href);
  url.searchParams.delete('mode'); url.searchParams.delete('scenario');
  if (selectedContest === 'governor') url.searchParams.delete('contest'); else url.searchParams.set('contest', selectedContest);
  url.hash = '';
  history.replaceState(null, '', url);
}

async function initialize() {
  try {
    const response = await fetch(CONFIG.geographyUrl);
    if (!response.ok) throw new Error(`Maps could not be loaded (${response.status}).`);
    const geography = await response.json();
    if (!Array.isArray(geography.towns) || !Array.isArray(geography.precincts) || !Array.isArray(geography.wards)) throw new Error('The map file is incomplete.');
    for (const id of ['governor', 'mayor', 'question7']) { const view = new ContestView(id, geography); views.set(id, view); document.getElementById('contests').append(view.section); }
    selectContest();
    document.getElementById('results-loading').hidden = true;
    feed = createFeed({ onSnapshot, onStatus });
    await feed.start();
  } catch (error) {
    document.getElementById('results-loading').hidden = true;
    onStatus({ kind: 'error', mode, updating: false, lastChecked: null, message: LIVE_MESSAGE });
    console.error('Results viewer:', error);
  }
}
function startFreshnessClock() {
  clearInterval(freshnessTimer);
  freshnessTimer = setInterval(() => { if (!document.hidden) renderStatus(); }, 15_000);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) renderStatus(); });
window.addEventListener('pagehide', () => { clearInterval(freshnessTimer); feed?.stop(); });
window.addEventListener('pageshow', event => { if (event.persisted) { startFreshnessClock(); feed?.start(); } });
startFreshnessClock();
initialize();
