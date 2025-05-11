from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StudentBase(BaseModel):
    name: str
    student_class: str

class StudentCreate(StudentBase):
    pass

class VaccinationDetail(BaseModel):
    vaccine_name: str
    drive_date: date

class Student(StudentBase):
    id: int
    vaccinated: bool
    vaccination_details: Optional[VaccinationDetail] = None
    
    class Config:
        from_attributes = True

class DriveBase(BaseModel):
    vaccine_name: str
    drive_date: date
    doses_available: int
    applicable_classes: str

class DriveCreate(DriveBase):
    pass

class Drive(DriveBase):
    id: int
    students: List[Student] = []
    class Config:
        model_config = {
        "from_attributes": True
    }

