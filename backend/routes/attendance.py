from flask import Blueprint, request, jsonify
from models import db, AttendanceSession, AttendanceRecord, Course, Student
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/scan', methods=['POST'])
def scan_attendance():
    data = request.json
    qr_token = data.get('qr_token')
    student_id = data.get('student_id')
    
    session = AttendanceSession.query.filter_by(session_code=qr_token).first()
    
    if not session:
        return jsonify({ 'success': False, 'message': 'Invalid QR code. Please scan the correct code' }), 400
    
    if not session.is_active:
        return jsonify({ 'success': False, 'message': 'This session is no longer active' }), 400
    
    existing = AttendanceRecord.query.filter_by(
        student_id=student_id,
        session_id=session.id
    ).first()
    
    if existing:
        return jsonify({ 'success': False, 'message': 'You have already been marked present for this session' }), 409
    
    record = AttendanceRecord(
        student_id=student_id,
        session_id=session.id,
        timestamp=datetime.now(),
        status='present'
    )
    db.session.add(record)
    db.session.commit()
    
    course = Course.query.get(session.course_id)
    return jsonify({
        'success': True,
        'message': 'Attendance Recorded!',
        'course_name': f"{course.course_code} {course.course_name}",
        'timestamp': record.timestamp.strftime('%I:%M %p')
    })

@attendance_bp.route('/student/<int:student_id>', methods=['GET'])
def student_attendance(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404
        
    courses = Course.query.all()
    result = []
    
    for course in courses:
        sessions = AttendanceSession.query.filter_by(course_id=course.id).all()
        sessions_held = len(sessions)
        
        session_ids = [s.id for s in sessions]
        sessions_attended = AttendanceRecord.query.filter(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.session_id.in_(session_ids)
        ).count() if session_ids else 0
        
        percentage = round((sessions_attended / sessions_held) * 100, 1) if sessions_held > 0 else 100.0
        
        result.append({
            'course_id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name,
            'sessions_held': sessions_held,
            'sessions_attended': sessions_attended,
            'percentage': percentage
        })
        
    return jsonify({'success': True, 'records': result})

@attendance_bp.route('/student/<int:student_id>/history', methods=['GET'])
def student_history(student_id):
    records = db.session.query(AttendanceRecord, AttendanceSession, Course).join(
        AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id
    ).join(
        Course, AttendanceSession.course_id == Course.id
    ).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(AttendanceRecord.timestamp.desc()).all()
    
    result = []
    for r, s, c in records:
        result.append({
            'id': r.id,
            'date': s.date.strftime('%b %d, %Y'),
            'course': f"{c.course_code} {c.course_name}",
            'time': r.timestamp.strftime('%I:%M %p'),
            'status': r.status,
            'week': f"Week {s.date.isocalendar()[1]}"
        })
        
    return jsonify({'success': True, 'history': result})

@attendance_bp.route('/submit', methods=['POST'])
def submit_attendance():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    matric_number = data.get('matric_number')
    session_token = data.get('session_token')
    
    if not name or not matric_number or not session_token or not email:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
    if not (email.endswith('@gmail.com') or email.endswith('@run.edu.ng')):
        return jsonify({'success': False, 'message': 'Email must be @gmail.com or @run.edu.ng'}), 400
        
    session = AttendanceSession.query.filter_by(session_code=session_token).first()
    
    if not session:
        return jsonify({ 'success': False, 'message': 'Invalid session code.' }), 400
    
    if not session.is_active:
        return jsonify({ 'success': False, 'message': 'This session is no longer active' }), 400
    
    existing = AttendanceRecord.query.filter_by(
        matric_number=matric_number,
        session_id=session.id
    ).first()
    
    if existing:
        return jsonify({ 'success': False, 'message': 'You are already marked present for this session' }), 409
    
    record = AttendanceRecord(
        name=name,
        matric_number=matric_number,
        session_id=session.id,
        timestamp=datetime.now(),
        status='present'
    )
    db.session.add(record)
    
    existing_student = Student.query.filter_by(email=email).first()
    if not existing_student:
        new_student = Student(
            name=name,
            email=email,
            student_id=matric_number,
            matric_number=matric_number,
            password=matric_number,
            department='Computer Science',
            level='400'
        )
        db.session.add(new_student)
        
    db.session.commit()
    
    course = Course.query.get(session.course_id)
    return jsonify({
        'success': True,
        'message': 'Attendance Recorded!',
        'course_name': f"{course.course_code} {course.course_name}",
        'timestamp': record.timestamp.strftime('%I:%M %p')
    })

@attendance_bp.route('/student/me', methods=['GET'])
def student_me():
    email = request.args.get('email')
    if not email:
        return jsonify({'success': False, 'message': 'Email required'}), 400
        
    student = Student.query.filter_by(email=email).first()
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404
        
    # Get all records matching matric_number
    records = db.session.query(AttendanceRecord, AttendanceSession, Course).join(
        AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id
    ).join(
        Course, AttendanceSession.course_id == Course.id
    ).filter(
        AttendanceRecord.matric_number == student.matric_number
    ).order_by(AttendanceRecord.timestamp.desc()).all()
    
    recent_data = None
    if records:
        r, s, c = records[0]
        recent_data = {
            'course_name': f"{c.course_code} {c.course_name}",
            'date': s.date.strftime('%Y-%m-%d'),
            'time': r.timestamp.strftime('%I:%M %p'),
            'status': r.status
        }
        
    # Calculate courses summary
    courses_summary = []
    all_courses = Course.query.all()
    
    for course in all_courses:
        sessions = AttendanceSession.query.filter_by(course_id=course.id).all()
        sessions_held = len(sessions)
        
        session_ids = [sess.id for sess in sessions]
        sessions_attended = AttendanceRecord.query.filter(
            AttendanceRecord.matric_number == student.matric_number,
            AttendanceRecord.session_id.in_(session_ids)
        ).count() if session_ids else 0
        
        percentage = round((sessions_attended / sessions_held) * 100, 1) if sessions_held > 0 else 0.0
        
        courses_summary.append({
            'course_code': course.course_code,
            'course_name': course.course_name,
            'sessions_attended': sessions_attended,
            'sessions_held': sessions_held,
            'percentage': percentage
        })
        
    history_data = []
    for r, s, c in records:
        history_data.append({
            'course_name': f"{c.course_code} {c.course_name}",
            'date': s.date.strftime('%Y-%m-%d'),
            'time': r.timestamp.strftime('%I:%M %p'),
            'status': r.status
        })
        
    return jsonify({
        'recent': recent_data,
        'courses': courses_summary,
        'history': history_data
    })
