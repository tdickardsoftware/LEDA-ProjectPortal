import csv
import sys
import time

# --- Divisions processing ---
def read_divisions_csv(filepath):
    """Read division names from CSV file."""
    divisions = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # skip header
        for row in reader:
            if row:
                divisions.append(row[0])
    return divisions

def format_postgres_insert(divisions):
    """Format division names for Postgres insert."""
    insert_stmt = (
        'INSERT INTO maint.leda_maint_divisions ("divisionName") VALUES\n'
    )
    values = []
    for division in divisions:
        values.append(f"    ('{division}')")
    insert_stmt += ",\n".join(values) + ";"
    return insert_stmt

# --- Mentions processing ---
def read_mentions_csv(filepath):
    """Read mention types from CSV file."""
    mentions = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            mentions.append((
                row["Mention Code"],
                row["Description"],
                int(row["Points"]),
                row["Mention Basis"]
            ))
    return mentions

def format_mentions_insert(mentions):
    """Format mention types for Postgres insert."""
    insert_stmt = (
        'INSERT INTO maint.leda_maint_mentions ("mentionCode", "desc", points, "mentionBasis") VALUES\n'
    )
    values = []
    for code, desc, points, basis in mentions:
        code = code.replace("'", "''")
        desc = desc.replace("'", "''")
        basis = basis.replace("'", "''")
        values.append(f"    ('{code}', '{desc}', {points}, '{basis}')")
    insert_stmt += ",\n".join(values) + ";"
    return insert_stmt

# --- Payment Types processing ---
def read_payment_types_csv(filepath):
    """Read payment types from CSV file."""
    payment_types = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            payment_types.append((
                row["Payment Type"],
                row["Description Payment"]
            ))
    return payment_types

def format_payment_types_insert(payment_types):
    """Format payment types for Postgres insert."""
    insert_stmt = (
        'INSERT INTO maint.leda_maint_payment_types ("paymentType", "desc") VALUES\n'
    )
    values = []
    for payment_type, desc in payment_types:
        payment_type = payment_type.replace("'", "''")
        desc = desc.replace("'", "''")
        values.append(f"    ('{payment_type}', '{desc}')")
    insert_stmt += ",\n".join(values) + ";"
    return insert_stmt

# --- People Types processing ---
def read_people_types_csv(filepath):
    """Read people types from CSV file."""
    people_types = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            people_types.append((
                row["People Type Code"],
                row["People Type Description"]
            ))
    return people_types

def format_people_types_insert(people_types):
    """Format people types for Postgres insert."""
    insert_stmt = (
        'INSERT INTO maint.leda_maint_people_types ("peopleTypeCode", "desc") VALUES\n'
    )
    values = []
    for code, desc in people_types:
        code = code.replace("'", "''")
        desc = desc.replace("'", "''")
        values.append(f"    ('{code}', '{desc}')")
    insert_stmt += ",\n".join(values) + ";"
    return insert_stmt

# --- Place Types processing ---
def read_place_types_csv(filepath):
    """Read place types from CSV file."""
    place_types = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            place_types.append((
                row["Place Type Code"],
                row["Description"]
            ))
    return place_types

def format_place_types_insert(place_types):
    """Format place types for Postgres insert."""
    insert_stmt = (
        'INSERT INTO maint.leda_maint_place_types ("placeTypeCode", "desc") VALUES\n'
    )
    values = []
    for code, desc in place_types:
        code = code.replace("'", "''")
        desc = desc.replace("'", "''")
        values.append(f"    ('{code}', '{desc}')")
    insert_stmt += ",\n".join(values) + ";"
    return insert_stmt

# --- Progress bar ---
def show_progress_bar(current, total, bar_length=40):
    """Display a simple progress bar in the console."""
    percent = float(current) / total
    arrow = '-' * int(round(percent * bar_length)-1) + '>'
    spaces = ' ' * (bar_length - len(arrow))
    sys.stdout.write(f"\rProgress: [{arrow}{spaces}] {int(percent*100)}%")
    sys.stdout.flush()
    # For better visuals, you could use tqdm or similar libraries in the future.

