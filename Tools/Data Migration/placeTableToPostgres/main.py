import csv
from pathlib import Path
from datetime import datetime, date
import argparse
import sys

REQUIRED_TEXT = [
    'name','addressOne','city','state','zip','phoneNumber','lastBarFeePayment','placeType'
]
PLACEHOLDER_DATE = date(1900,1,1).isoformat()
DATE_INPUT_FORMATS = [
    '%m/%d/%Y %H:%M:%S','%m/%d/%Y %H:%M','%m/%d/%Y'
]

def parse_date(raw: str, required: bool) -> str:
    if not raw or not raw.strip():
        return PLACEHOLDER_DATE if required else ''
    r = raw.strip()
    for fmt in DATE_INPUT_FORMATS:
        try:
            return datetime.strptime(r, fmt).date().isoformat()
        except ValueError:
            continue
    try:
        part = r.split()[0]
        for fmt in ('%m/%d/%Y','%Y-%m-%d'):
            try:
                return datetime.strptime(part, fmt).date().isoformat()
            except ValueError:
                pass
    except Exception:
        pass
    return PLACEHOLDER_DATE if required else ''

def to_bool(raw: str) -> bool:
    if raw is None:
        return False
    return str(raw).strip().lower() in {'1','true','t','yes','y'}

def clean(val: str | None, required: bool) -> str:
    if val is None:
        return 'UNKNOWN' if required else ''
    v = val.strip()
    if v == '':
        return 'UNKNOWN' if required else ''
    return v

def esc(val: str) -> str:
    return val.replace("'", "''")

def build_record(row: dict) -> dict:
    phone_primary = row.get('Telephone Number') or row.get('Fax Number') or ''
    other_number = row.get('Fax Number') if row.get('Fax Number') and row.get('Fax Number') != phone_primary else ''
    establish_date = parse_date(row.get('Establish Date',''), required=True)
    last_sanction = parse_date(row.get('Last Sanctioning Date',''), required=True)
    record = {
        'ledaId': row.get('ID Number') or '0',
        'name': clean(row.get('Place Name'), True),
        'addressOne': clean(row.get('Address 1'), True),
        'addressTwo': clean(row.get('Address 2'), False),
        'city': clean(row.get('City'), True),
        'state': clean(row.get('State'), True),
        'zip': clean(row.get('Zip'), True),
        'phoneNumber': clean(phone_primary, True),
        'otherNumber': clean(other_number, False),
        'email': clean(row.get('EMail Address'), False),
        'website': clean(row.get('Web Address'), False),
        'establishDate': establish_date,
        'memo': clean(row.get('Place Memo'), False),
        'numberOfBoards': int(row.get('Number of Dart Boards') or 0),
        'sendMailings': to_bool(row.get('Send Mailings','0')),
        'regularSponsor': to_bool(row.get('Regular Sponsor','0')),
        'currentSponsor': to_bool(row.get('Current Sponsor','0')),
        'issues': to_bool(row.get('Issues','0')),
        'lastBarFeePayment': clean(row.get('Last Bar Fee Payment'), True),
        'lastSanctioningDate': last_sanction,
        'contactId': int(row.get('Contact Id') or 0),
        'placeType': clean(row.get('Place Type'), True).upper(),
    }
    for k in REQUIRED_TEXT:
        if record[k] == '' or record[k] is None:
            record[k] = 'UNKNOWN'
    if not record['lastBarFeePayment']:
        record['lastBarFeePayment'] = 'UNKNOWN'
    if not record['lastSanctioningDate']:
        record['lastSanctioningDate'] = PLACEHOLDER_DATE
    return record

def record_values_sql(rec: dict) -> str:
    bool_map = lambda b: 'TRUE' if b else 'FALSE'
    vals = [
        rec['ledaId'],  # bigint
        f"'{esc(rec['name'])}'",
        f"'{esc(rec['addressOne'])}'",
        f"'{esc(rec['addressTwo'])}'" if rec['addressTwo'] else 'NULL',
        f"'{esc(rec['city'])}'",
        f"'{esc(rec['state'])}'",
        f"'{esc(rec['zip'])}'",
        f"'{esc(rec['phoneNumber'])}'",
        f"'{esc(rec['otherNumber'])}'" if rec['otherNumber'] else 'NULL',
        f"'{esc(rec['email'])}'" if rec['email'] else 'NULL',
        f"'{esc(rec['website'])}'" if rec['website'] else 'NULL',
        f"'{rec['establishDate']}'",
        f"'{esc(rec['memo'])}'" if rec['memo'] else 'NULL',
        str(rec['numberOfBoards']),
        bool_map(rec['sendMailings']),
        bool_map(rec['regularSponsor']),
        bool_map(rec['currentSponsor']),
        bool_map(rec['issues']),
        f"'{esc(rec['lastBarFeePayment'])}'",
        f"'{rec['lastSanctioningDate']}'",
        str(rec['contactId']),
        f"'{esc(rec['placeType']).upper()}'"
    ]
    return '(' + ','.join(vals) + ')'

def process(csv_path: Path, out_dir: Path, batch: int | None = None, encoding: str = 'utf-8-sig') -> None:
    rows_sql = []

    encodings_to_try = [encoding]
    if encoding == 'utf-8-sig':  # common fallback chain
        encodings_to_try.extend(['cp1252', 'latin-1'])

    last_error = None
    for enc in encodings_to_try:
        try:
            with csv_path.open(newline='', encoding=enc) as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    if not row.get('ID Number'):
                        continue
                    try:
                        rec = build_record(row)
                        rows_sql.append(record_values_sql(rec))
                    except Exception as e:
                        print(f"Row {idx+1} ID {row.get('ID Number')}: {e}", file=sys.stderr)
            if rows_sql:
                if enc != encoding:
                    print(f"Used fallback encoding '{enc}'", file=sys.stderr)
                break
        except UnicodeDecodeError as e:
            rows_sql.clear()
            last_error = e
            continue

    if not rows_sql:
        raise SystemExit(f"Failed to read CSV with tried encodings {encodings_to_try}. Last error: {last_error}")

    cols = ["ledaId","name","addressOne","addressTwo","city","state","zip","phoneNumber","otherNumber","email","website","establishDate","memo","numberOfBoards","sendMailings","regularSponsor","currentSponsor","issues","lastBarFeePayment","lastSanctioningDate","contactId","placeType"]
    insert_head = f"INSERT INTO public.leda_place_info (\"{'\",\"'.join(cols)}\") VALUES "
    full_sql = insert_head + ','.join(rows_sql) + ';'
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'place_inserts.sql').write_text(full_sql, encoding='utf-8')
    print(f"Wrote 1 multi-row INSERT with {len(rows_sql)} value sets to {(out_dir / 'place_inserts.sql')} ")

def main():
    parser = argparse.ArgumentParser(description='Generate multi-row INSERT for leda_place_info from CSV export.')
    parser.add_argument('--csv', help='CSV filename inside Working (auto-pick first if omitted)')
    parser.add_argument('--out', default='Output', help='Output directory name')
    parser.add_argument('--encoding', default='utf-8-sig', help='Preferred CSV encoding (fallbacks: cp1252, latin-1)')
    args = parser.parse_args()
    base = Path(__file__).parent
    working = base / 'Working'
    if not working.exists():
        raise SystemExit(f'Missing Working directory: {working}')
    if args.csv:
        csv_path = working / args.csv
    else:
        files = list(working.glob('*.csv'))
        if not files:
            raise SystemExit(f'No CSV files found in {working}')
        csv_path = files[0]
    if not csv_path.exists():
        raise SystemExit(f'CSV not found: {csv_path}')
    out_dir = base / args.out
    process(csv_path, out_dir, encoding=args.encoding)

if __name__ == '__main__':
    main()