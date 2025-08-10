from flask import Blueprint, request, jsonify
from src.models.models import Vehicle, db, Reservation
from src.routes.auth import login_required, admin_required
from datetime import datetime, date
from sqlalchemy import and_, or_

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('/vehicles', methods=['GET'])
@login_required
def get_vehicles():
    # Get query parameters for filtering
    status = request.args.get('status')
    fuel_type = request.args.get('fuel_type')
    transmission = request.args.get('transmission')
    include_archived = request.args.get('include_archived', 'false').lower() == 'true'
    
    query = Vehicle.query
    
    # Apply filters
    if not include_archived:
        query = query.filter(Vehicle.is_archived == False)
    
    if status:
        query = query.filter(Vehicle.status == status)
    
    if fuel_type:
        query = query.filter(Vehicle.fuel_type == fuel_type)
    
    if transmission:
        query = query.filter(Vehicle.transmission == transmission)
    
    vehicles = query.all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles])

@vehicles_bp.route('/vehicles/<int:vehicle_id>', methods=['GET'])
@login_required
def get_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    return jsonify(vehicle.to_dict())

@vehicles_bp.route('/vehicles', methods=['POST'])
@admin_required
def create_vehicle():
    data = request.get_json()
    
    # Check if license plate already exists
    existing_vehicle = Vehicle.query.filter_by(license_plate=data['license_plate']).first()
    if existing_vehicle:
        return jsonify({'error': 'Vehicle with this license plate already exists'}), 400
    
    vehicle = Vehicle(
        make=data['make'],
        model=data['model'],
        license_plate=data['license_plate'],
        color=data.get('color'),
        fuel_type=data['fuel_type'],
        seating_capacity=data['seating_capacity'],
        transmission=data['transmission'],
        status=data.get('status', 'Aktivni'),
        description=data.get('description'),
        odometer=data.get('odometer'),
        last_service_date=datetime.strptime(data['last_service_date'], '%Y-%m-%d').date() if data.get('last_service_date') else None,
        next_service_date=datetime.strptime(data['next_service_date'], '%Y-%m-%d').date() if data.get('next_service_date') else None,
        technical_inspection_expiry=datetime.strptime(data['technical_inspection_expiry'], '%Y-%m-%d').date() if data.get('technical_inspection_expiry') else None,
        highway_vignette_expiry=datetime.strptime(data['highway_vignette_expiry'], '%Y-%m-%d').date() if data.get('highway_vignette_expiry') else None,
        emission_control_expiry=datetime.strptime(data['emission_control_expiry'], '%Y-%m-%d').date() if data.get('emission_control_expiry') else None,
        notes=data.get('notes')
    )
    
    db.session.add(vehicle)
    db.session.commit()
    return jsonify(vehicle.to_dict()), 201

@vehicles_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
@admin_required
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()
    
    # Check if license plate already exists (excluding current vehicle)
    if 'license_plate' in data and data['license_plate'] != vehicle.license_plate:
        existing_vehicle = Vehicle.query.filter_by(license_plate=data['license_plate']).first()
        if existing_vehicle:
            return jsonify({'error': 'Vehicle with this license plate already exists'}), 400
    
    # Update fields
    for field in ['make', 'model', 'license_plate', 'color', 'fuel_type', 'seating_capacity', 
                  'transmission', 'status', 'description', 'odometer', 'notes']:
        if field in data:
            setattr(vehicle, field, data[field])
    
    # Update date fields
    date_fields = ['last_service_date', 'next_service_date', 'technical_inspection_expiry', 
                   'highway_vignette_expiry', 'emission_control_expiry']
    for field in date_fields:
        if field in data and data[field]:
            setattr(vehicle, field, datetime.strptime(data[field], '%Y-%m-%d').date())
        elif field in data and not data[field]:
            setattr(vehicle, field, None)
    
    db.session.commit()
    return jsonify(vehicle.to_dict())

@vehicles_bp.route('/vehicles/<int:vehicle_id>/archive', methods=['PUT'])
@admin_required
def archive_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    vehicle.is_archived = True
    vehicle.status = 'Archivovane'
    db.session.commit()
    return jsonify(vehicle.to_dict())

@vehicles_bp.route('/vehicles/<int:vehicle_id>/unarchive', methods=['PUT'])
@admin_required
def unarchive_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    vehicle.is_archived = False
    vehicle.status = 'Aktivni'
    db.session.commit()
    return jsonify(vehicle.to_dict())

@vehicles_bp.route('/vehicles/<int:vehicle_id>/availability', methods=['GET'])
@login_required
def check_vehicle_availability(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    
    start_time_str = request.args.get('start_time')
    end_time_str = request.args.get('end_time')
    
    if not start_time_str or not end_time_str:
        return jsonify({'error': 'start_time and end_time parameters are required'}), 400
    
    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400
    
    # Check for overlapping reservations
    overlapping_reservations = Reservation.query.filter(
        and_(
            Reservation.vehicle_id == vehicle_id,
            Reservation.status == 'Potvrzena',
            or_(
                and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
                and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
                and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time)
            )
        )
    ).all()
    
    is_available = len(overlapping_reservations) == 0 and not vehicle.is_archived and vehicle.status == 'Aktivni'
    
    return jsonify({
        'available': is_available,
        'conflicting_reservations': [res.to_dict() for res in overlapping_reservations]
    })

