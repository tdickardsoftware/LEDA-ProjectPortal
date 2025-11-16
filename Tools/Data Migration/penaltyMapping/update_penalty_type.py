import csv

# Penalty code to description mapping
penalty_code_map = {
    'L': 'Late Score Sheet',
    'N': 'Weekly Fee',
    'T': 'Team Fee',
    'I': 'Incorrect Funds',
    'C': 'Paid With Cash',
    'F': 'No Form',
    'X': 'Illegal Player',
    '#': 'Call Office',
    'B': 'Bounced Check',
    'M': 'Membership Fee',
    'P': 'Pending',
    'O': 'Other',
}

input_file = 'Working/leda_penalty_points_export.csv'
output_file = 'Working/leda_penalty_points_export_UPDATED.csv'

with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
    writer.writeheader()
    for row in reader:
        code = row['Penalty Code Letter'].strip().upper()
        if code in penalty_code_map:
            row['Penalty Type'] = penalty_code_map[code]
        writer.writerow(row)
