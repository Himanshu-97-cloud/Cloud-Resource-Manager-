# Lambda helper functions
# app/aws/lambda_fn.py
import os
import uuid

# For now we return logical-only Lambda IDs.
# You can wire real lambda.create_function later if needed.

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")


def create_basic_function(name: str, region: str = AWS_REGION):
    fake_arn = f"arn:aws:lambda:{region}:000000000000:function:{name}-{uuid.uuid4().hex[:6]}"
    return fake_arn, "Running"
