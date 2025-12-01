# Azure mock implementation
# app/cloud/azure_mock.py
import uuid
from datetime import datetime, timedelta
from typing import List, Dict


def create_resource(name: str, rtype: str, region: str):
    external_id = f"azure-{rtype.lower()}-{uuid.uuid4().hex[:8]}"
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
                "cpu": 25.0 + (i % 6) * 3.5,
                "memory": 45.0 + (i % 4) * 3.5,
                "networkIn": (i % 5) * 20.0,
                "networkOut": (i % 7) * 9.0,
            }
        )
    return data
