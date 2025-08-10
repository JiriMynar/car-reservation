from flask import Blueprint, request, jsonify, make_response
from src.models.models import Vehicle, User, Reservation, ServiceRecord, DamageRecord, db
from src.routes.auth import admin_required
from datetime import datetime, timedelta
from sqlalchemy import func, and_, extract
import csv
import io

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard():
    # Current date for calculations
    now = datetime.now()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_30_days = now - timedelta(days=30)
    last_6_months = now - timedelta(days=180)
    
    # Basic counts
    total_active_vehicles = Vehicle.query.filter_by(is_archived=False).count()
    total_active_users = User.query.filter_by(is_active=True).count()
    
    # Monthly reservations
    monthly_reservations = Reservation.query.filter(
        Reservation.created_at >= current_month_start
    ).count()
    
    # Currently active reservations (ongoing trips)
    active_reservations = Reservation.query.filter(
        and_(
            Reservation.status == 'Potvrzena',
            Reservation.start_time <= now,
            Reservation.end_time > now
        )
    ).count()
    
    # Vehicles in maintenance
    vehicles_in_maintenance = Vehicle.query.filter_by(status='V udrzbe').count()
    
    # Service records in last 30 days
    recent_services = ServiceRecord.query.filter(
        ServiceRecord.created_at >= last_30_days
    ).count()
    
    # Unresolved damage records
    unresolved_damages = DamageRecord.query.filter_by(repair_status='Ceka na opravu').count()
    
    # Reservation trend for last 6 months
    reservation_trend = []
    for i in range(6):
        month_start = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        count = Reservation.query.filter(
            and_(
                Reservation.created_at >= month_start,
                Reservation.created_at < month_end
            )
        ).count()
        
        reservation_trend.append({
            'month': month_start.strftime('%Y-%m'),
            'count': count
        })
    
    reservation_trend.reverse()  # Show oldest to newest
    
    return jsonify({
        'total_active_vehicles': total_active_vehicles,
        'total_active_users': total_active_users,
        'monthly_reservations': monthly_reservations,
        'active_reservations': active_reservations,
        'vehicles_in_maintenance': vehicles_in_maintenance,
        'recent_services': recent_services,
        'unresolved_damages': unresolved_damages,
        'reservation_trend': reservation_trend
    })

@reports_bp.route('/vehicle-utilization', methods=['GET'])
@admin_required
def get_vehicle_utilization():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date or not end_date:
        return jsonify({'error': 'start_date and end_date parameters are required'}), 400
    
    try:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    # Calculate total period in hours
    total_period_hours = (end_dt - start_dt).total_seconds() / 3600
    
    # Get all vehicles
    vehicles = Vehicle.query.filter_by(is_archived=False).all()
    
    utilization_data = []
    for vehicle in vehicles:
        # Get confirmed reservations for this vehicle in the period
        reservations = Reservation.query.filter(
            and_(
                Reservation.vehicle_id == vehicle.id,
                Reservation.status == 'Potvrzena',
                Reservation.start_time >= start_dt,
                Reservation.end_time < end_dt
            )
        ).all()
        
        # Calculate total reserved hours
        total_reserved_hours = 0
        for reservation in reservations:
            duration = (reservation.end_time - reservation.start_time).total_seconds() / 3600
            total_reserved_hours += duration
        
        # Calculate utilization percentage
        utilization_percentage = (total_reserved_hours / total_period_hours * 100) if total_period_hours > 0 else 0
        
        utilization_data.append({
            'vehicle_id': vehicle.id,
            'vehicle_info': f"{vehicle.make} {vehicle.model} ({vehicle.license_plate})",
            'total_reserved_hours': round(total_reserved_hours, 2),
            'utilization_percentage': round(utilization_percentage, 2),
            'reservation_count': len(reservations)
        })
    
    # Sort by utilization percentage descending
    utilization_data.sort(key=lambda x: x['utilization_percentage'], reverse=True)
    
    return jsonify(utilization_data)

@reports_bp.route('/cost-analysis', methods=['GET'])
@admin_required
def get_cost_analysis():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date or not end_date:
        return jsonify({'error': 'start_date and end_date parameters are required'}), 400
    
    try:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    # Get all vehicles
    vehicles = Vehicle.query.filter_by(is_archived=False).all()
    
    cost_data = []
    total_service_costs = 0
    total_damage_costs = 0
    
    for vehicle in vehicles:
        # Get service costs for this vehicle in the period
        service_costs = db.session.query(func.sum(ServiceRecord.cost)).filter(
            and_(
                ServiceRecord.vehicle_id == vehicle.id,
                ServiceRecord.service_date >= start_dt,
                ServiceRecord.service_date <= end_dt,
                ServiceRecord.cost.isnot(None)
            )
        ).scalar() or 0
        
        # Get damage repair costs for this vehicle in the period
        damage_costs = db.session.query(func.sum(DamageRecord.actual_cost)).filter(
            and_(
                DamageRecord.vehicle_id == vehicle.id,
                DamageRecord.damage_date >= start_dt,
                DamageRecord.damage_date <= end_dt,
                DamageRecord.actual_cost.isnot(None)
            )
        ).scalar() or 0
        
        vehicle_total = float(service_costs) + float(damage_costs)
        total_service_costs += float(service_costs)
        total_damage_costs += float(damage_costs)
        
        cost_data.append({
            'vehicle_id': vehicle.id,
            'vehicle_info': f"{vehicle.make} {vehicle.model} ({vehicle.license_plate})",
            'service_costs': float(service_costs),
            'damage_costs': float(damage_costs),
            'total_costs': vehicle_total
        })
    
    # Sort by total costs descending
    cost_data.sort(key=lambda x: x['total_costs'], reverse=True)
    
    return jsonify({
        'vehicles': cost_data,
        'summary': {
            'total_service_costs': total_service_costs,
            'total_damage_costs': total_damage_costs,
            'grand_total': total_service_costs + total_damage_costs
        }
    })

@reports_bp.route('/reservation-statistics', methods=['GET'])
@admin_required
def get_reservation_statistics():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date and end_date:
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            base_query = Reservation.query.filter(
                and_(
                    Reservation.created_at >= start_dt,
                    Reservation.created_at < end_dt
                )
            )
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    else:
        base_query = Reservation.query
    
    # Status breakdown
    status_breakdown = db.session.query(
        Reservation.status,
        func.count(Reservation.id)
    ).filter(
        Reservation.id.in_(base_query.with_entities(Reservation.id))
    ).group_by(Reservation.status).all()
    
    status_data = [{'status': status, 'count': count} for status, count in status_breakdown]
    
    # Top 10 most active users
    top_users = db.session.query(
        User.full_name,
        func.count(Reservation.id).label('reservation_count')
    ).join(Reservation).filter(
        Reservation.id.in_(base_query.with_entities(Reservation.id))
    ).group_by(User.id, User.full_name).order_by(
        func.count(Reservation.id).desc()
    ).limit(10).all()
    
    top_users_data = [{'user_name': name, 'reservation_count': count} for name, count in top_users]
    
    # Top 10 most popular vehicles
    top_vehicles = db.session.query(
        Vehicle.make,
        Vehicle.model,
        Vehicle.license_plate,
        func.count(Reservation.id).label('reservation_count')
    ).join(Reservation).filter(
        Reservation.id.in_(base_query.with_entities(Reservation.id))
    ).group_by(Vehicle.id, Vehicle.make, Vehicle.model, Vehicle.license_plate).order_by(
        func.count(Reservation.id).desc()
    ).limit(10).all()
    
    top_vehicles_data = [{
        'vehicle_info': f"{make} {model} ({license_plate})",
        'reservation_count': count
    } for make, model, license_plate, count in top_vehicles]
    
    # Daily reservation overview (last 30 days if no date range specified)
    if not start_date or not end_date:
        start_dt = datetime.now() - timedelta(days=30)
        end_dt = datetime.now()
    
    daily_reservations = db.session.query(
        func.date(Reservation.created_at).label('date'),
        func.count(Reservation.id).label('count')
    ).filter(
        and_(
            Reservation.created_at >= start_dt,
            Reservation.created_at < end_dt
        )
    ).group_by(func.date(Reservation.created_at)).order_by('date').all()
    
    daily_data = [{'date': str(date), 'count': count} for date, count in daily_reservations]
    
    return jsonify({
        'status_breakdown': status_data,
        'top_users': top_users_data,
        'top_vehicles': top_vehicles_data,
        'daily_overview': daily_data
    })

@reports_bp.route('/export/<report_type>', methods=['GET'])
@admin_required
def export_report(report_type):
    if report_type not in ['vehicle-utilization', 'cost-analysis', 'reservation-statistics']:
        return jsonify({'error': 'Invalid report type'}), 400
    
    # Get the report data
    if report_type == 'vehicle-utilization':
        response_data = get_vehicle_utilization()
        data = response_data.get_json()
        filename = 'vehicle_utilization.csv'
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Vehicle', 'Reserved Hours', 'Utilization %', 'Reservations'])
        for item in data:
            writer.writerow([
                item['vehicle_info'],
                item['total_reserved_hours'],
                item['utilization_percentage'],
                item['reservation_count']
            ])
    
    elif report_type == 'cost-analysis':
        response_data = get_cost_analysis()
        data = response_data.get_json()
        filename = 'cost_analysis.csv'
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Vehicle', 'Service Costs', 'Damage Costs', 'Total Costs'])
        for item in data['vehicles']:
            writer.writerow([
                item['vehicle_info'],
                item['service_costs'],
                item['damage_costs'],
                item['total_costs']
            ])
        # Add summary row
        writer.writerow(['TOTAL', data['summary']['total_service_costs'], 
                        data['summary']['total_damage_costs'], data['summary']['grand_total']])
    
    elif report_type == 'reservation-statistics':
        response_data = get_reservation_statistics()
        data = response_data.get_json()
        filename = 'reservation_statistics.csv'
        
        # Create CSV with multiple sections
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Status breakdown
        writer.writerow(['Status Breakdown'])
        writer.writerow(['Status', 'Count'])
        for item in data['status_breakdown']:
            writer.writerow([item['status'], item['count']])
        
        writer.writerow([])  # Empty row
        
        # Top users
        writer.writerow(['Top Users'])
        writer.writerow(['User Name', 'Reservation Count'])
        for item in data['top_users']:
            writer.writerow([item['user_name'], item['reservation_count']])
        
        writer.writerow([])  # Empty row
        
        # Top vehicles
        writer.writerow(['Top Vehicles'])
        writer.writerow(['Vehicle', 'Reservation Count'])
        for item in data['top_vehicles']:
            writer.writerow([item['vehicle_info'], item['reservation_count']])
    
    # Create response
    response = make_response(output.getvalue())
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename={filename}'
    
    return response

