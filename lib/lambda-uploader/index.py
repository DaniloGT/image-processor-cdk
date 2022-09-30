import json
import os
import boto3

def uploader_handler(event, context):
  # Subir imagen a bucket/raw desde b64

  s3 = boto3.resource("s3")

  bucket_name = os.environ['BUCKET_NAME']

  s3_path = 'raw/file.txt'
  event_p = json.dumps(event)

  s3.Bucket(bucket_name).put_object(Key=s3_path, Body=event_p.encode('utf-8'))

  response = {
    "statusCode": str(200),
    "body": json.dumps(f'File saved'),
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
      "X-Requested-With": "*"
    },
  }

  return response
