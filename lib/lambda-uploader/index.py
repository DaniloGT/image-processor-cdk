import json
import uuid


def uploader_handler(event, context):
  """
  This image upload the image to the bucket
  """

  image_name = str(uuid.uuid4())

  # Store uploaded image in bucket
  # s3.upload_file(image_name, bucket, edited_image)

  response = {
    "statusCode": str(200),
    "body": json.dumps(f'Your image was correctly upload and we will send you and email to download your new image'),
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
      "X-Requested-With": "*"
    },
  }

  return response
