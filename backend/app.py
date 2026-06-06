from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, Student, Lecturer, Course, AttendanceSession, AttendanceRecord
from routes.auth import auth_bp
from routes.sessions import sessions_bp
from routes.qr import qr_bp
from routes.attendance import attendance_bp
from routes.admin import admin_bp
from routes.courses import courses_bp
from datetime import datetime, timedelta

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app) # Allow all origins for production
    
    db.init_app(app)
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
    app.register_blueprint(qr_bp, url_prefix='/api/qr')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    
    with app.app_context():
        db.create_all()
        seed_database()
        
    return app

def seed_database():
    if Lecturer.query.first() is not None:
        return
        
    dr_emeka = Lecturer(
        lecturer_id="LECT/001",
        name="Dr. Emeka Nwosu",
        email="lecturer@run.edu.ng",
        department="Computer Science"
    )
    db.session.add(dr_emeka)
    db.session.commit()
    
    csc401 = Course(course_code="CSC 401", course_name="Software Engineering", units=3, level="400", lecturer_id=dr_emeka.id)
    csc403 = Course(course_code="CSC 403", course_name="Computer Networks", units=3, level="400", lecturer_id=dr_emeka.id)
    csc405 = Course(course_code="CSC 405", course_name="Artificial Intelligence", units=2, level="400", lecturer_id=dr_emeka.id)
    db.session.add_all([csc401, csc403, csc405])
    db.session.commit()
    
    adebayo = Student(
        student_id="CSC/2021/001",
        name="Adebayo Okonkwo",
        email="student@run.edu.ng",
        matric_number="CSC/2021/001",
        password="student123",
        level="400",
        department="Computer Science"
    )
    db.session.add(adebayo)
    db.session.commit()
    
    def create_past_sessions(course, held, attended):
        for i in range(held):
            past_date = datetime.now() - timedelta(days=held-i)
            session = AttendanceSession(
                session_code=f"dummy_code_{course.course_code}_{i}",
                course_id=course.id,
                lecturer_id=dr_emeka.id,
                date=past_date.date(),
                start_time=past_date,
                end_time=past_date + timedelta(hours=2),
                is_active=False
            )
            db.session.add(session)
            db.session.commit()
            
            if i < attended:
                record = AttendanceRecord(
                    student_id=adebayo.id,
                    name=adebayo.name,
                    matric_number=adebayo.student_id,
                    session_id=session.id,
                    timestamp=past_date + timedelta(minutes=15),
                    status='present'
                )
                db.session.add(record)
                db.session.commit()

    create_past_sessions(csc401, 8, 7)
    create_past_sessions(csc403, 6, 4)
    create_past_sessions(csc405, 5, 5)

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
