from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from datetime import date, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_students = db.query(models.Student).count()
    vaccinated_students = db.query(models.Student).filter(models.Student.vaccinated == True).count()
    percentage = (vaccinated_students / total_students * 100) if total_students else 0

    today = date.today()
    next_30_days = today + timedelta(days=30)

    upcoming_drives = db.query(models.Drive)\
        .filter(models.Drive.drive_date >= today)\
        .all()

    return {
        "total_students": total_students,
        "vaccinated_students": vaccinated_students,
        "vaccinated_percentage": round(percentage, 2),
        "upcoming_drives": [
            {
                "id": drive.id,
                "vaccine_name": drive.vaccine_name,
                "drive_date": drive.drive_date.isoformat(),
                "doses_available": drive.doses_available,
                "applicable_classes": drive.applicable_classes
            } for drive in upcoming_drives
        ]
    }
