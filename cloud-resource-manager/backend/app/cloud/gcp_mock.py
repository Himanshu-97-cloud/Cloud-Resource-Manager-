# GCP mock implementation
# app/cloud/gcp_mock.py
import uuid
from datetime import datetime, timedelta
from typing import List, Dict


def create_resource(name: str, rtype: str, region: str):
    external_id = f"gcp-{rtype.lower()}-{uuid.uuid4().hex[:8]}"
    status = "Running"
    return external_id, status


def generate_metrics() -> List[Dict]:
    now = datetime.utcnow()
    data: List[Dict] = []
    for i in range(24, -1, -1):
        t = now - timedelta(minutes=i * 5)
        data.append(
            {
                "time": t.isoformat(),
                "cpu": 30.0 + (i % 7) * 4.0,
                "memory": 50.0 + (i % 5) * 3.0,
                "networkIn": (i % 6) * 15.0,
                "networkOut": (i % 4) * 10.0,
            }
        )
    return data
