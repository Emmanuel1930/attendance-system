import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-run-key'
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI = db_url or 'sqlite:///' + os.path.join(basedir, 'run_attendance_db.sqlite')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
