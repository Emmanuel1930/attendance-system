import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-run-key'
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'run_attendance_db.sqlite')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
