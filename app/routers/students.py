import csv
from io import StringIO
from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from .. import crud, models, schemas
from ..database import SessionLocal
from typing import List, Optional


router = APIRouter(prefix="/students", tags=["students"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    if not student.name or not student.student_class:
        raise HTTPException(status_code=400, detail="Name and Class are required")
    return crud.create_student(db, student)

@router.post("/bulk-upload/")
async def bulk_upload_students(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    csv_file = StringIO(content.decode("utf-8"))
    reader = csv.DictReader(csv_file)

    added_students = []

    for row in reader:
        name = row.get("name")
        student_class = row.get("student_class")
        if not name or not student_class:
            continue  # Skip invalid rows

        student_data = schemas.StudentCreate(name=name, student_class=student_class)
        student = crud.create_student(db, student_data)
        added_students.append(student)

    return {"message": f"Successfully added {len(added_students)} students."}

@router.get("/", response_model=List[schemas.Student])
def read_students(
    id: Optional[int] = Query(None),
    name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Student)

    if id is not None:
        query = query.filter(models.Student.id == id)
    if name is not None:
        query = query.filter(models.Student.name.ilike(f"%{name}%"))  # case-insensitive partial match

    students = query.options(joinedload(models.Student.drives)).all()
    
    response = []
    for student in students:
        student_data = schemas.Student.from_orm(student)
        if student.vaccinated and student.drives:
            # Get most recent drive
            latest_drive = max(student.drives, key=lambda d: d.drive_date)
            student_data.vaccination_details = schemas.VaccinationDetail(
                vaccine_name=latest_drive.vaccine_name,
                drive_date=latest_drive.drive_date
            )
        response.append(student_data)
    
    return response

# @router.get("/", response_model=List[schemas.Student])
# def read_students(db: Session = Depends(get_db)):
#     return crud.get_students(db)

from fastapi import HTTPException
from .. import models

# 🧬 Mark Student as Vaccinated in a Specific Drive
@router.post("/{student_id}/vaccinate/{drive_id}")
def vaccinate_student(
    student_id: int,
    drive_id: int,
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    drive = db.query(models.Drive).filter(models.Drive.id == drive_id).first()

    if not student or not drive:
        raise HTTPException(status_code=404, detail="Student or Drive not found.")

    # Check if student is already marked for this drive
    if drive in student.drives:
        raise HTTPException(status_code=400, detail="Student already vaccinated for this drive.")

    # Enforce: One student should not be vaccinated for same vaccine twice
    existing_vaccine = any(
        d.vaccine_name == drive.vaccine_name for d in student.drives
    )
    if existing_vaccine:
        raise HTTPException(status_code=400, detail="Student already vaccinated with this vaccine.")

    # Link student and drive
    student.drives.append(drive)
    student.vaccinated = True
    db.commit()

    return {"message": "Student vaccinated successfully."}

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}