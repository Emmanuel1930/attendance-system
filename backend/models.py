from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True)   # e.g. CSC/2021/001
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    matric_number = db.Column(db.String(30))
    password = db.Column(db.String(50))
    level = db.Column(db.String(10))                      # 100, 200, 300, 400
    department = db.Column(db.String(100))

class Lecturer(db.Model):
    __tablename__ = 'lecturers'
    id = db.Column(db.Integer, primary_key=True)
    lecturer_id = db.Column(db.String(20), unique=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    department = db.Column(db.String(100))
    password = db.Column(db.String(50))

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True)   # e.g. CSC 401
    course_name = db.Column(db.String(150))
    units = db.Column(db.Integer)
    level = db.Column(db.String(10))
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.id'))

class AttendanceSession(db.Model):
    __tablename__ = 'attendance_sessions'
    id = db.Column(db.Integer, primary_key=True)
    session_code = db.Column(db.String(64), unique=True)  # unique token embedded in QR
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturers.id'))
    date = db.Column(db.Date)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)       # False = session closed

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=True)
    name = db.Column(db.String(100))
    matric_number = db.Column(db.String(30))
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.id'))
    timestamp = db.Column(db.DateTime)
    status = db.Column(db.String(10), default='present')  # present / absent
    # UNIQUE CONSTRAINT: one record per matric_number per session (prevents duplicate scan)
    __table_args__ = (db.UniqueConstraint('matric_number', 'session_id'),)

class QRCodeLog(db.Model):
    __tablename__ = 'qr_code_logs'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.id'))
    qr_token = db.Column(db.String(128))                  # what's encoded in the QR
    generated_at = db.Column(db.DateTime)
    valid_until = db.Column(db.DateTime)                  # session end time
