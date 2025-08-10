from flask import Blueprint, request, jsonify, session
from src.models.models import User, Role, db
from src.routes.auth import login_required, admin_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    # Get query parameters for filtering
    status = request.args.get('status')  # active/inactive
    role_id = request.args.get('role_id', type=int)
    
    query = User.query
    
    # Apply filters
    if status == 'active':
        query = query.filter(User.is_active == True)
    elif status == 'inactive':
        query = query.filter(User.is_active == False)
    
    if role_id:
        query = query.filter(User.role_id == role_id)
    
    users = query.all()
    return jsonify([user.to_dict() for user in users])

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    current_user = User.query.get(session['user_id'])
    
    # Users can only view their own profile, admins can view any
    if current_user.role.name != 'Administrator' and current_user.id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@users_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    data = request.get_json()
    
    # Check if username or email already exists
    existing_user = User.query.filter(
        (User.username == data['username']) | (User.email == data['email'])
    ).first()
    
    if existing_user:
        return jsonify({'error': 'User with this username or email already exists'}), 400
    
    # Check if corporate_id already exists (if provided)
    if data.get('corporate_id'):
        existing_corporate_id = User.query.filter_by(corporate_id=data['corporate_id']).first()
        if existing_corporate_id:
            return jsonify({'error': 'User with this corporate ID already exists'}), 400
    
    # Validate role exists
    role = Role.query.get(data['role_id'])
    if not role:
        return jsonify({'error': 'Invalid role ID'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        corporate_id=data.get('corporate_id'),
        department=data.get('department'),
        phone=data.get('phone'),
        role_id=data['role_id'],
        is_active=data.get('is_active', True)
    )
    
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    current_user = User.query.get(session['user_id'])
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Check permissions
    is_admin = current_user.role.name == 'Administrator'
    is_own_profile = current_user.id == user_id
    
    if not is_admin and not is_own_profile:
        return jsonify({'error': 'Access denied'}), 403
    
    # Fields that regular users can edit
    user_editable_fields = ['department', 'phone']
    
    # Fields that only admins can edit
    admin_only_fields = ['username', 'email', 'full_name', 'corporate_id', 'role_id', 'is_active']
    
    # Update fields based on permissions
    for field in user_editable_fields:
        if field in data:
            setattr(user, field, data[field])
    
    if is_admin:
        for field in admin_only_fields:
            if field in data:
                # Special validation for unique fields
                if field == 'username' and data[field] != user.username:
                    existing = User.query.filter_by(username=data[field]).first()
                    if existing:
                        return jsonify({'error': 'Username already exists'}), 400
                
                if field == 'email' and data[field] != user.email:
                    existing = User.query.filter_by(email=data[field]).first()
                    if existing:
                        return jsonify({'error': 'Email already exists'}), 400
                
                if field == 'corporate_id' and data[field] != user.corporate_id:
                    existing = User.query.filter_by(corporate_id=data[field]).first()
                    if existing:
                        return jsonify({'error': 'Corporate ID already exists'}), 400
                
                if field == 'role_id':
                    role = Role.query.get(data[field])
                    if not role:
                        return jsonify({'error': 'Invalid role ID'}), 400
                
                setattr(user, field, data[field])
        
        # Handle password change
        if 'password' in data:
            user.set_password(data['password'])
    
    db.session.commit()
    return jsonify(user.to_dict())

@users_bp.route('/users/<int:user_id>/deactivate', methods=['PUT'])
@admin_required
def deactivate_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = False
    db.session.commit()
    return jsonify(user.to_dict())

@users_bp.route('/users/<int:user_id>/activate', methods=['PUT'])
@admin_required
def activate_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = True
    db.session.commit()
    return jsonify(user.to_dict())

@users_bp.route('/roles', methods=['GET'])
@admin_required
def get_roles():
    roles = Role.query.all()
    return jsonify([role.to_dict() for role in roles])

@users_bp.route('/roles', methods=['POST'])
@admin_required
def create_role():
    data = request.get_json()
    
    # Check if role name already exists
    existing_role = Role.query.filter_by(name=data['name']).first()
    if existing_role:
        return jsonify({'error': 'Role with this name already exists'}), 400
    
    role = Role(
        name=data['name'],
        description=data.get('description')
    )
    
    db.session.add(role)
    db.session.commit()
    return jsonify(role.to_dict()), 201

@users_bp.route('/roles/<int:role_id>', methods=['PUT'])
@admin_required
def update_role(role_id):
    role = Role.query.get_or_404(role_id)
    data = request.get_json()
    
    # Check if new name already exists (excluding current role)
    if 'name' in data and data['name'] != role.name:
        existing_role = Role.query.filter_by(name=data['name']).first()
        if existing_role:
            return jsonify({'error': 'Role with this name already exists'}), 400
    
    for field in ['name', 'description']:
        if field in data:
            setattr(role, field, data[field])
    
    db.session.commit()
    return jsonify(role.to_dict())

@users_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@admin_required
def delete_role(role_id):
    role = Role.query.get_or_404(role_id)
    
    # Check if any active users are assigned to this role
    active_users = User.query.filter_by(role_id=role_id, is_active=True).count()
    if active_users > 0:
        return jsonify({'error': 'Cannot delete role with active users assigned'}), 400
    
    db.session.delete(role)
    db.session.commit()
    return '', 204

