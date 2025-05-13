import random
from datetime import datetime, timedelta
from faker import Faker
import argparse
import os

# Initialize Faker
fake = Faker()

def generate_fake_data(count):
    # Initialize the SQL parts
    player_header = f"-- Generated LEDA player fake data on {datetime.now().strftime('%Y-%m-%d')}\n\n"
    player_header += """INSERT INTO public.leda_player_info ("ledaId", "lastName", "firstName", "middleInitial", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "gender", "dateOfBirth")\nVALUES\n"""
    
    membership_header = f"-- Generated LEDA membership fake data on {datetime.now().strftime('%Y-%m-%d')}\n\n"
    membership_header += """INSERT INTO public.leda_membership_info ("ledaId", "establishedDate", "badStanding", "badStandingReason", "takeOffMailing", "mailStandings", "formOnFile", "needsMemberCard", "inactiveDate", "lastMembershipFeePayment", "lastTrailsDate", "memberType", "cannotBeCaptain", "lifetimeMember", "lifetimeMemberReason")\nVALUES\n"""
    
    player_values = []
    membership_values = []
    
    # Generate player and membership data with matching ledaIds
    for leda_id in range(1, count + 1):
        # Generate player info
        last_name = fake.last_name()
        first_name = fake.first_name()
        middle_initial = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        address_one = fake.street_address()
        address_two = fake.secondary_address() if random.random() > 0.7 else "NULL"
        city = fake.city()
        state = fake.state_abbr()
        zip_code = fake.zipcode()
        phone_number = ''.join(filter(str.isdigit, fake.phone_number()))[:10]
        other_number = ''.join(filter(str.isdigit, fake.phone_number()))[:10] if random.random() > 0.6 else "NULL"
        email = fake.email()
        gender = random.choice(["Male", "Female", "Other"])
        
        # Generate birthdate (adults between 18-80 years old)
        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=80)
        birth_date_str = birth_date.strftime("%Y-%m-%d")
        
        # Create player value row
        player_value = f"""    ({leda_id}, '{last_name}', '{first_name}', '{middle_initial}', '{address_one}', {'NULL' if address_two == 'NULL' else f"'{address_two}'"}, '{city}', '{state}', '{zip_code}', '{phone_number}', {'NULL' if other_number == 'NULL' else f"'{other_number}'"}, '{email}', '{gender}', '{birth_date_str}')"""
        
        # Add comma if it's not the last row
        if leda_id < count:
            player_value += ","
        
        player_values.append(player_value)
        
        # Generate membership info
        establish_date = fake.date_between(start_date="-10y", end_date="today")
        establish_date_str = establish_date.strftime("%Y-%m-%d")
        bad_standing = random.random() < 0.1  # 10% chance of bad standing
        bad_standing_reason = f"'{fake.sentence()}'" if bad_standing else "NULL"
        take_off_mailing = random.choice([True, False])
        mail_standings = random.choice([True, False])
        form_on_file = random.choice([True, False])
        needs_member_card = random.choice([True, False])
        
        # Keep inactive_date as datetime object or None
        inactive_date = fake.date_between(start_date=establish_date, end_date="today") if random.random() < 0.15 else None
        inactive_date_str = inactive_date.strftime("%Y-%m-%d") if inactive_date else "NULL"
        
        last_membership_fee_payment = 'UNPAID - NEW PLAYER'
        
        # Use establish_date as datetime object directly
        last_trails_date = fake.date_between(start_date=establish_date, end_date="today")
        last_trails_date_str = last_trails_date.strftime("%Y-%m-%d")
        
        member_type = random.choice(["BAR", "EMP", "GST", "MEM", "OTH", "SPO"])
        cannot_be_captain = random.random() < 0.05  # 5% chance
        lifetime_member = random.random() < 0.1  # 10% chance
        lifetime_member_reason = f"'{fake.sentence()}'" if lifetime_member else "NULL"
        
        # Create membership value row
        membership_value = f"""    ({leda_id}, '{establish_date_str}', {str(bad_standing).lower()}, {bad_standing_reason}, {str(take_off_mailing).lower()}, {str(mail_standings).lower()}, {str(form_on_file).lower()}, {str(needs_member_card).lower()}, {inactive_date_str if inactive_date_str == 'NULL' else f"'{inactive_date_str}'"}, '{last_membership_fee_payment}', '{last_trails_date_str}', '{member_type}', {str(cannot_be_captain).lower()}, {str(lifetime_member).lower()}, {lifetime_member_reason})"""
        
        # Add comma if it's not the last row
        if leda_id < count:
            membership_value += ","
        
        membership_values.append(membership_value)
    
    # Construct final SQL statements
    player_sql = player_header + "\n".join(player_values) + ";"
    membership_sql = membership_header + "\n".join(membership_values) + ";"
    
    return player_sql, membership_sql

def main():
    count = int(input("Enter the number of records to generate: "))
    
    # Create output directory if it doesn't exist
    output_dir = "c:/Users/tyler/Projects/LEDA-ProjectPortal/Tools/Random Data Creation/output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Define two separate output files
    player_output_file = f"{output_dir}/leda_player_data.sql"
    membership_output_file = f"{output_dir}/leda_membership_data.sql"
    
    # Get SQL statements
    player_sql, membership_sql = generate_fake_data(count)
    
    # Write player data to file
    with open(player_output_file, 'w') as f:
        f.write(player_sql)
    
    # Write membership data to file
    with open(membership_output_file, 'w') as f:
        f.write(membership_sql)
    
    print(f"Generated {count} records and saved to:")
    print(f"  - Player data: {player_output_file}")
    print(f"  - Membership data: {membership_output_file}")

if __name__ == "__main__":
    main()
