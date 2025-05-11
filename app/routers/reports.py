from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import csv
import io

from ..database import SessionLocal
from .. import models

router = APIRouter(prefix="/reports", tags=["reports"])

# DB Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get Report (with optional filter)
@router.get("/")
def get_report(
    vaccine_name: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(models.Student, models.Drive)\
        .join(models.Student.drives)\
        .filter(models.Student.vaccinated == True)

    if vaccine_name:
        query = query.filter(models.Drive.vaccine_name.ilike(f"%{vaccine_name}%"))

    results = query.offset(skip).limit(limit).all()

    report = []
    for student, drive in results:
        report.append({
            "student_name": student.name,
            "class": student.student_class,
            "vaccine_name": drive.vaccine_name,
            "vaccination_date": drive.drive_date.isoformat()
        })

    return {
        "count": len(report),
        "results": report
    }

@router.get("/download/csv")
def download_csv_report(
    vaccine_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Student, models.Drive)\
        .join(models.Student.drives)\
        .filter(models.Student.vaccinated == True)

    if vaccine_name:
        query = query.filter(models.Drive.vaccine_name.ilike(f"%{vaccine_name}%"))

    results = query.all()

    # CSV file in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student Name", "Class", "Vaccine Name", "Vaccination Date"])

    for student, drive in results:
        writer.writerow([
            student.name,
            student.student_class,
            drive.vaccine_name,
            drive.drive_date.isoformat()
        ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=report.csv"
    return response
