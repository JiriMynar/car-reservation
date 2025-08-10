from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='role', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    corporate_id = db.Column(db.String(50), unique=True)
    department = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reservations = db.relationship('Reservation', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'corporate_id': self.corporate_id,
            'department': self.department,
            'phone': self.phone,
            'is_active': self.is_active,
            'role_id': self.role_id,
            'role_name': self.role.name if self.role else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    color = db.Column(db.String(30))
    fuel_type = db.Column(db.String(20), nullable=False)  # benzin, nafta, elektrina, hybrid
    seating_capacity = db.Column(db.Integer, nullable=False)
    transmission = db.Column(db.String(20), nullable=False)  # manualni, automaticka
    status = db.Column(db.String(20), default='Aktivni')  # Aktivni, V udrzbe, Mimo provoz, Archivovane
    description = db.Column(db.Text)
    odometer = db.Column(db.Integer)
    last_service_date = db.Column(db.Date)
    next_service_date = db.Column(db.Date)
    technical_inspection_expiry = db.Column(db.Date)
    highway_vignette_expiry = db.Column(db.Date)
    emission_control_expiry = db.Column(db.Date)
    notes = db.Column(db.Text)
    is_archived = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reservations = db.relationship('Reservation', backref='vehicle', lazy=True)
    service_records = db.relationship('ServiceRecord', backref='vehicle', lazy=True)
    damage_records = db.relationship('DamageRecord', backref='vehicle', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'make': self.make,
            'model': self.model,
            'license_plate': self.license_plate,
            'color': self.color,
            'fuel_type': self.fuel_type,
            'seating_capacity': self.seating_capacity,
            'transmission': self.transmission,
            'status': self.status,
            'description': self.description,
            'odometer': self.odometer,
            'last_service_date': self.last_service_date.isoformat() if self.last_service_date else None,
            'next_service_date': self.next_service_date.isoformat() if self.next_service_date else None,
            'technical_inspection_expiry': self.technical_inspection_expiry.isoformat() if self.technical_inspection_expiry else None,
            'highway_vignette_expiry': self.highway_vignette_expiry.isoformat() if self.highway_vignette_expiry else None,
            'emission_control_expiry': self.emission_control_expiry.isoformat() if self.emission_control_expiry else None,
            'notes': self.notes,
            'is_archived': self.is_archived,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    purpose = db.Column(db.String(200), nullable=False)
    destination = db.Column(db.String(200), nullable=False)
    passenger_count = db.Column(db.Integer, default=1)
    user_notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='Potvrzena')  # Potvrzena, Zrusena, Dokoncena
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'vehicle_id': self.vehicle_id,
            'vehicle_info': f"{self.vehicle.make} {self.vehicle.model} ({self.vehicle.license_plate})" if self.vehicle else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'purpose': self.purpose,
            'destination': self.destination,
            'passenger_count': self.passenger_count,
            'user_notes': self.user_notes,
            'admin_notes': self.admin_notes,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ServiceRecord(db.Model):
    __tablename__ = 'service_records'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    service_date = db.Column(db.Date, nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    cost = db.Column(db.Numeric(10, 2))
    service_provider = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'vehicle_info': f"{self.vehicle.make} {self.vehicle.model} ({self.vehicle.license_plate})" if self.vehicle else None,
            'service_date': self.service_date.isoformat() if self.service_date else None,
            'service_type': self.service_type,
            'description': self.description,
            'cost': float(self.cost) if self.cost else None,
            'service_provider': self.service_provider,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DamageRecord(db.Model):
    __tablename__ = 'damage_records'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    damage_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    estimated_cost = db.Column(db.Numeric(10, 2))
    actual_cost = db.Column(db.Numeric(10, 2))
    repair_status = db.Column(db.String(30), default='Ceka na opravu')  # Ceka na opravu, Opraveno, Neopravitelne
    photos = db.Column(db.Text)  # JSON string of photo paths
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'vehicle_info': f"{self.vehicle.make} {self.vehicle.model} ({self.vehicle.license_plate})" if self.vehicle else None,
            'damage_date': self.damage_date.isoformat() if self.damage_date else None,
            'description': self.description,
            'estimated_cost': float(self.estimated_cost) if self.estimated_cost else None,
            'actual_cost': float(self.actual_cost) if self.actual_cost else None,
            'repair_status': self.repair_status,
            'photos': self.photos,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

