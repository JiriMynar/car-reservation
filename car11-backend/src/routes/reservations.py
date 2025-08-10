from flask import Blueprint, request, jsonify, session
from src.models.models import Reservation, Vehicle, User, db
from src.routes.auth import login_required, admin_required
from datetime import datetime, timedelta
from sqlalchemy import and_, or_

reservations_bp = Blueprint('reservations', __name__)

@reservations_bp.route('/reservations', methods=['GET'])
@login_required
def get_reservations():
    user = User.query.get(session['user_id'])
    
    # Get query parameters for filtering
    vehicle_id = request.args.get('vehicle_id', type=int)
    status = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Base query - admins see all, employees see only their own
    if user.role.name == 'Administrator':
        query = Reservation.query
    else:
        query = Reservation.query.filter(Reservation.user_id == user.id)
    
    # Apply filters
    if vehicle_id:
        query = query.filter(Reservation.vehicle_id == vehicle_id)
    
    if status:
        query = query.filter(Reservation.status == status)
    
    if start_date:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        query = query.filter(Reservation.start_time >= start_dt)
    
    if end_date:
        end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
        query = query.filter(Reservation.end_time < end_dt)
    
    reservations = query.order_by(Reservation.start_time.desc()).all()
    return jsonify([reservation.to_dict() for reservation in reservations])

@reservations_bp.route('/reservations/<int:reservation_id>', methods=['GET'])
@login_required
def get_reservation(reservation_id):
    user = User.query.get(session['user_id'])
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Check permissions - users can only see their own reservations
    if user.role.name != 'Administrator' and reservation.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(reservation.to_dict())

@reservations_bp.route('/reservations', methods=['POST'])
@login_required
def create_reservation():
    user = User.query.get(session['user_id'])
    data = request.get_json()
    
    # Parse datetime strings
    try:
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    except (ValueError, KeyError):
        return jsonify({'error': 'Invalid datetime format'}), 400
    
    # Validate times
    if start_time >= end_time:
        return jsonify({'error': 'End time must be after start time'}), 400
    
    if start_time < datetime.now():
        return jsonify({'error': 'Cannot create reservation in the past'}), 400
    
    # Check vehicle exists and is available
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    
    if vehicle.is_archived or vehicle.status != 'Aktivni':
        return jsonify({'error': 'Vehicle is not available for reservation'}), 400
    
    # Check for conflicts
    overlapping_reservations = Reservation.query.filter(
        and_(
            Reservation.vehicle_id == data['vehicle_id'],
            Reservation.status == 'Potvrzena',
            or_(
                and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
                and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
                and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time)
            )
        )
    ).first()
    
    if overlapping_reservations:
        return jsonify({'error': 'Vehicle is already reserved for this time period'}), 409
    
    # Determine user_id (admins can create reservations for others)
    target_user_id = data.get('user_id', user.id)
    if target_user_id != user.id and user.role.name != 'Administrator':
        return jsonify({'error': 'Cannot create reservation for another user'}), 403
    
    reservation = Reservation(
        user_id=target_user_id,
        vehicle_id=data['vehicle_id'],
        start_time=start_time,
        end_time=end_time,
        purpose=data['purpose'],
        destination=data['destination'],
        passenger_count=data.get('passenger_count', 1),
        user_notes=data.get('user_notes'),
        admin_notes=data.get('admin_notes') if user.role.name == 'Administrator' else None
    )
    
    db.session.add(reservation)
    db.session.commit()
    return jsonify(reservation.to_dict()), 201

@reservations_bp.route('/reservations/<int:reservation_id>', methods=['PUT'])
@login_required
def update_reservation(reservation_id):
    user = User.query.get(session['user_id'])
    reservation = Reservation.query.get_or_404(reservation_id)
    data = request.get_json()
    
    # Check permissions
    if user.role.name != 'Administrator' and reservation.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Check time restrictions for non-admin users
    if user.role.name != 'Administrator':
        time_until_start = reservation.start_time - datetime.now()
        if time_until_start < timedelta(hours=2):
            return jsonify({'error': 'Cannot modify reservation less than 2 hours before start time'}), 400
    
    # Update basic fields
    for field in ['purpose', 'destination', 'passenger_count', 'user_notes']:
        if field in data:
            setattr(reservation, field, data[field])
    
    # Admin-only fields
    if user.role.name == 'Administrator':
        if 'admin_notes' in data:
            reservation.admin_notes = data['admin_notes']
        if 'status' in data:
            reservation.status = data['status']
        if 'user_id' in data:
            reservation.user_id = data['user_id']
    
    # Update times if provided
    if 'start_time' in data or 'end_time' in data:
        try:
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00')) if 'start_time' in data else reservation.start_time
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00')) if 'end_time' in data else reservation.end_time
        except ValueError:
            return jsonify({'error': 'Invalid datetime format'}), 400
        
        if start_time >= end_time:
            return jsonify({'error': 'End time must be after start time'}), 400
        
        if start_time < datetime.now():
            return jsonify({'error': 'Cannot set reservation start time in the past'}), 400
        
        # Check for conflicts (excluding current reservation)
        overlapping_reservations = Reservation.query.filter(
            and_(
                Reservation.vehicle_id == reservation.vehicle_id,
                Reservation.id != reservation.id,
                Reservation.status == 'Potvrzena',
                or_(
                    and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
                    and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
                    and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time)
                )
            )
        ).first()
        
        if overlapping_reservations:
            return jsonify({'error': 'Vehicle is already reserved for this time period'}), 409
        
        reservation.start_time = start_time
        reservation.end_time = end_time
    
    db.session.commit()
    return jsonify(reservation.to_dict())

@reservations_bp.route('/reservations/<int:reservation_id>/cancel', methods=['PUT'])
@login_required
def cancel_reservation(reservation_id):
    user = User.query.get(session['user_id'])
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Check permissions
    if user.role.name != 'Administrator' and reservation.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Check time restrictions for non-admin users
    if user.role.name != 'Administrator':
        time_until_start = reservation.start_time - datetime.now()
        if time_until_start < timedelta(hours=2):
            return jsonify({'error': 'Cannot cancel reservation less than 2 hours before start time'}), 400
    
    reservation.status = 'Zrusena'
    db.session.commit()
    return jsonify(reservation.to_dict())

@reservations_bp.route('/reservations/calendar', methods=['GET'])
@login_required
def get_calendar_reservations():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date or not end_date:
        return jsonify({'error': 'start_date and end_date parameters are required'}), 400
    
    try:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    # Get all confirmed reservations in the date range
    reservations = Reservation.query.filter(
        and_(
            Reservation.status == 'Potvrzena',
            Reservation.start_time >= start_dt,
            Reservation.start_time < end_dt
        )
    ).all()
    
    return jsonify([reservation.to_dict() for reservation in reservations])

