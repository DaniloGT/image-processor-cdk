import base64
import boto3
import json
import os
import uuid

def uploader_handler(event, context):
  """
  This image upload the image to the bucket
  """
  if "Content-Type" not in event["headers"] or "image" not in event["headers"]["Content-Type"]:
    response = {
      "statusCode": str(400),
      "body": json.dumps({
        "message": "The file that you are trying to upload is not an image",
      })
    }

    return response

  try:
    image_name = str(uuid.uuid4())
    content_type = event["headers"]["Content-Type"].split("/")[-1]
    file_name = f"{image_name}.{content_type}"

    url = event["requestContext"]["domainName"]
    stage = event["requestContext"]["stage"]

    download_url = f"https://{url}/{stage}/download"

    s3 = boto3.client("s3")

    s3.put_object(
      Bucket = os.environ["BUCKET_NAME"],
      Key = f"raw/{file_name}",
      Body = base64.b64decode(event["body"]),
    )

    response = {
      "statusCode": str(200),
      "body": json.dumps({
        "message": "Your image was correctly uploaded",
        "url": f"{download_url}?fileName={file_name}",
      }),
      "headers": {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
        "X-Requested-With": "*",
      },
    }

  except Exception as e:
    response = {
      "statusCode": str(400),
      "body": json.dumps({
        "message": "An error occurred",
        "error": e,
      })
    }

  return response
