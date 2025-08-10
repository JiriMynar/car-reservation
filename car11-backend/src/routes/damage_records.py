from flask import Blueprint, request, jsonify
from src.models.models import DamageRecord, Vehicle, db
from src.routes.auth import admin_required
from datetime import datetime
import json

damage_records_bp = Blueprint('damage_records', __name__)

@damage_records_bp.route('/damage-records', methods=['GET'])
@admin_required
def get_damage_records():
    # Get query parameters for filtering
    vehicle_id = request.args.get('vehicle_id', type=int)
    repair_status = request.args.get('repair_status')
    
    query = DamageRecord.query
    
    # Apply filters
    if vehicle_id:
        query = query.filter(DamageRecord.vehicle_id == vehicle_id)
    
    if repair_status:
        query = query.filter(DamageRecord.repair_status == repair_status)
    
    damage_records = query.order_by(DamageRecord.damage_date.desc()).all()
    return jsonify([record.to_dict() for record in damage_records])

@damage_records_bp.route('/damage-records/<int:record_id>', methods=['GET'])
@admin_required
def get_damage_record(record_id):
    record = DamageRecord.query.get_or_404(record_id)
    return jsonify(record.to_dict())

@damage_records_bp.route('/damage-records', methods=['POST'])
@admin_required
def create_damage_record():
    data = request.get_json()
    
    # Validate vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    
    # Parse damage date
    try:
        damage_date = datetime.strptime(data['damage_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    record = DamageRecord(
        vehicle_id=data['vehicle_id'],
        damage_date=damage_date,
        description=data['description'],
        estimated_cost=data.get('estimated_cost'),
        actual_cost=data.get('actual_cost'),
        repair_status=data.get('repair_status', 'Ceka na opravu'),
        photos=json.dumps(data.get('photos', [])) if data.get('photos') else None
    )
    
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201

@damage_records_bp.route('/damage-records/<int:record_id>', methods=['PUT'])
@admin_required
def update_damage_record(record_id):
    record = DamageRecord.query.get_or_404(record_id)
    data = request.get_json()
    
    # Update basic fields
    for field in ['description', 'estimated_cost', 'actual_cost', 'repair_status']:
        if field in data:
            setattr(record, field, data[field])
    
    # Update damage date if provided
    if 'damage_date' in data:
        try:
            damage_date = datetime.strptime(data['damage_date'], '%Y-%m-%d').date()
            record.damage_date = damage_date
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    # Update photos if provided
    if 'photos' in data:
        record.photos = json.dumps(data['photos']) if data['photos'] else None
    
    db.session.commit()
    return jsonify(record.to_dict())

@damage_records_bp.route('/damage-records/<int:record_id>', methods=['DELETE'])
@admin_required
def delete_damage_record(record_id):
    record = DamageRecord.query.get_or_404(record_id)
    db.session.delete(record)
    db.session.commit()
    return '', 204

