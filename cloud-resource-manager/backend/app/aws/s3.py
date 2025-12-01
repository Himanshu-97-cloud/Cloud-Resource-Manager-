# S3 helper functions
# app/aws/s3.py
import os
import uuid

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")


def _client(region: str = AWS_REGION):
    return boto3.client("s3", region_name=region)


def create_bucket(name: str, region: str = AWS_REGION):
    s3 = _client(region)
    bucket_name = f"{name.lower()}-{uuid.uuid4().hex[:8]}"

    try:
        if region == "us-east-1":
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )
        return bucket_name, "Running"
    except (ClientError, NoCredentialsError) as e:
        print("S3 create failed, using logical-only bucket:", e)
        fake_id = f"aws-s3-local-{uuid.uuid4().hex[:8]}"
        return fake_id, "NotCreatedInAWS"


def delete_bucket(bucket_name: str, region: str = AWS_REGION) -> bool:
    if bucket_name.startswith("aws-s3-local-"):
        print("[S3] Skipping delete for logical-only bucket:", bucket_name)
        return True

    s3 = _client(region)
    try:
        resp = s3.list_objects_v2(Bucket=bucket_name)
        for obj in resp.get("Contents", []):
            s3.delete_object(Bucket=bucket_name, Key=obj["Key"])
        s3.delete_bucket(Bucket=bucket_name)
        return True
    except ClientError as e:
        print("S3 delete failed:", e)
        return False
