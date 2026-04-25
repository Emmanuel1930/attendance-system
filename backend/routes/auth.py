from flask import Blueprint, request, jsonify
from models import Student

auth_bp = Blueprint('auth', __name__)

DEMO_USERS = [
    {
        "email": "student@run.edu.ng",
        "password": "student123",
        "role": "student",
        "name": "Adebayo Okonkwo",
        "id": "CSC/2021/001",
        "level": "400",
        "db_id": 1
    },
    {
        "email": "lecturer@run.edu.ng",
        "password": "lecturer123",
        "role": "lecturer",
        "name": "Dr. Emeka Nwosu",
        "id": "LECT/001",
        "department": "Computer Science",
        "db_id": 1
    },
    {
        "email": "admin@run.edu.ng",
        "password": "admin123",
        "role": "admin",
        "name": "Mrs. Funke Adeyemi",
        "id": "ADMIN/001"
    }
]

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    for user in DEMO_USERS:
        if user['email'] == email and user['password'] == password:
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({'success': True, 'user': user_data})
            
    student = Student.query.filter_by(email=email, password=password).first()
    if student:
        return jsonify({
            'success': True,
            'user': {
                'name': student.name,
                'email': student.email,
                'role': 'student',
                'matric_number': student.matric_number,
                'id': student.student_id,
                'level': student.level,
                'department': student.department,
                'db_id': student.id
            }
        })
            
    return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logged out successfully'})
