from flask import Blueprint, jsonify
from models import db, Student, Lecturer, Course, AttendanceSession, AttendanceRecord

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/overview', methods=['GET'])
def overview():
    total_students = Student.query.count()
    total_lecturers = Lecturer.query.count()
    total_courses = Course.query.count()
    sessions_today = AttendanceSession.query.filter(
        db.func.date(AttendanceSession.date) == db.func.current_date()
    ).count()

    recent_sessions = AttendanceSession.query.order_by(AttendanceSession.start_time.desc()).limit(5).all()
    sessions_data = []
    for s in recent_sessions:
        course = Course.query.get(s.course_id)
        lecturer = Lecturer.query.get(s.lecturer_id)
        attended = AttendanceRecord.query.filter_by(session_id=s.id).count()
        sessions_data.append({
            'course': f"{course.course_code}",
            'lecturer': lecturer.name,
            'date': s.date.strftime('%b %d, %Y'),
            'students_attended': attended,
            'status': 'Active' if s.is_active else 'Closed'
        })

    return jsonify({
        'success': True,
        'stats': {
            'total_students': total_students,
            'total_lecturers': total_lecturers,
            'total_courses': total_courses,
            'sessions_today': sessions_today
        },
        'recent_sessions': sessions_data
    })

@admin_bp.route('/users', methods=['GET'])
def users():
    students = Student.query.all()
    users_data = []
    
    for s in students:
        total_sessions_held = 0
        total_attended = 0
        courses = Course.query.all()
        for course in courses:
            sessions = AttendanceSession.query.filter_by(course_id=course.id).all()
            total_sessions_held += len(sessions)
            session_ids = [sess.id for sess in sessions]
            if session_ids:
                attended = AttendanceRecord.query.filter(
                    AttendanceRecord.student_id == s.id,
                    AttendanceRecord.session_id.in_(session_ids)
                ).count()
                total_attended += attended
                
        percentage = round((total_attended / total_sessions_held) * 100, 1) if total_sessions_held > 0 else 100.0
        
        users_data.append({
            'id': s.id,
            'name': s.name,
            'student_id': s.student_id,
            'email': s.email,
            'level': s.level,
            'department': s.department,
            'overall_attendance': percentage
        })
        
    return jsonify({
        'success': True,
        'users': users_data
    })

@admin_bp.route('/clear', methods=['DELETE'])
def clear_data():
    try:
        db.session.query(AttendanceRecord).delete()
        db.session.query(AttendanceSession).delete()
        db.session.commit()
        return jsonify({'success': True, 'message': 'All session data cleared successfully.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
