from flask import Blueprint, request, jsonify
from src.models.models import ServiceRecord, Vehicle, db
from src.routes.auth import admin_required
from datetime import datetime

service_records_bp = Blueprint('service_records', __name__)

@service_records_bp.route('/service-records', methods=['GET'])
@admin_required
def get_service_records():
    # Get query parameters for filtering
    vehicle_id = request.args.get('vehicle_id', type=int)
    
    query = ServiceRecord.query
    
    # Apply filters
    if vehicle_id:
        query = query.filter(ServiceRecord.vehicle_id == vehicle_id)
    
    service_records = query.order_by(ServiceRecord.service_date.desc()).all()
    return jsonify([record.to_dict() for record in service_records])

@service_records_bp.route('/service-records/<int:record_id>', methods=['GET'])
@admin_required
def get_service_record(record_id):
    record = ServiceRecord.query.get_or_404(record_id)
    return jsonify(record.to_dict())

@service_records_bp.route('/service-records', methods=['POST'])
@admin_required
def create_service_record():
    data = request.get_json()
    
    # Validate vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    
    # Parse service date
    try:
        service_date = datetime.strptime(data['service_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    record = ServiceRecord(
        vehicle_id=data['vehicle_id'],
        service_date=service_date,
        service_type=data['service_type'],
        description=data['description'],
        cost=data.get('cost'),
        service_provider=data.get('service_provider')
    )
    
    db.session.add(record)
    
    # Update vehicle's last service date if this service is newer
    if not vehicle.last_service_date or service_date > vehicle.last_service_date:
        vehicle.last_service_date = service_date
    
    db.session.commit()
    return jsonify(record.to_dict()), 201

@service_records_bp.route('/service-records/<int:record_id>', methods=['PUT'])
@admin_required
def update_service_record(record_id):
    record = ServiceRecord.query.get_or_404(record_id)
    data = request.get_json()
    
    # Update basic fields
    for field in ['service_type', 'description', 'cost', 'service_provider']:
        if field in data:
            setattr(record, field, data[field])
    
    # Update service date if provided
    if 'service_date' in data:
        try:
            service_date = datetime.strptime(data['service_date'], '%Y-%m-%d').date()
            record.service_date = service_date
            
            # Update vehicle's last service date if this becomes the newest
            vehicle = record.vehicle
            latest_service = ServiceRecord.query.filter_by(vehicle_id=vehicle.id).order_by(ServiceRecord.service_date.desc()).first()
            if latest_service and latest_service.id == record.id:
                vehicle.last_service_date = service_date
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    db.session.commit()
    return jsonify(record.to_dict())

@service_records_bp.route('/service-records/<int:record_id>', methods=['DELETE'])
@admin_required
def delete_service_record(record_id):
    record = ServiceRecord.query.get_or_404(record_id)
    vehicle = record.vehicle
    
    db.session.delete(record)
    
    # Update vehicle's last service date after deletion
    latest_service = ServiceRecord.query.filter_by(vehicle_id=vehicle.id).order_by(ServiceRecord.service_date.desc()).first()
    vehicle.last_service_date = latest_service.service_date if latest_service else None
    
    db.session.commit()
    return '', 204

