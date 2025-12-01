# SQLAlchemy models (we will fill this)
# app/models.py
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship

from .database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)  # "AWS", "GCP", "Azure"
    type = Column(String, nullable=False)      # "VM", "Storage", "Database", "Serverless", "Load Balancer"
    region = Column(String, nullable=False)
    status = Column(String, default="Creating")   # "Running", "Stopped", "Error", etc.
    external_id = Column(String, nullable=True)   # cloud resource id (EC2 instance id, bucket name, etc.)

    cpu = Column(String, nullable=True)       # e.g. "1 vCPU"
    memory = Column(String, nullable=True)    # e.g. "1 GB"
    storage = Column(String, nullable=True)   # e.g. "5 GB"

    cost_per_month_inr = Column(Float, default=0.0)
    uptime = Column(Float, default=100.0)     # just a simple percentage for now

    tags = Column(JSON, nullable=True)        # list of strings or dict

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationship to logs
    logs = relationship("ActionLog", back_populates="resource", cascade="all, delete-orphan")


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)

    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False)   # "create", "update", "delete"
    status = Column(String, nullable=False)   # "Success", "Error"
    provider = Column(String, nullable=True)  # "AWS", "GCP", etc.

    details = Column(JSON, nullable=True)

    resource = relationship("Resource", back_populates="logs")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)  # for future auth
    role = Column(String, default="Viewer")        # "Admin", "Developer", etc.

    status = Column(String, default="Active")
    avatar = Column(String, nullable=True)
    last_login = Column(DateTime, default=datetime.utcnow)
