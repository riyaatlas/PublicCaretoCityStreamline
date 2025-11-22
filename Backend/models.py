from datetime import datetime
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), default='user')  # user/admin
    address = db.Column(db.String(300))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    pin = db.Column(db.String(10))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    complaints = db.relationship('Complaint', backref='user', lazy=True)


class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    department = db.Column(db.String(50))
    priority_score = db.Column(db.Float)
    priority_level = db.Column(db.String(20))
    status = db.Column(db.String(20), default="Active")  # Active/In Progress/Resolved
    address = db.Column(db.String(300))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    group_id = db.Column(db.String(50), nullable=True)
