# app/aws/metrics.py
from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

import boto3
from botocore.exceptions import ClientError

DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")


def _cloudwatch(region: str | None = None):
    return boto3.client("cloudwatch", region_name=region or DEFAULT_REGION)


def get_ec2_cpu_network(instance_id: str) -> List[Dict[str, Any]]:
    """
    Fetch real CloudWatch metrics for a single EC2 instance.
    Returns list of dicts:
      { "time": iso, "cpu": float, "memory": float, "networkIn": float, "networkOut": float }
    Memory is estimated (EC2 doesn't expose it natively without CW Agent).
    """
    if not instance_id or instance_id.startswith("ec2-error-"):
        return []

    cw = _cloudwatch(None)

    end = datetime.utcnow()
    start = end - timedelta(hours=2)  # last 2 hours
    period = 300  # 5 min points (CloudWatch basic resolution)

    def fetch(metric_name: str, stat: str) -> List[Dict[str, Any]]:
        resp = cw.get_metric_statistics(
            Namespace="AWS/EC2",
            MetricName=metric_name,
            Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
            StartTime=start,
            EndTime=end,
            Period=period,
            Statistics=[stat],
        )
        return resp.get("Datapoints", [])

    try:
        cpu_points = fetch("CPUUtilization", "Average")
        net_in_points = fetch("NetworkIn", "Sum")
        net_out_points = fetch("NetworkOut", "Sum")
    except ClientError as e:
        print("[CW] get_ec2_cpu_network failed:", e)
        return []

    # Index by timestamp to merge metrics
    by_ts: Dict[datetime, Dict[str, Any]] = {}

    for p in cpu_points:
        ts = p["Timestamp"]
        by_ts.setdefault(ts, {})["cpu"] = float(p.get("Average", 0.0))

    for p in net_in_points:
        ts = p["Timestamp"]
        by_ts.setdefault(ts, {})["networkIn"] = float(p.get("Sum", 0.0))

    for p in net_out_points:
        ts = p["Timestamp"]
        by_ts.setdefault(ts, {})["networkOut"] = float(p.get("Sum", 0.0))

    # Build final list, sorted by time
    result: List[Dict[str, Any]] = []
    for ts in sorted(by_ts.keys()):
        entry = by_ts[ts]
        cpu = float(entry.get("cpu", 0.0))
        net_in = float(entry.get("networkIn", 0.0))
        net_out = float(entry.get("networkOut", 0.0))

        # EC2 doesn't give Memory usage by default → make a simple estimate
        # so the second chart is not empty (this part is 'derived', not real).
        memory = min(100.0, cpu * 0.6 + 20.0)

        result.append(
            {
                "time": ts.isoformat(),
                "cpu": cpu,
                "memory": memory,
                "networkIn": net_in,
                "networkOut": net_out,
            }
        )

    print(f"[CW] Loaded {len(result)} points for {instance_id}")
    return result
