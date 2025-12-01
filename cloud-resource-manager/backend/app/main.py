# app/main.py
from datetime import datetime, timedelta
from typing import List

import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from .database import Base, engine, get_db
from . import models, schemas
from .aws import ec2, s3, dynamodb, lambda_fn, metrics as aws_metrics
from .cloud import gcp_mock, azure_mock

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cloud Resource Manager API")

# -----------------------------------------------------
# CORS for React/Vite frontend
# -----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# -----------------------------------------------------
# Helpers
# -----------------------------------------------------
def estimate_inr_cost(provider: str, rtype: str) -> float:
    if provider == "AWS":
        if rtype == "VM":
            return 800.0
        if rtype == "Storage":
            return 50.0
        if rtype == "Database":
            return 300.0
        if rtype == "Serverless":
            return 50.0
        if rtype == "Load Balancer":
            return 200.0
    if provider in ("GCP", "Azure"):
        return 900.0
    return 0.0


def generate_mock_metrics(num_points: int = 24) -> List[schemas.MetricPoint]:
    now = datetime.utcnow()
    points: List[schemas.MetricPoint] = []
    for i in range(num_points, -1, -1):
        t = now - timedelta(hours=i)
        cpu = 20.0 + (i % 10) * 3.0
        memory = 40.0 + (i % 7) * 4.0
        net_in = (i % 5) * 10.0
        net_out = (i % 6) * 8.0
        points.append(
            schemas.MetricPoint(
                time=t.isoformat(),
                cpu=cpu,
                memory=memory,
                networkIn=net_in,
                networkOut=net_out,
            )
        )
    return points


# -----------------------------------------------------
# Resources (CRUD)
# -----------------------------------------------------
@app.get("/resources", response_model=list[schemas.ResourceBase])
def list_resources(db: Session = Depends(get_db)):
    resources = db.query(models.Resource).all()

    # --- Refresh AWS statuses and normalise them ---
    for r in resources:
        if r.provider != "AWS":
            continue

        try:
            # EC2 instances
            if r.type == "VM":
                state = ec2.get_instance_state(r.external_id or "")

                # Map raw EC2 states to our friendly statuses
                state_map = {
                    "pending": "Running",       # treat as up for UI
                    "running": "Running",
                    "stopping": "Stopped",
                    "stopped": "Stopped",
                    "shutting-down": "Stopped",
                    "terminated": "Terminated",
                }
                mapped = state_map.get(state.lower(), r.status or "Unknown") if state else r.status

                if mapped and mapped != r.status:
                    r.status = mapped
                    r.updated_at = datetime.utcnow()

            # DynamoDB tables
            elif r.type == "Database":
                raw = dynamodb.get_table_status(r.external_id or "")
                # DynamoDB statuses (simplified)
                table_map = {
                    "creating": "Running",
                    "updating": "Running",
                    "active": "Running",
                    "deleting": "Deleted",
                }
                mapped = table_map.get(raw.lower(), r.status or "Unknown") if raw else r.status
                if mapped and mapped != r.status:
                    r.status = mapped
                    r.updated_at = datetime.utcnow()

            # S3 storage – if it exists we treat as Running
            elif r.type == "Storage":
                if r.status != "Running":
                    r.status = "Running"
                    r.updated_at = datetime.utcnow()

        except Exception as e:
            # If AWS is unreachable / credentials issue etc
            print("Status refresh failed:", r.id, r.external_id, "->", e)
            if r.status not in ("Running", "Stopped", "Terminated", "Deleted"):
                r.status = "Failed"
                r.updated_at = datetime.utcnow()

    db.commit()

    out: list[schemas.ResourceBase] = []
    for r in resources:
        out.append(
            schemas.ResourceBase(
                id=r.id,
                name=r.name,
                provider=r.provider,
                type=r.type,
                region=r.region,
                status=r.status,
                cpu=r.cpu,
                memory=r.memory,
                storage=r.storage,
                costPerMonth=r.cost_per_month_inr,
                uptime=r.uptime,
                tags=r.tags or [],
            )
        )
    return out


@app.post("/resources", response_model=schemas.ResourceBase)
def create_resource(payload: schemas.ResourceCreate, db: Session = Depends(get_db)):
    provider = payload.provider
    rtype = payload.type
    region = payload.region

    # Lock AWS to Mumbai
    if provider == "AWS":
        region = "ap-south-1"

    external_id = ""
    status = "Creating"
    cpu = None
    memory = None
    storage = None

    # ----- AWS real resources -----
    if provider == "AWS":
        try:
            if rtype == "VM":
                instance_id, raw_status = ec2.create_instance(payload.name, region)
                external_id = instance_id
                # normalise EC2 initial state
                if raw_status and raw_status.lower() in ("pending", "running"):
                    status = "Running"
                else:
                    status = raw_status or "Running"
                cpu = "1 vCPU"
                memory = "1 GB"

            elif rtype == "Storage":
                bucket_name, raw_status = s3.create_bucket(payload.name, region)
                external_id = bucket_name
                status = raw_status or "Running"
                storage = "5 GB"

            elif rtype == "Database":
                table_name, raw_status = dynamodb.create_table(payload.name, region)
                external_id = table_name
                # DynamoDB starts as CREATING; treat as Running for UI
                if raw_status and raw_status.lower() in ("creating", "active", "updating"):
                    status = "Running"
                else:
                    status = raw_status or "Running"

            elif rtype == "Serverless":
                fn_name, raw_status = lambda_fn.create_basic_function(payload.name, region)
                external_id = fn_name
                status = raw_status or "Running"

            elif rtype == "Load Balancer":
                # still logical only for demo
                external_id = f"aws-lb-{payload.name}"
                status = "NotSupportedInFreeTier"

        except Exception as e:
            # Any AWS failure -> mark Failed
            print("AWS create failed:", e)
            external_id = ""
            status = "Failed"

    # ----- GCP (mock) -----
    elif provider == "GCP":
        try:
            external_id, status = gcp_mock.create_resource(payload.name, rtype, region)
        except Exception as e:
            print("GCP mock create failed:", e)
            external_id = ""
            status = "Failed"

    # ----- Azure (mock) -----
    elif provider == "Azure":
        try:
            external_id, status = azure_mock.create_resource(payload.name, rtype, region)
        except Exception as e:
            print("Azure mock create failed:", e)
            external_id = ""
            status = "Failed"

    cost_inr = estimate_inr_cost(provider, rtype)

    db_res = models.Resource(
        name=payload.name,
        provider=provider,
        type=rtype,
        region=region,
        status=status,
        external_id=external_id,
        cpu=cpu,
        memory=memory,
        storage=storage,
        cost_per_month_inr=cost_inr,
        uptime=100.0,
        tags=[],
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)

    log = models.ActionLog(
        resource_id=db_res.id,
        user_email="system",
        action="create",
        status="Success" if status != "Failed" else "Failure",
        provider=provider,
        details={"external_id": external_id},
    )
    db.add(log)
    db.commit()

    return schemas.ResourceBase(
        id=db_res.id,
        name=db_res.name,
        provider=db_res.provider,
        type=db_res.type,
        region=db_res.region,
        status=db_res.status,
        cpu=db_res.cpu,
        memory=db_res.memory,
        storage=db_res.storage,
        costPerMonth=db_res.cost_per_month_inr,
        uptime=db_res.uptime,
        tags=db_res.tags or [],
    )


@app.put("/resources/{resource_id}", response_model=schemas.ResourceBase)
def update_resource(
    resource_id: int,
    payload: schemas.ResourceUpdate,
    db: Session = Depends(get_db),
):
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    if payload.name is not None:
        res.name = payload.name
    if payload.region is not None:
        res.region = payload.region
    if payload.status is not None:
        res.status = payload.status
    if payload.tags is not None:
        res.tags = payload.tags

    res.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(res)

    log = models.ActionLog(
        resource_id=res.id,
        user_email="system",
        action="update",
        status="Success",
        provider=res.provider,
        details={"updated_fields": payload.model_dump(exclude_unset=True)},
    )
    db.add(log)
    db.commit()

    return schemas.ResourceBase(
        id=res.id,
        name=res.name,
        provider=res.provider,
        type=res.type,
        region=res.region,
        status=res.status,
        cpu=res.cpu,
        memory=res.memory,
        storage=res.storage,
        costPerMonth=res.cost_per_month_inr,
        uptime=res.uptime,
        tags=res.tags or [],
    )


@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    if res.provider == "AWS":
        try:
            if res.type == "VM":
                ec2.terminate_instance(res.external_id or "")
            elif res.type == "Storage":
                s3.delete_bucket(res.external_id or "")
            elif res.type == "Database":
                dynamodb.delete_table(res.external_id or "")
            # Serverless / LB: logical-only for now
        except Exception as e:
            print("Cloud delete failed, deleting only from DB:", e)

    log = models.ActionLog(
        resource_id=res.id,
        user_email="system",
        action="delete",
        status="Success",
        provider=res.provider,
        details={},
    )
    db.add(log)
    db.delete(res)
    db.commit()
    return {"message": "Deleted"}


# -----------------------------------------------------
# Metrics & Alerts
# -----------------------------------------------------
@app.get("/resources/{resource_id}/metrics", response_model=list[schemas.MetricPoint])
def get_metrics(resource_id: int, db: Session = Depends(get_db)):
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    # --- AWS: try real CloudWatch, fallback to mock ---
    if res.provider == "AWS" and res.type == "VM":
        try:
            raw = aws_metrics.get_ec2_cpu_network(res.external_id or "")
            if raw:
                return [schemas.MetricPoint(**m) for m in raw]
        except Exception as e:
            print("AWS metrics error, falling back to mock:", e)
        return generate_mock_metrics()

    # --- GCP / Azure: mock metrics for now ---
    if res.provider == "GCP" and res.type == "VM":
        try:
            raw = gcp_mock.generate_metrics()
            if raw:
                return [schemas.MetricPoint(**m) for m in raw]
        except Exception as e:
            print("GCP mock metrics error, using generic:", e)
        return generate_mock_metrics()

    if res.provider == "Azure" and res.type == "VM":
        try:
            raw = azure_mock.generate_metrics()
            if raw:
                return [schemas.MetricPoint(**m) for m in raw]
        except Exception as e:
            print("Azure mock metrics error, using generic:", e)
        return generate_mock_metrics()

    # --- any other resource type/provider: generic mock series ---
    return generate_mock_metrics()


@app.get("/alerts", response_model=list[schemas.Alert])
def get_alerts(db: Session = Depends(get_db)):
    alerts: list[schemas.Alert] = []
    resources = db.query(models.Resource).all()
    now = datetime.utcnow()
    for r in resources:
        if r.status not in ("Running", "Stopped"):
            alerts.append(
                schemas.Alert(
                    id=f"alert-{r.id}-status",
                    title=f"{r.name} is in {r.status} state",
                    severity="Warning",
                    time=now.isoformat(),
                )
            )
    return alerts


# -----------------------------------------------------
# Logs & Users
# -----------------------------------------------------
@app.get("/logs", response_model=list[schemas.LogEntry])
def list_logs(db: Session = Depends(get_db)):
    logs = db.query(models.ActionLog).order_by(models.ActionLog.timestamp.desc()).all()
    result: list[schemas.LogEntry] = []
    for l in logs:
        result.append(
            schemas.LogEntry(
                id=l.id,
                timestamp=l.timestamp.isoformat(),
                user=l.user_email or "system",
                action=l.action,
                resource=l.resource.name if l.resource else "",
                status=l.status,
                provider=l.provider,
            )
        )
    return result


@app.get("/users", response_model=list[schemas.UserBase])
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()

    # Seed a default admin user if DB is empty
    if not users:
        admin = models.User(
            email="admin@example.com",
            name="Cloud Admin",
            password_hash="demo",
            role="Admin",
            avatar="https://picsum.photos/80/80",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        users = [admin]

    out: list[schemas.UserBase] = []
    for u in users:
        out.append(
            schemas.UserBase(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                status=u.status,
                avatar=u.avatar or "https://picsum.photos/80/80",
                lastLogin=u.last_login.isoformat(),
            )
        )
    return out


if __name__ == "__main__":
    uvicorn.run("app.main:app", reload=True)
