# app/aws/ec2.py
from __future__ import annotations

import os
from datetime import datetime
from typing import Tuple

import boto3
from botocore.exceptions import ClientError

DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")

# You can override these from .env if needed
AMI_ID = os.getenv("AWS_EC2_AMI_ID", "ami-0f58b397bc5c1f2e8")  # check in AWS console
INSTANCE_TYPE = os.getenv("AWS_EC2_INSTANCE_TYPE", "t3.micro")  # free-tier eligible in most accounts


def _ec2(region: str | None = None):
    return boto3.client("ec2", region_name=region or DEFAULT_REGION)


def create_instance(name: str, region: str) -> Tuple[str, str]:
    """
    Create a single free-tier EC2 instance and return (instance_id, status).
    Status will usually start as 'pending'.
    If AWS rejects the call, we return a logical ID and 'Error' so UI still works.
    """
    client = _ec2(region)
    try:
        resp = client.run_instances(
            ImageId=AMI_ID,
            InstanceType=INSTANCE_TYPE,
            MinCount=1,
            MaxCount=1,
            TagSpecifications=[
                {
                    "ResourceType": "instance",
                    "Tags": [
                        {"Key": "Name", "Value": name},
                        {"Key": "Project", "Value": "CloudResourceManagerDemo"},
                    ],
                }
            ],
        )
        instance = resp["Instances"][0]
        instance_id = instance["InstanceId"]
        print(f"[EC2] Created instance {instance_id} in {region}")
        return instance_id, "pending"
    except ClientError as e:
        # Log the exact AWS error, but don't crash the API
        print("[EC2] create_instance failed:", e)
        logical_id = f"ec2-error-{datetime.utcnow().isoformat()}"
        return logical_id, "Error"


def get_instance_state(instance_id: str) -> str | None:
    """
    Return EC2 state: 'pending', 'running', 'stopping', 'stopped', 'terminated', etc.
    """
    if not instance_id or instance_id.startswith("ec2-error-"):
        return None

    client = _ec2(None)
    try:
        resp = client.describe_instances(InstanceIds=[instance_id])
        reservations = resp.get("Reservations", [])
        if not reservations:
            return None
        inst = reservations[0]["Instances"][0]
        return inst["State"]["Name"]
    except ClientError as e:
        print("[EC2] get_instance_state failed:", e)
        return None


def terminate_instance(instance_id: str) -> None:
    """
    Terminate a running instance. If it fails, we just log.
    """
    if not instance_id or instance_id.startswith("ec2-error-"):
        return

    client = _ec2(None)
    try:
        client.terminate_instances(InstanceIds=[instance_id])
        print(f"[EC2] Terminate called for {instance_id}")
    except ClientError as e:
        print("[EC2] terminate_instance failed:", e)
