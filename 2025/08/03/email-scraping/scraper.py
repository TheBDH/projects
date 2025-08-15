import requests
from bs4 import BeautifulSoup
import re
import time
import csv

BASE_URL = "https://directory.brown.edu"

EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@brown\.edu")

def search_name(name):
    params = {
        "search_string": name
    }
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(BASE_URL, params=params, headers=headers)
    response.raise_for_status()
    return response.text

def extract_emails_from_html(html):
    soup = BeautifulSoup(html, "html.parser")
    emails = set()

    # Handle Cloudflare email protection
    for span in soup.find_all("span", class_="__cf_email__"):
        data_cfemail = span.get("data-cfemail")
        if data_cfemail:
            def decode_cfemail(cfemail):
                r = int(cfemail[:2], 16)
                email = ''.join(
                    chr(int(cfemail[i:i+2], 16) ^ r)
                    for i in range(2, len(cfemail), 2)
                )
                return email
            email = decode_cfemail(data_cfemail)
            if email.endswith("@brown.edu"):
                emails.add(email)

    # Also check for mailto links as before
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("mailto:") and href.endswith("@brown.edu"):
            email = href.replace("mailto:", "").strip()
            emails.add(email)

    return emails

def find_emails_for_names(names, wait=0.1):
    results = {}
    for name in names:
        html = search_name(name)
        found = extract_emails_from_html(html)
        if found:
            results[name] = found
            print(f"Emails found for {name}: {found}")
        else:
            results[name] = {"No results found"}
            print(f"No emails found for {name}")
        time.sleep(wait)
    return results

if __name__ == "__main__":
    input_names = []
    with open("/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/08/03/email-scraping/formatted_names.csv", newline='') as csvfile:
        reader = csv.reader(csvfile)
        for i, row in enumerate(reader):
            if i >= 750:
                break
            if row:  # skip empty rows
                input_names.append(row[0])
    print("Starting email search...")
    results = find_emails_for_names(input_names)
    print("\nFinal results:")
    for name, emails in results.items():
        print(f"{name}: {', '.join(emails)}")
    for name, emails in results.items():
        print(emails)
    # Save results to a CSV file
    with open("/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/08/03/email-scraping/email_results.csv", "w", newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(["Name", "Emails"])
        for name, emails in results.items():
            writer.writerow([name, ", ".join(emails)])
