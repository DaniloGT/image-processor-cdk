import base64
import boto3
import json
import os
import uuid

def uploader_handler(event, context):
  """
  This image upload the image to the bucket
  """

  image_name = str(uuid.uuid4())
  content_type = event["headers"]["Content-Type"].split("/")[-1]
  s3 = boto3.client("s3")
  bucket_name = os.environ["BUCKET_NAME"]

  b_file = base64.b64decode(event["body"])

  s3.put_object(
    Bucket = bucket_name,
    Key = f"raw/{image_name}.{content_type}",
    Body=b_file
  )

  response = {
    "statusCode": str(200),
    "body": json.dumps({
      "message": "Your image was correctly uploaded",
      "url": f"wena/pagina/{image_name}"
    }),
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
      "X-Requested-With": "*"
    },
  }

  return response
