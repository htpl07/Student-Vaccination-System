from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from pydantic import ValidationError

from .. import models, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/drives", tags=["drives"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create Vaccination Drive
@router.post("/", response_model=schemas.Drive)
def create_drive(drive: schemas.DriveCreate, db: Session = Depends(get_db)):
    today = date.today()
    try:
        today = date.today()
        
        if not drive.vaccine_name or not drive.drive_date:
            raise HTTPException(
                status_code=422,
                detail={"message": "Vaccine name and date are required"}
            )
            
        if (drive.drive_date - today).days < 15:
            raise HTTPException(
                status_code=422,
                detail={"message": "Drives must be scheduled at least 15 days in advance"}
            )

        overlapping = db.query(models.Drive).filter(models.Drive.drive_date == drive.drive_date).first()
        if overlapping:
            raise HTTPException(
                status_code=422,
                detail={"message": "A drive is already scheduled on this date"}
            )

        db_drive = models.Drive(**drive.dict())
        db.add(db_drive)
        db.commit()
        db.refresh(db_drive)
        return db_drive

    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

# Get All Drives
@router.get("/", response_model=List[schemas.Drive])
def get_all_drives(db: Session = Depends(get_db)):
    return db.query(models.Drive).all()

# Get Only Upcoming Drives
@router.get("/upcoming", response_model=List[schemas.Drive])
def get_upcoming_drives(db: Session = Depends(get_db)):
    today = date.today()
    upcoming_drives = db.query(models.Drive)\
        .filter(
            models.Drive.drive_date >= today,
            models.Drive.drive_date <= today + timedelta(days=30)
        )\
        .order_by(models.Drive.drive_date.asc())\
        .all()
    
    return upcoming_drives


# Update Drive
@router.put("/{drive_id}", response_model=schemas.Drive)
def update_drive(drive_id: int, updated_data: schemas.DriveCreate, db: Session = Depends(get_db)):
    drive = db.query(models.Drive).filter(models.Drive.id == drive_id).first()

    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    if drive.drive_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot edit past drives.")

    # Prevent another drive on the same day (except this one)
    conflict = db.query(models.Drive)\
        .filter(models.Drive.drive_date == updated_data.drive_date)\
        .filter(models.Drive.id != drive_id)\
        .first()

    if conflict:
        raise HTTPException(status_code=400, detail="Another drive is already scheduled on that date.")

    if (updated_data.drive_date - date.today()).days < 15:
        raise HTTPException(status_code=400, detail="Drives must be scheduled at least 15 days in advance.")

    # Apply updates
    drive.vaccine_name = updated_data.vaccine_name
    drive.drive_date = updated_data.drive_date
    drive.doses_available = updated_data.doses_available
    drive.applicable_classes = updated_data.applicable_classes

    db.commit()
    db.refresh(drive)
    return drive
