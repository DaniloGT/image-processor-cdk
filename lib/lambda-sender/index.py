import boto3
import json
import os

def sender_handler(event, context):
  """Send image to user"""

  if "fileName" not in event["queryStringParameters"]:
    response = {
      "statusCode": str(400),
      "body": json.dumps({
        "message": "You must provide a file name",
      })
    }

    return response

  image_name = event["queryStringParameters"]["fileName"]

  s3_client = boto3.client("s3")

  try:
    s3_client.head_object(
      Bucket = os.environ["BUCKET_NAME"],
      Key = f"done/{image_name}"
    )

    presigned_url = s3_client.generate_presigned_url(
      "get_object",
      Params={
        "Bucket": os.environ["BUCKET_NAME"],
        "Key": f"done/{image_name}"
      },
      ExpiresIn=3600
    )

    response = {
      "statusCode": str(200),
      "body": json.dumps({
        "message": "Here is your image:",
        "imageUrl": presigned_url,
      })
    }

  except Exception:
    response = {
      "statusCode": str(400),
      "body": json.dumps({
        "message": "Your image is still being processed. Try again later.",
      })
    }

  return response
