from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

student_vaccination = Table(
    'student_vaccination',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('drive_id', Integer, ForeignKey('drives.id'))
)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    student_class = Column(String)
    vaccinated = Column(Boolean, default=False)

    drives = relationship("Drive", secondary=student_vaccination, back_populates="students")

class Drive(Base):
    __tablename__ = "drives"
    id = Column(Integer, primary_key=True, index=True)
    vaccine_name = Column(String)
    drive_date = Column(Date)
    doses_available = Column(Integer)
    applicable_classes = Column(String)

    students = relationship("Student", secondary=student_vaccination, back_populates="drives")
