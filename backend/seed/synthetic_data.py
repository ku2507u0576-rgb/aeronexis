from __future__ import annotations
import random
import math
from datetime import datetime, timedelta

def generate_synthetic_data(start_date: str, days: int = 30) -> list[dict]:
    """Generates realistic synthetic Indian airfare data."""
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    
    airports = ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU"]
    airlines = {
        "6E": {"name": "IndiGo", "tier": 1.0, "prob": 0.57},
        "AI": {"name": "Air India", "tier": 1.15, "prob": 0.20},
        "SG": {"name": "SpiceJet", "tier": 0.92, "prob": 0.12},
        "IX": {"name": "Air India Express", "tier": 0.88, "prob": 0.08},
        "QP": {"name": "Akasa Air", "tier": 0.95, "prob": 0.03}
    }
    
    routes = {
        ("DEL", "BOM"): {"base": random.randint(3500, 5500), "dist": 1400},
        ("BOM", "DEL"): {"base": random.randint(3500, 5500), "dist": 1400},
        ("DEL", "BLR"): {"base": random.randint(4200, 6800), "dist": 2100},
        ("BLR", "DEL"): {"base": random.randint(4200, 6800), "dist": 2100},
        ("BOM", "BLR"): {"base": random.randint(2800, 4500), "dist": 670},
        ("DEL", "HYD"): {"base": random.randint(3800, 6000), "dist": 1700},
        ("BLR", "HYD"): {"base": random.randint(2500, 4000), "dist": 570},
        ("MAA", "DEL"): {"base": random.randint(4500, 7200), "dist": 2200},
        ("DEL", "CCU"): {"base": random.randint(3600, 5800), "dist": 1450},
        ("MAA", "BOM"): {"base": random.randint(3200, 5200), "dist": 1300},
    }
    
    advance_days_list = [1, 7, 15, 30, 45]
    time_slots = ["06:00", "07:30", "09:00", "10:30", "12:00", "14:00", "16:00", "18:00", "20:00", "21:30"]
    sources = ["website", "MakeMyTrip", "Yatra", "EaseMyTrip", "Cleartrip", "Ixigo", "Goibibo"]
    aircraft_types = ["A320neo", "A321neo", "B737-800", "B737 MAX 8", "ATR 72"]
    
    quotes = []
    
    for day_offset in range(days):
        target_date = start_dt + timedelta(days=day_offset)
        target_date_str = target_date.strftime("%Y-%m-%d")
        dow = target_date.weekday()
        
        # S_dow
        if dow in [0, 4, 6]: s_dow = random.uniform(1.15, 1.25)
        elif dow in [1, 2]: s_dow = random.uniform(0.85, 0.90)
        else: s_dow = 1.0
        
        # S_season
        if target_date.month == 8: s_season = 0.90
        elif target_date.month == 9 and target_date.day <= 15: s_season = random.uniform(1.05, 1.15)
        else: s_season = 1.10
        
        for (origin, dest), route_data in routes.items():
            base_route = route_data["base"]
            
            for al_code, al_data in airlines.items():
                # Randomize if this airline flies this route today based on prob
                if random.random() > al_data["prob"] * 3: # Boost probability to ensure enough flights
                    continue
                
                tier_al = al_data["tier"]
                al_name = al_data["name"]
                
                for adv_days in advance_days_list:
                    collection_date = target_date - timedelta(days=adv_days)
                    if collection_date > datetime.now() + timedelta(days=365):
                        continue # future
                    
                    for slot in time_slots:
                        if random.random() < 0.3: continue # Not all slots have flights
                        
                        k = 0.3
                        noise = random.uniform(0.85, 1.15)
                        
                        base_fare_calc = base_route * math.exp(k/(adv_days+1)) * s_dow * s_season * tier_al * noise
                        base_fare = round(base_fare_calc, 2)
                        
                        airport_charge = random.randint(300, 600)
                        taxes = round((0.05 * base_fare) + airport_charge, 2)
                        
                        total_fare = round(base_fare + taxes, 2)
                        
                        hr, mn = map(int, slot.split(':'))
                        sched_dep = target_date.replace(hour=hr, minute=mn)
                        flight_dur = route_data["dist"] / 800.0 * 60 + 30 # roughly
                        sched_arr = sched_dep + timedelta(minutes=flight_dur)
                        
                        fl_num = f"{al_code}-{random.randint(100, 9999)}"
                        src = "website" if random.random() < 0.5 else random.choice(sources[1:])
                        
                        quote = {
                            "origin": origin,
                            "destination": dest,
                            "departure_date": target_date_str,
                            "return_date": None,
                            "advance_days": adv_days,
                            "airline_code": al_code,
                            "airline_name": al_name,
                            "base_fare": base_fare,
                            "taxes": taxes,
                            "user_dev_fee": 0.0,
                            "convenience_charge": 0.0 if src == "website" else round(random.uniform(200, 400), 2),
                            "total_fare": total_fare,
                            "fare_class": "Economy",
                            "flight_number": fl_num,
                            "scheduled_departure": sched_dep.isoformat(),
                            "scheduled_arrival": sched_arr.isoformat(),
                            "aircraft_type": random.choice(aircraft_types),
                            "source": src,
                            "collection_timestamp": collection_date.isoformat(),
                        }
                        # Add convenience charge to total if OTA
                        quote["total_fare"] = round(quote["total_fare"] + quote["convenience_charge"], 2)
                        
                        quotes.append(quote)

    # Introduce dirty data
    num_quotes = len(quotes)
    
    # 5% duplicates
    num_dupes = int(num_quotes * 0.05)
    for _ in range(num_dupes):
        quotes.append(random.choice(quotes).copy())
        
    # 2% outliers
    num_outliers = int(num_quotes * 0.02)
    for _ in range(num_outliers):
        q = random.choice(quotes)
        q["total_fare"] *= random.uniform(3.0, 5.0)
        q["base_fare"] *= random.uniform(3.0, 5.0)
        
    # 2% missing taxes
    num_missing = int(num_quotes * 0.02)
    for _ in range(num_missing):
        q = random.choice(quotes)
        q["taxes"] = None
        
    # 1% fare mismatches
    num_mismatch = int(num_quotes * 0.01)
    for _ in range(num_mismatch):
        q = random.choice(quotes)
        q["total_fare"] += random.uniform(500, 2000)

    return quotes
