from sqlalchemy.orm import Session
from . import models, schemas
from fastapi import HTTPException
from datetime import date

def create_student(db: Session, student: schemas.StudentCreate):
    if not student.name or not student.student_class:
        raise HTTPException(status_code=400, detail="Name and Class are required")
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_students(db: Session):
    return db.query(models.Student).all()

def create_drive(db: Session, drive: schemas.DriveCreate):
    today = date.today()
    if (drive.drive_date - today).days < 15:
        raise HTTPException(status_code=400, detail="Drives must be scheduled at least 15 days in advance.")

    # Prevent overlapping drives on the same day
    overlapping = db.query(models.Drive).filter(models.Drive.drive_date == drive.drive_date).first()
    if overlapping:
        raise HTTPException(status_code=400, detail="A drive is already scheduled on this date.")
    
    if not drive.name or not drive.drive_date:
        raise HTTPException(status_code=400, detail="Drive name and Date are required")
    
    db_drive = models.Drive(**drive.dict())
    db.add(db_drive)
    db.commit()
    db.refresh(db_drive)
    return db_drive

def get_upcoming_drives(db: Session, today):
    return db.query(models.Drive).filter(models.Drive.drive_date >= today).all()
