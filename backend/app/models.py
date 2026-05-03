from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Company(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    industry = db.Column(db.String(50), default='Other')
    emissions = db.Column(db.Float, default=0.0)
    credits_allocated = db.Column(db.Float, default=0.0)
    credits_balance = db.Column(db.Float, default=0.0)
    role = db.Column(db.String(20), default='company')

    def set_password(self, password):
        self.password = password

    def check_password(self, password):
        return self.password == password

    def to_dict(self):
        return {
            'company_id': self.id,
            'name': self.name,
            'email': self.email,
            'industry': self.industry,
            'emissions': self.emissions,
            'credits_allocated': self.credits_allocated,
            'credits_balance': self.credits_balance,
            'role': self.role,
            'password': self.password
        }

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.String(50), db.ForeignKey('company.id'), nullable=False)
    buyer_id = db.Column(db.String(50), db.ForeignKey('company.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='completed')
    trade_type = db.Column(db.String(20), default='Trade')
