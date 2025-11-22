from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Complaint, User
from mlmodel import classify_and_score

user_bp = Blueprint("user", __name__)


@user_bp.route("/raise", methods=["POST"])
@jwt_required()
def raise_complaint():
    data = request.json
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # ✅ Option 1: Use saved user address and coordinates
    if data.get("use_my_address"):
        lat, lon = user.latitude, user.longitude
        address = user.address

    # ✅ Option 2: Use custom address + coordinates from frontend
    else:
        address = data["address"]
        lat = data.get("latitude")
        lon = data.get("longitude")

        # Defensive check
        if not lat or not lon:
            return jsonify({"error": "Latitude and longitude required for custom address"}), 400

    ml_result = classify_and_score(data["description"])

    complaint = Complaint(
        user_id=user.id,
        description=data["description"],
        department=ml_result["department"],
        priority_score=ml_result["priority_score"],
        priority_level=ml_result["priority_level"],
        address=address,
        latitude=lat,
        longitude=lon
    )

    db.session.add(complaint)
    db.session.commit()

    return jsonify({
        "message": "Complaint submitted successfully",
        "details": ml_result
    }), 201


@user_bp.route("/track", methods=["GET"])
@jwt_required()
def track_complaints():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    complaints = Complaint.query.filter_by(user_id=user.id).order_by(Complaint.status.asc()).all()
    return jsonify([
        {
            "id": c.id,
            "description": c.description,
            "department": c.department,
            "status": c.status,
            "priority_score": c.priority_score,
            "created_at": c.created_at
        } 
        for c in complaints
    ])

@user_bp.route("/resolve/<int:complaint_id>", methods=["POST"])
@jwt_required()
def mark_complaint_resolved(complaint_id):
    """Allow user to mark their complaint as resolved once it's in progress."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    # Find complaint and validate ownership
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    if complaint.user_id != user.id:
        return jsonify({"error": "You can only update your own complaints"}), 403

    # Only allow resolution if status is "In Progress"
    if complaint.status.lower() != "in progress":
        return jsonify({"error": "Complaint must be 'In Progress' to mark resolved"}), 400

    # Update status to "Resolved"
    complaint.status = "Resolved"
    db.session.commit()

    return jsonify({
        "message": "Complaint marked as resolved successfully",
        "complaint_id": complaint.id,
        "new_status": complaint.status
    }), 200

@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_user_profile():
    """
    Fetch profile of the logged-in regular user.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != "user":
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
