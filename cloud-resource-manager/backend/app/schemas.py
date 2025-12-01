# app/schemas.py
from typing import List, Optional, Literal
from pydantic import BaseModel

# ---- Common literal types ----

CloudProvider = Literal["AWS", "Azure", "GCP"]
ResourceType = Literal["VM", "Storage", "Database", "Load Balancer", "Serverless"]


# ---- Users / RBAC ----

class UserBase(BaseModel):
    id: int
    name: str
    email: str
    role: Literal["Admin", "DevOps", "Viewer"]
    lastLogin: str
    status: Literal["Active", "Inactive"]
    avatar: str

    class Config:
        from_attributes = True  # pydantic v2 replacement for orm_mode = True


# ---- Resources ----

class ResourceBase(BaseModel):
    id: int
    name: str
    type: ResourceType
    provider: CloudProvider
    region: str
    status: str
    cpu: Optional[str] = None
    memory: Optional[str] = None
    storage: Optional[str] = None
    costPerMonth: float
    uptime: float
    tags: List[str]

    class Config:
        from_attributes = True


class ResourceCreate(BaseModel):
    """
    This MUST match what the frontend sends in CreateResourceModal
    and what main.create_resource() expects.
    """

    name: str
    provider: CloudProvider        # "AWS" | "GCP" | "Azure"
    type: ResourceType             # "VM" | "Storage" | ...
    region: str
    config: dict = {}              # extra options; not used yet


class ResourceUpdate(BaseModel):
    """
    For PUT /resources/{id} – everything optional.
    """
    name: Optional[str] = None
    region: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None


# ---- Logs ----

class LogEntry(BaseModel):
    id: int
    timestamp: str
    user: str
    action: str
    resource: str
    status: Literal["Success", "Failure"]
    provider: CloudProvider

    class Config:
        from_attributes = True


# ---- Metrics ----

class MetricPoint(BaseModel):
    time: str
    cpu: float
    memory: float
    networkIn: float
    networkOut: float


# ---- Alerts ----

class Alert(BaseModel):
    id: str
    title: str
    severity: Literal["Critical", "Warning", "Info"]
    time: str
