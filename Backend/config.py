import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "super-secret-key"
    JWT_SECRET_KEY = "super-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
