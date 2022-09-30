import json
import PIL
import boto3


def processor_handler(event, context):
  '''
  This function read the image from the bucket, edit the image, and
  then upload the image to another bucket
  '''
  print('hola de nuevo')
  print(PIL.__version__)

  # Name of the object
  s3_event_key = (json.loads(event['Records'][0]['Sns']['Message'])
                  ["Records"][0]["s3"]["object"]["key"])
  
  # Name of the bucket
  s3_bucket = (json.loads(event['Records'][0]['Sns']['Message'])
                ["Records"][0]["s3"]["bucket"]["name"])

  print(f's3_event_key: {s3_event_key}')
  print(f's3_bucket: {s3_bucket}')

  # Read image from s3
  s3 = boto3.client("s3")
  obj = s3.get_object(Bucket=s3_bucket, Key=s3_event_key)

  # Edit image

  # Store edited image in bucket
  # s3.upload_file(file_name, bucket, edited_image)

  response = {
    "statusCode": str(200),
    "body": json.dumps(f'Hello from lambda'),
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
      "X-Requested-With": "*"
    },
  }

  return response
