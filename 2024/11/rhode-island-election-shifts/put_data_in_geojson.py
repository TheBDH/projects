import geojson
from geojson import FeatureCollection, dump
import pandas as pd

df = pd.read_csv('municipality_data_NEW.csv')
data_vote_democratic_16 = df["2016 Clinton"].tolist()
data_vote_republican_16 = df["2016 Trump"].tolist()
data_vote_total_16 = df["2016 Total"].tolist()
data_vote_margin_16 = df["2016 Margin"].tolist()
data_vote_win_weighted_16 = df["2016 Win Weighted"].tolist()
data_vote_democratic_20 = df["2020 Biden"].tolist()
data_vote_republican_20 = df["2020 Trump"].tolist()
data_vote_total_20 = df["2020 Total"].tolist()
data_vote_margin_20 = df["2020 Margin"].tolist()
data_vote_win_weighted_20 = df["2020 Win Weighted"].tolist()
data_vote_democratic_24 = df["2024 Harris"].tolist()
data_vote_republican_24 = df["2024 Trump"].tolist()
data_vote_total_24 = df["2024 Total"].tolist()
data_vote_margin_24 = df["2024 Margin"].tolist()
data_vote_win_weighted_24 = df["2024 Win Weighted"].tolist()
data_voter_swing_16_20_shift = df["2016->20 Shift"].tolist()
data_voter_swing_16_20_shift_weighted = df["16->20 Shift weighted"].tolist()
data_voter_swing_20_24_shift = df["2020->24 Shift"].tolist()
data_voter_swing_20_24_shift_weighted = df["20->24 Shift weighted"].tolist()
data_vote_percent_margin_16 = df["2016 Percent Margin"].tolist()
data_vote_percent_margin_20 = df["2020 Percent Margin"].tolist()
data_vote_percent_margin_24 = df["2024 Percent Margin"].tolist()
data_vote_percent_swing_16_20 = df["2016->2020_Margin_Shift"].tolist()
data_vote_percent_swing_16_24 = df["2016->2024_Margin_Shift"].tolist()
data_vote_percent_swing_20_24 = df["2020->2024_Margin_Shift"].tolist()


path_to_file = 'RI_Municipality_GeoJSON.geojson'
with open(path_to_file) as f:
    data_geojson = geojson.load(f)
sorted_data_geojson = (sorted(data_geojson["features"], key=lambda x: x["properties"]["NAME20"]))
print(type(sorted_data_geojson))
for i in range(len(sorted_data_geojson)):
    sorted_data_geojson[i]['properties']["VOTE_DEMOCRATIC_16"] = data_vote_democratic_16[i]
    sorted_data_geojson[i]['properties']["VOTE_REPUBLICAN_16"] = data_vote_republican_16[i]
    sorted_data_geojson[i]['properties']["VOTE_TOTAL_16"] = data_vote_total_16[i]
    sorted_data_geojson[i]['properties']["VOTE_MARGIN_16"] = data_vote_margin_16[i]
    sorted_data_geojson[i]['properties']["VOTE_WIN_WEIGHTED_16"] = data_vote_win_weighted_16[i]
    sorted_data_geojson[i]['properties']["VOTE_DEMOCRATIC_20"] = data_vote_democratic_20[i]
    sorted_data_geojson[i]['properties']["VOTE_REPUBLICAN_20"] = data_vote_republican_20[i]
    sorted_data_geojson[i]['properties']["VOTE_TOTAL_20"] = data_vote_total_20[i]
    sorted_data_geojson[i]['properties']["VOTE_MARGIN_20"] = data_vote_margin_20[i]
    sorted_data_geojson[i]['properties']["VOTE_WIN_WEIGHTED_20"] = data_vote_win_weighted_20[i]
    sorted_data_geojson[i]['properties']["VOTE_DEMOCRATIC_24"] = data_vote_democratic_24[i]
    sorted_data_geojson[i]['properties']["VOTE_REPUBLICAN_24"] = data_vote_republican_24[i]
    sorted_data_geojson[i]['properties']["VOTE_TOTAL_24"] = data_vote_total_24[i]
    sorted_data_geojson[i]['properties']["VOTE_MARGIN_24"] = data_vote_margin_24[i]
    sorted_data_geojson[i]['properties']["VOTE_WIN_WEIGHTED_24"] = data_vote_win_weighted_24[i]
    sorted_data_geojson[i]['properties']['VOTE_SHIFT_16_20'] = data_voter_swing_16_20_shift[i]
    sorted_data_geojson[i]['properties']['VOTE_SHIFT_20_24'] = data_voter_swing_20_24_shift[i]
    sorted_data_geojson[i]['properties']['VOTE_SHIFT_WEIGHTED_16_20'] = data_voter_swing_16_20_shift_weighted[i]
    sorted_data_geojson[i]['properties']['VOTE_SHIFT_WEIGHTED_20_24'] = data_voter_swing_20_24_shift_weighted[i]

    sorted_data_geojson[i]['properties']['VOTE_PERCENT_MARGIN_16'] = data_vote_percent_margin_16[i]
    sorted_data_geojson[i]['properties']['VOTE_PERCENT_MARGIN_20'] = data_vote_percent_margin_20[i]
    sorted_data_geojson[i]['properties']['VOTE_PERCENT_MARGIN_24'] = data_vote_percent_margin_24[i]
    sorted_data_geojson[i]['properties']['VOTE_PERCENT_SWING_16_20'] = data_vote_percent_swing_16_20[i]
    sorted_data_geojson[i]['properties']['VOTE_PERCENT_SWING_16_24'] = data_vote_percent_swing_16_24[i]
    sorted_data_geojson[i]['properties']['VOTE_PERCENT_SWING_20_24'] = data_vote_percent_swing_20_24[i]

feature_collection = FeatureCollection(sorted_data_geojson)

with open("RI_Municipality_PERCENT_MARGINS_ADDED_GeoJSON.geojson", "w") as jsonFile:
    dump(feature_collection, jsonFile)
