from flask import Blueprint, request, jsonify
from models import db, AttendanceSession, Course, Lecturer, AttendanceRecord, Student
from datetime import datetime
import uuid
import qrcode
import base64
from io import BytesIO

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/start', methods=['POST'])
def start_session():
    data = request.json
    course_id = data.get('course_id')
    lecturer_id = data.get('lecturer_id')
    base_url = data.get('base_url', 'http://localhost:5173')
    
    existing_session = AttendanceSession.query.filter_by(course_id=course_id, is_active=True).first()
    if existing_session:
        return jsonify({'success': False, 'message': 'A session is already active for this course'}), 400

    session_token = str(uuid.uuid4())
    
    session = AttendanceSession(
        session_code=session_token,
        course_id=course_id,
        lecturer_id=lecturer_id,
        date=datetime.today().date(),
        start_time=datetime.now(),
        is_active=True
    )
    db.session.add(session)
    db.session.commit()
    
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(f"{base_url}/attend/{session_token}")
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return jsonify({
        'success': True,
        'session_id': session.id,
        'session_code': session_token,
        'qr_image': f'data:image/png;base64,{qr_base64}'
    })

@sessions_bp.route('/close', methods=['POST'])
def close_session():
    data = request.json
    session_id = data.get('session_id')
    
    session = AttendanceSession.query.get(session_id)
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
        
    session.is_active = False
    session.end_time = datetime.now()
    db.session.commit()
    
    total_attended = AttendanceRecord.query.filter_by(session_id=session.id).count()
    total_enrolled = Student.query.count()
    
    return jsonify({
        'success': True, 
        'message': 'Session closed',
        'summary': {
            'attended': total_attended,
            'enrolled': total_enrolled,
            'percentage': round((total_attended / total_enrolled) * 100, 1) if total_enrolled > 0 else 0
        }
    })

@sessions_bp.route('/active', methods=['GET'])
def get_active_sessions():
    lecturer_id = request.args.get('lecturer_id')
    query = AttendanceSession.query.filter_by(is_active=True)
    if lecturer_id:
        query = query.filter_by(lecturer_id=lecturer_id)
        
    sessions = query.all()
    result = []
    for s in sessions:
        course = Course.query.get(s.course_id)
        result.append({
            'id': s.id,
            'course_id': s.course_id,
            'course_code': course.course_code,
            'course_name': course.course_name,
            'start_time': s.start_time.strftime('%I:%M %p'),
            'date': s.date.strftime('%Y-%m-%d')
        })
    return jsonify({'success': True, 'sessions': result})

@sessions_bp.route('/<int:session_id>/report', methods=['GET'])
def session_report(session_id):
    records = AttendanceRecord.query.filter_by(session_id=session_id).all()
    result = []
    for r in records:
        result.append({
            'student_id': r.matric_number,
            'name': r.name,
            'timestamp': r.timestamp.strftime('%I:%M:%S %p'),
            'status': r.status
        })
    return jsonify({'success': True, 'attendees': result})

@sessions_bp.route('/info/<session_token>', methods=['GET'])
def get_session_info(session_token):
    session = AttendanceSession.query.filter_by(session_code=session_token).first()
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
        
    course = Course.query.get(session.course_id)
    return jsonify({
        'success': True,
        'course_name': f"{course.course_code} {course.course_name}",
        'date': session.date.strftime('%b %d, %Y'),
        'is_active': session.is_active
    })
