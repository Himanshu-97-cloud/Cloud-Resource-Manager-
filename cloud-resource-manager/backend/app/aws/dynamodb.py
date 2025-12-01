# DynamoDB helper functions
# app/aws/dynamodb.py
import os
import uuid

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")


def _client(region: str = AWS_REGION):
    return boto3.client("dynamodb", region_name=region)


def create_table(name: str, region: str = AWS_REGION):
    dynamo = _client(region)
    table_name = f"{name.replace(' ', '_')}_{uuid.uuid4().hex[:6]}"

    try:
        dynamo.create_table(
            TableName=table_name,
            AttributeDefinitions=[
                {"AttributeName": "id", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "id", "KeyType": "HASH"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        return table_name, "Creating"
    except (ClientError, NoCredentialsError) as e:
        print("DynamoDB create failed, using logical-only table:", e)
        fake_id = f"aws-ddb-local-{uuid.uuid4().hex[:6]}"
        return fake_id, "NotCreatedInAWS"


def delete_table(table_name: str, region: str = AWS_REGION) -> bool:
    if table_name.startswith("aws-ddb-local-"):
        print("[DynamoDB] Skipping delete for logical-only table:", table_name)
        return True

    dynamo = _client(region)
    try:
        dynamo.delete_table(TableName=table_name)
        return True
    except ClientError as e:
        print("DynamoDB delete failed:", e)
        return False


def get_table_status(table_name: str, region: str = AWS_REGION) -> str | None:
    if table_name.startswith("aws-ddb-local-"):
        return "Running"

    dynamo = _client(region)
    try:
        resp = dynamo.describe_table(TableName=table_name)
        return resp["Table"]["TableStatus"].capitalize()
    except ClientError as e:
        print("DynamoDB status check failed:", e)
        return None
