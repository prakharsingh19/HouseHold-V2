from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

# Role Table
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

# UserRoles Table (Many-to-Many relationship between User and Role)
class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)

# Base User Table
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

    # Relationships to specialized user types
    customer = db.relationship('Customer', uselist=False, backref='user', cascade="all, delete-orphan")
    professional = db.relationship('Professional', uselist=False, backref='user', cascade="all, delete-orphan")

# Customer Table (One-to-One with User)
class Customer(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)  # Inherits ID from User
    address = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    requests = db.relationship('ServiceRequest', foreign_keys='ServiceRequest.customer_id', backref='customer', lazy=True)

# Professional Table (One-to-One with User)
class Professional(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)  # Inherits ID from User
    is_verified = db.Column(db.Boolean, default=False)
    category_id= db.Column(db.Integer, db.ForeignKey('service_category.id'))
    experience = db.Column(db.Integer)  # In years
    rating = db.Column(db.Float, default=0.0)
    assignments = db.relationship('ServiceRequest', foreign_keys='ServiceRequest.professional_id', backref='professional', lazy=True)

# ServiceCategory Table
class ServiceCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    tags = db.Column(db.String(255))  # Optional tags for categorization
    services = db.relationship('Service', backref='category', lazy=True)

# Service Table
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=False)  # In minutes
    description = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('service_category.id'))  # Foreign Key to ServiceCategory
    requests = db.relationship('ServiceRequest', backref='service', lazy=True)

# ServiceRequest Table
class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)  # Link to Customer
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)  # Link to Professional
    date_of_request = db.Column(db.DateTime, nullable=False)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(50), default='requested')  # requested/assigned/closed
    remarks = db.Column(db.Text)

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    customer_name = db.Column(db.String)
    pro_name = db.Column(db.String)
    service_name = db.Column(db.String)
    category_name=db.Column(db.String)
