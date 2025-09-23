import requests
from bs4 import BeautifulSoup
import csv

def scrape_brown_harvard_history():
    url = "https://brownbears.com/sports/football/opponent-history/harvard/72"
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")
    if not table:
        return False
    headers = ['Date', 'Season', 'Location', 'Score', 'Media']
    rows = []
    for tr in table.find_all("tr")[1:]:
        cells = [td.get_text(strip=True) for td in tr.find_all("td")]
        if cells and cells != ['Skip Ad'] and len(cells) == 5:
            rows.append(cells)
    with open(
        "/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/09/26/brown-harvard/brown_harvard_history.csv",
        "w", newline="", encoding="utf-8"
    ) as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return True

def scrape_brown_football_results():
    base_url = "https://brownbears.com/sports/football/results/print/{}/overall"
    years = range(1878, 2025)  # Adjust range as needed
    all_games = []
    for year in years:
        url = base_url.format(year)
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        table = soup.find("table")
        if not table:
            continue
        for tr in table.find_all("tr")[1:]:
            tds = tr.find_all("td")
            if len(tds) < 6:
                continue
            date = tds[0].get_text(strip=True)
            home_away = tds[1].get_text(strip=True)
            opponent = tds[2].get_text(strip=True)
            result = tds[3].get_text(strip=True)
            score = tds[4].get_text(strip=True)
            location = tds[5].get_text(strip=True)
            all_games.append([year, date, home_away, opponent, result, score, location])
    with open(
        "/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/09/26/brown-harvard/brown_football_results.csv",
        "w", newline="", encoding="utf-8"
    ) as f:
        writer = csv.writer(f)
        writer.writerow(["Year", "Date", "Home/Away", "Opponent", "Result", "Score", "Location"])
        writer.writerows(all_games)
    return True

if __name__ == "__main__":
    scrape_brown_harvard_history()
    scrape_brown_football_results()
