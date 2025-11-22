from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Complaint, User
from app import db
from grouping import group_and_assign_complaints
import datetime

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/<department>", methods=["GET"])
@jwt_required()
def view_department_complaints(department):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({"error": "Access denied"}), 403

    from sqlalchemy import or_
    complaints = Complaint.query.filter(
        Complaint.department == department,
        or_(Complaint.status == "Active", Complaint.status == "In Progress")
    ).order_by(Complaint.priority_score.asc()).all()

    return jsonify([
        {
            "id": c.id,
            "user_id": c.user.id,
            "description": c.description,
            "priority_score": c.priority_score,
            "priority_level": c.priority_level,
            "status": c.status
        }
        for c in complaints
    ])



@admin_bp.route("/group/<department>", methods=["POST"])
@jwt_required()
def group_complaints(department):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Access denied"}), 403

    complaints = Complaint.query.filter_by(department=department, status="Active").all()
    groups = group_and_assign_complaints(complaints)
    return jsonify(groups)


@admin_bp.route("/assign/<group_id>", methods=["POST"])
@jwt_required()
def assign_team(group_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role  != "admin":
        return jsonify({"error": "Access denied"}), 403

    complaints = Complaint.query.filter_by(group_id=group_id).all()
    for c in complaints:
        c.status = "In Progress"
    db.session.commit()
    return jsonify({"message": f"Field team assigned to {group_id}"}), 200


@admin_bp.route("/resolved", methods=["GET"])
@jwt_required()
def view_all_resolved_complaints():
    """
    Endpoint for admin to fetch all resolved complaints across all departments.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({"error": "Access denied"}), 403

    # Fetch all complaints with status 'Resolved'
    resolved_complaints = Complaint.query.filter(
        Complaint.status == "Resolved"
    ).order_by(Complaint.priority_score.asc()).all()

    return jsonify([
        {
            "id": c.id,
            "description": c.description,
            "priority_score": c.priority_score,
            "priority_level": c.priority_level,
            "status": c.status,
            "department": c.department
        }
        for c in resolved_complaints
    ])

@admin_bp.route("/me", methods=["GET"])
@jwt_required()
def get_admin_profile():
    """
    Fetch profile of the logged-in admin.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != "admin":
        return jsonify({"error": "Access denied"}), 403

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "pin": user.pin,
        "latitude": user.latitude,
        "longitude": user.longitude,
        "created_at": user.created_at.isoformat() if user.created_at else None
    })


@admin_bp.route("/assign_single/<int:complaint_id>", methods=["POST"])
@jwt_required()
def assign_single_complaint(complaint_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != "admin":
        return jsonify({"error": "Access denied"}), 403

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    # Only allow assign if high priority
    if complaint.priority_level.lower() != "high":
        return jsonify({"error": "Only high-priority complaints can be assigned directly"}), 400

    # Unique group_id with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    complaint.group_id = f"{complaint.department}_single_{timestamp}"
    complaint.status = "In Progress"

    db.session.commit()

    return jsonify({
        "message": "High-priority complaint assigned successfully",
        "group_id": complaint.group_id,
        "complaint_id": complaint.id
    }), 200

@admin_bp.route("/grouped/<department>", methods=["GET"])
@jwt_required()
def get_grouped_inprogress_complaints(department):
    """
    Returns a list of complaint groups for a department.
    Each group is a list of complaints having same group_id and status 'In Progress'.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({"error": "Access denied"}), 403

    # Fetch only in-progress complaints for this department
    inprogress_complaints = Complaint.query.filter_by(
        department=department,
        status="In Progress"
    ).all()

    if not inprogress_complaints:
        return jsonify([]), 200

    # Group complaints by their group_id
    grouped_data = {}
    for c in inprogress_complaints:
        if not c.group_id:
            continue
        grouped_data.setdefault(c.group_id, []).append({
            "id": c.id,
            "user_id": c.user.id,
            "description": c.description,
            "priority_score": c.priority_score,
            "priority_level": c.priority_level,
            "status": c.status,
            "address": c.address,
            "latitude": c.latitude,
            "longitude": c.longitude,
        })

    # Return list of groups
    response = [
        {"group_id": gid, "complaints": comps}
        for gid, comps in grouped_data.items()
    ]

    return jsonify(response), 200
