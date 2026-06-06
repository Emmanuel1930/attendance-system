from flask import Blueprint, request, jsonify
from models import db, Course, AttendanceSession, AttendanceRecord, QRCodeLog

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('', methods=['GET'])
def get_courses():
    lecturer_id = request.args.get('lecturer_id')
    if not lecturer_id:
        return jsonify({'success': False, 'message': 'lecturer_id is required'}), 400
        
    courses = Course.query.filter_by(lecturer_id=lecturer_id).all()
    result = []
    for c in courses:
        result.append({
            'id': c.id,
            'code': c.course_code,
            'name': c.course_name,
            'units': c.units,
            'level': c.level
        })
    return jsonify({'success': True, 'courses': result})

@courses_bp.route('', methods=['POST'])
def create_course():
    data = request.json
    try:
        new_course = Course(
            course_code=data['course_code'],
            course_name=data['course_name'],
            units=int(data['units']),
            level=data['level'],
            lecturer_id=data['lecturer_id']
        )
        db.session.add(new_course)
        db.session.commit()
        return jsonify({'success': True, 'course': {
            'id': new_course.id,
            'code': new_course.course_code,
            'name': new_course.course_name,
            'units': new_course.units,
            'level': new_course.level
        }})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@courses_bp.route('/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'success': False, 'message': 'Course not found'}), 404
        
    try:
        sessions = AttendanceSession.query.filter_by(course_id=course_id).all()
        for s in sessions:
            AttendanceRecord.query.filter_by(session_id=s.id).delete()
            QRCodeLog.query.filter_by(session_id=s.id).delete()
            db.session.delete(s)
            
        db.session.delete(course)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Course deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400
