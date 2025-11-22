from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app import db
from models import User
import requests
import traceback
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data["username"]
    email = data["email"]
    password = generate_password_hash(data["password"])
    address = f"{data['house_no']}, {data['street']}, {data['city']}, {data['state']}, {data['pin']}"
    lat = data.get("latitude")
    lon = data.get("longitude")
    new_user = User(
        username=username,
        email=email,
        password=password,
        phone=data["phone"],
        role=data["role"],
        address=address,
        city=data["city"],
        state=data["state"],
        pin=data["pin"],
        latitude=lat,
        longitude=lon
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Signup successful"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "role": user.role}), 200


@auth_bp.route('/geocode', methods=['GET'])
def geocode_address():
    import requests

    address = request.args.get('q')
    if not address:
        return jsonify({"error": "Missing address"}), 400

    print(f"📫 Received geocode request for address: {address}")

    headers = {"User-Agent": "PublicCareApp/1.0"}
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={address}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"🌐 Nominatim status code: {response.status_code}")

        data = response.json()
        print(f"✅ Parsed Nominatim response ({len(data)} results)")

        # If no results, progressively simplify the address
        if not data:
            parts = address.split(',')
            while len(parts) > 1:
                parts.pop(0)  # remove front portion (house/street)
                simpler = ','.join(parts).strip()
                print(f"🔁 Retrying with simplified address: {simpler}")
                retry_url = f"https://nominatim.openstreetmap.org/search?format=json&q={simpler}"
                retry_response = requests.get(retry_url, headers=headers, timeout=10)
                data = retry_response.json()
                if data:
                    break

        if data:
            return jsonify({
                "latitude": data[0]["lat"],
                "longitude": data[0]["lon"],
                "display_name": data[0]["display_name"]
            })

        return jsonify({"error": "No results found"}), 404

    except Exception as e:
        print(f"❌ Geocode error: {e}")
        return jsonify({"error": "Internal server error"}), 500
