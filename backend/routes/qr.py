from flask import Blueprint, jsonify
from models import AttendanceSession
import qrcode
import base64
from io import BytesIO

qr_bp = Blueprint('qr', __name__)

@qr_bp.route('/generate/<int:session_id>', methods=['GET'])
def generate_qr(session_id):
    session = AttendanceSession.query.get(session_id)
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
        
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(session.session_code)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return jsonify({
        'success': True,
        'qr_image': f'data:image/png;base64,{qr_base64}'
    })
