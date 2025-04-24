import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin

BASE_URL = 'https://elpee.jp'
ARTIST_URL = urljoin(BASE_URL, '/artist/James%20Brown%20and%20The%20Famous%20Flames/')

def get_soup(url):
    resp = requests.get(url)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, 'html.parser')

def list_single_links(artist_soup):
    # same as before
    return {
        urljoin(BASE_URL, a['href'])
        for a in artist_soup.select('a[href^="/single/"]')
    }

def extract_weeks_of_chart(single_soup):
    # find EVERY list-group-item, then pick the one labeled "Weeks Of Chart"
    for item in single_soup.select('div.list-group-item'):
        label = item.select_one('div.col-6.text-start.fw-lighter')
        if label and label.get_text(strip=True) == 'Weeks Of Chart':
            value = item.select_one('div.col-6.text-end.fw-light span.font-weight-bold')
            if value and value.get_text(strip=True).isdigit():
                return int(value.get_text(strip=True))
    # if we never hit one, return 0
    return 0

def main():
    artist_soup = get_soup(ARTIST_URL)
    single_urls = sorted(list_single_links(artist_soup))
    total_weeks = 0

    for url in single_urls:
        print(f'Fetching {url}…')
        s_soup = get_soup(url)
        weeks = extract_weeks_of_chart(s_soup)
        print(f'  → Weeks On Hot 100: {weeks}')
        total_weeks += weeks

    print('\nTotal Weeks on Hot 100 for all singles:', total_weeks)

if __name__ == '__main__':
    main()
