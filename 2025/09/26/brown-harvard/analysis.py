import csv

def parse_score(score_str):
    # Score format: "7-30"
    try:
        brown, opp = map(int, score_str.split('-'))
        return brown, opp
    except Exception:
        return None, None

results = []
with open('/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/09/26/brown-harvard/brown_football_results.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        if len(row) < 6:
            continue
        year = row[0]
        opponent = row[3]
        result = row[4]
        score = row[5]
        brown_score, opp_score = parse_score(score)
        if brown_score is None or opp_score is None:
            continue
        if brown_score < opp_score:  # Only wins
            margin = brown_score - opp_score
            results.append({
                'year': year,
                'opponent': opponent,
                'result': result,
                'score': score,
                'margin': margin
            })

# Filter for games against Harvard
harvard_results = [game for game in results if 'Harvard' in game['opponent']]
# Sort by margin ascending (biggest losses), take top 20
top_20 = sorted(harvard_results, key=lambda x: x['margin'])[:20]

for game in top_20:
    print(f"{game['year']} vs {game['opponent']} ({game['result']} {game['score']}): margin {game['margin']}")