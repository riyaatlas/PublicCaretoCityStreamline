from flask import Flask
from config import Config
from extensions import db, jwt, cors
from flask_jwt_extended import JWTManager

jwt = JWTManager()
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
   
    cors.init_app(app)
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
