import csv
from pathlib import Path
from datetime import datetime, date
import argparse
import sys

REQUIRED_PLAYER_TEXT_FIELDS = [
    "lastName", "firstName", "addressOne", "city", "state", "zip",
    "phoneNumber", "email", "gender"
]
REQUIRED_MEMBERSHIP_TEXT_FIELDS = [
    "lastMembershipFeePayment", "memberType"
]
PLACEHOLDER_DATE = date(1900, 1, 1)

DATE_INPUT_FORMATS = [
    "%m/%d/%Y %H:%M:%S",
    "%m/%d/%Y %H:%M",
    "%m/%d/%Y",
]

def parse_date(raw: str, required: bool) -> str | None:
    if not raw or raw.strip() == "":
        return PLACEHOLDER_DATE.isoformat() if required else None
    raw = raw.strip()
    for fmt in DATE_INPUT_FORMATS:
        try:
            dt = datetime.strptime(raw, fmt)
            return dt.date().isoformat()
        except ValueError:
            continue
    # If still not parsed, attempt to split and take date part
    try:
        # Some values like '1/10/1900 0:00:00'
        part = raw.split()[0]
        for fmt in ("%m/%d/%Y", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(part, fmt)
                return dt.date().isoformat()
            except ValueError:
                pass
    except Exception:
        pass
    return PLACEHOLDER_DATE.isoformat() if required else None

def to_bool(raw: str) -> bool:
    if raw is None:
        return False
    s = str(raw).strip().lower()
    if s in {"1", "true", "t", "yes", "y"}:
        return True
    return False

def clean_text(val: str | None, required: bool) -> str:
    if val is None:
        return "UNKNOWN" if required else ""
    v = val.strip()
    if v == "":
        return "UNKNOWN" if required else ""
    return v

def sql_escape(val: str) -> str:
    return val.replace("'", "''")

def build_player_record(row: dict) -> dict:
    # Fallback logic for phone numbers
    primary_phone_candidates = [row.get("Telephone Number"), row.get("Work Phone"), row.get("Cell Phone Number"), row.get("Fax Number"), row.get("Pager Number")]
    primary_phone = next((p for p in primary_phone_candidates if p and p.strip()), None)
    other_phone_candidates = []
    if primary_phone:
        for p in primary_phone_candidates:
            if p and p.strip() and p != primary_phone:
                other_phone_candidates.append(p)
    other_phone = other_phone_candidates[0] if other_phone_candidates else row.get("Cell Phone Number") or row.get("Work Phone")

    dob = parse_date(row.get("Date of Birth", ""), required=True)

    first_name = clean_text(row.get("First Name"), True)
    middle_initial = clean_text(row.get("Middle Initial"), False)[:1]
    last_name = clean_text(row.get("Last Name"), True)
    
    # Build fullName: firstName + middleInitial (if provided) + lastName
    if middle_initial:
        full_name = f"{first_name} {middle_initial} {last_name}"
    else:
        full_name = f"{first_name} {last_name}"
    
    record = {
        "ledaId": row.get("ID Number"),
        "lastName": last_name,
        "firstName": first_name,
        "middleInitial": middle_initial,
        "fullName": full_name,
        "addressOne": clean_text(row.get("Address 1"), True),
        "addressTwo": clean_text(row.get("Address 2"), False),
        "city": clean_text(row.get("City"), True),
        "state": clean_text(row.get("State"), True),
        "zip": clean_text(row.get("Zip"), True),
        "phoneNumber": clean_text(primary_phone, True),
        "otherNumber": clean_text(other_phone, False) if other_phone else "",
        "email": clean_text(row.get("EMail Address"), True),
        "gender": clean_text(row.get("Gender"), True),
        "dateOfBirth": dob,
    }

    # Ensure required text fields not blank (middleInitial not required)
    for k in REQUIRED_PLAYER_TEXT_FIELDS:
        if record[k] == "":
            record[k] = "UNKNOWN"
    return record

def build_membership_record(row: dict) -> dict:
    established_date = parse_date(row.get("Establish Date", ""), required=True)
    inactive_date = parse_date(row.get("Inactivate Date", ""), required=False)
    trails_date = parse_date(row.get("Last Trails Date", ""), required=False)

    record = {
        "ledaId": row.get("ID Number"),
        "establishedDate": established_date,
        "badStanding": to_bool(row.get("Bad Standing", "0")),
        "badStandingReason": clean_text(row.get("Bad Standing Reason"), False),
        "takeOffMailing": to_bool(row.get("Take Off Mailing List", "0")),
        "mailStandings": to_bool(row.get("Mail Standings", "0")),
        "formOnFile": to_bool(row.get("Form On File", "0")),
        "needsMemberCard": to_bool(row.get("Needs Membership Card", "0")),
        "inactiveDate": inactive_date,
        "lastMembershipFeePayment": clean_text(row.get("Last Membership Fee Payment"), True),
        "lastTrailsDate": trails_date,
        "memberType": clean_text(row.get("People Type"), True).upper(),
        "cannotBeCaptain": to_bool(row.get("Can Not Be Captain", "0")),
        "lifetimeMember": to_bool(row.get("Lifetime Member", "0")),
        "lifetimeMemberReason": clean_text(row.get("Lifetime Member Reason"), False),
    }

    for k in REQUIRED_MEMBERSHIP_TEXT_FIELDS:
        if record[k] == "":
            record[k] = "UNKNOWN"
    return record

PLAYER_COLS = ["ledaId","lastName","firstName","middleInitial","fullName","addressOne","addressTwo","city","state","zip","phoneNumber","otherNumber","email","gender","dateOfBirth"]
MEMBERSHIP_COLS = ["ledaId","establishedDate","badStanding","badStandingReason","takeOffMailing","mailStandings","formOnFile","needsMemberCard","inactiveDate","lastMembershipFeePayment","lastTrailsDate","memberType","cannotBeCaptain","lifetimeMember","lifetimeMemberReason"]

def render_player_values(rec: dict) -> str:
    parts = []
    for c in PLAYER_COLS:
        v = rec[c]
        if v is None or v == "":
            parts.append("NULL")
        elif c == "ledaId":
            parts.append(str(v))
        else:
            parts.append(f"'{sql_escape(str(v))}'")
    return f"({', '.join(parts)})"

def render_membership_values(rec: dict) -> str:
    parts = []
    for c in MEMBERSHIP_COLS:
        v = rec[c]
        if c == "ledaId":
            parts.append(str(v))
        elif c in {"establishedDate", "inactiveDate", "lastTrailsDate"}:
            parts.append(f"'{v}'" if v else "NULL")
        elif c in {"badStanding","takeOffMailing","mailStandings","formOnFile","needsMemberCard","cannotBeCaptain","lifetimeMember"}:
            parts.append('TRUE' if v else 'FALSE')
        else:
            if v is None or v == "":
                parts.append("NULL")
            else:
                parts.append(f"'{sql_escape(str(v))}'")
    return f"({', '.join(parts)})"

def process(csv_path: Path, out_dir: Path, limit: int | None = None) -> None:
    player_values = []
    membership_values = []
    with csv_path.open(newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if limit is not None and i >= limit:
                break
            if not row.get("ID Number"):
                continue
            try:
                player_rec = build_player_record(row)
                membership_rec = build_membership_record(row)
                player_values.append(render_player_values(player_rec))
                membership_values.append(render_membership_values(membership_rec))
            except Exception as e:
                print(f"Row {i+1} (ID {row.get('ID Number')}): Error {e}", file=sys.stderr)
    out_dir.mkdir(parents=True, exist_ok=True)
    if player_values:
        player_sql = (
            f"INSERT INTO public.leda_player_info (\"{'\",\"'.join(PLAYER_COLS)}\")\nVALUES\n    "
            + ",\n    ".join(player_values)
            + ";"
        )
    else:
        player_sql = "-- No player records found"
    if membership_values:
        membership_sql = (
            f"INSERT INTO public.leda_membership_info (\"{'\",\"'.join(MEMBERSHIP_COLS)}\")\nVALUES\n    "
            + ",\n    ".join(membership_values)
            + ";"
        )
    else:
        membership_sql = "-- No membership records found"
    (out_dir / 'player_inserts.sql').write_text(player_sql, encoding='utf-8')
    (out_dir / 'membership_inserts.sql').write_text(membership_sql, encoding='utf-8')
    print(f"Wrote {len(player_values)} player rows and {len(membership_values)} membership rows (batched) to {out_dir}")


def main():
    parser = argparse.ArgumentParser(description="Generate SQL INSERTs for leda player & membership tables from CSV export.")
    parser.add_argument('--csv', help='CSV filename inside Working folder (default: auto-detect first *.csv)', default=None)
    parser.add_argument('--out', help='Output folder name (default: Output)', default='Output')
    parser.add_argument('--limit', type=int, help='Optional limit of rows to process', default=None)
    args = parser.parse_args()

    base_dir = Path(__file__).parent
    working_dir = base_dir / 'Working'
    if not working_dir.exists():
        raise SystemExit(f"Working directory not found: {working_dir}")

    if args.csv:
        csv_path = working_dir / args.csv
    else:
        csv_files = list(working_dir.glob('*.csv'))
        if not csv_files:
            raise SystemExit(f"No CSV files found in {working_dir}")
        csv_path = csv_files[0]

    if not csv_path.exists():
        raise SystemExit(f"CSV file not found: {csv_path}")

    out_dir = base_dir / args.out
    process(csv_path, out_dir, args.limit)

if __name__ == '__main__':
    main()