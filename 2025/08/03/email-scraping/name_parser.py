import csv
import re

input_file = '/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/08/03/email-scraping/names.csv'
output_file = '/Users/calebellenberg/Stuffs/Brown/Clubs/BDH/Github Repos/projects/projects/2025/08/03/email-scraping/formatted_names.csv'

def reformat_name(name):
    # Handles "Last, First" -> "First Last"
    if ',' in name:
        last, first = [part.strip() for part in name.split(',', 1)]
        name = f"{first} {last}"
    else:
        name = name.strip()
    # Remove periods after single-letter middle initials
    name = re.sub(r'(?<=\s)([A-Z])\.(?=\s|$)', r'\1', name)
    return name

with open(input_file, newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    for row in reader:
        if row:
            formatted = [reformat_name(row[0])]
            writer.writerow(formatted)