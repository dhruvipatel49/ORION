from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import requests
import math
from datetime import date
from sqlalchemy import create_engine, Column, String, Float, Boolean, Integer
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

# ==========================================
# 1. DATABASE CONFIGURATION
# ==========================================
DATABASE_URL = "sqlite:///./orion_vault.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AsteroidReport(Base):
    __tablename__ = "asteroid_intelligence"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_hazardous = Column(Boolean)
    diameter_km = Column(Float)
    mass_kg = Column(Float)
    velocity_km_s = Column(Float)
    miss_distance_km = Column(Float)
    tnt_megatons = Column(Float)
    survives_atmosphere = Column(Boolean)
    crater_diameter_km = Column(Float)
    severity_classification = Column(String)
    trajectory_status = Column(String)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 2. DATA SYNCHRONIZATION 
# ==========================================
def automated_nasa_sync():
    today_str = str(date.today())
    print(f"⏰ ALARM: Background sync starting for current date: {today_str}")
    db = SessionLocal()
    try:
        nasa_url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={today_str}&end_date={today_str}&api_key=DEMO_KEY"
        response = requests.get(nasa_url)
        space_data = response.json()
        
        asteroids_today = space_data["near_earth_objects"][today_str]
        saved_count = 0

        for item in asteroids_today:
            name = item["name"]
            existing = db.query(AsteroidReport).filter(AsteroidReport.name == name).first()
            if existing:
                continue

            # Geometry & Mass
            dia_min = item["estimated_diameter"]["kilometers"]["estimated_diameter_min"]
            dia_max = item["estimated_diameter"]["kilometers"]["estimated_diameter_max"]
            avg_dia = (dia_min + dia_max) / 2
            radius_m = (avg_dia * 1000) / 2
            volume = (4/3) * math.pi * (radius_m ** 3)
            mass = volume * 3000 
            
            # Kinematics
            speed = float(item["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"])
            v_m_s = speed * 1000
            energy_j = 0.5 * mass * (v_m_s ** 2)
            tnt = energy_j / (4.184 * (10 ** 15))
            miss_dist = float(item["close_approach_data"][0]["miss_distance"]["kilometers"])

            # Planetary Defense (Ablation)
            diameter_meters = avg_dia * 1000
            if diameter_meters < 35:
                survives = False
                crater_size = 0.0
                severity = "Atmospheric Dissipation (Airburst Only)"
            else:
                survives = True
                crater_size = (11.6 * (tnt ** 0.25)) / 1000  
                if tnt < 10: severity = "Localized Ground Strike"
                elif tnt < 1000: severity = "Regional Disaster"
                elif tnt < 100000: severity = "Continental Cataclysm"
                else: severity = "Global Extinction Event"

            # Trajectory Intercept Algorithm
            EARTH_RADIUS_KM = 6371
            ATMOSPHERE_KM = 100
            LUNAR_DISTANCE_KM = 384400

            surface_miss_distance = miss_dist - EARTH_RADIUS_KM

            if surface_miss_distance <= 0:
                trajectory = "🚨 DIRECT COLLISION COURSE"
            elif surface_miss_distance <= ATMOSPHERE_KM:
                trajectory = "⚠️ ATMOSPHERIC GRAZE"
            elif surface_miss_distance <= LUNAR_DISTANCE_KM:
                trajectory = "🟡 CISLUNAR INTERSECT (Inside Moon Orbit)"
            else:
                trajectory = "🟢 DEEP SPACE FLYBY"

            new_report = AsteroidReport(
                name=name,
                is_hazardous=item["is_potentially_hazardous_asteroid"],
                diameter_km=round(avg_dia, 3),
                mass_kg=round(mass, 2),
                velocity_km_s=round(speed, 2),
                miss_distance_km=round(miss_dist, 2),
                tnt_megatons=round(tnt, 2),
                survives_atmosphere=survives,
                crater_diameter_km=round(crater_size, 2),
                severity_classification=severity,
                trajectory_status=trajectory
            )
            db.add(new_report)
            saved_count += 1
            
        db.commit()
        print(f"✅ SUCCESS: Processed {saved_count} advanced trajectory calculations.")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    finally:
        db.close()

# ==========================================
# 3. LIFECYCLE MANAGEMENT & MIDDLEWARE
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(automated_nasa_sync, 'interval', seconds=15)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(title="ORION Space Hazard Platform", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/vaulted-asteroids")
def get_vaulted_asteroids(db: Session = Depends(get_db)):
    return db.query(AsteroidReport).all()