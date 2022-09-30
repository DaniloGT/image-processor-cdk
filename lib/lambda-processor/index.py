from io import BytesIO
import PIL
import json
import boto3


def processor_handler(event, context):
  """
  This function read the image from the bucket, edit the image, and
  then upload the image to another bucket
  """
  # Name of the object
  s3_event_key = (json.loads(
    event["Records"][0]["Sns"]["Message"]
  )["Records"][0]["s3"]["object"]["key"])

  s3_event_key_done = s3_event_key.split("/")[-1]

  # Name of the bucket
  s3_bucket = (json.loads(
    event["Records"][0]["Sns"]["Message"]
  )["Records"][0]["s3"]["bucket"]["name"])

  # Read image from s3
  s3 = boto3.client("s3")
  obj = s3.get_object(
    Bucket = s3_bucket,
    Key = s3_event_key
  )

  # Edit image
  old_image = PIL.Image.open(obj)
  new_image = old_image.transpose(PIL.Image.Transpose.FLIP_LEFT_RIGHT).convert("1")

  in_mem_file = BytesIO()
  new_image.save(in_mem_file, format = old_image.format)
  in_mem_file.seek(0)

  # Store edited image in bucket
  s3.put_object(
    Bucket = s3_bucket,
    Key = f"done/{s3_event_key_done}",
    Body = in_mem_file,
  )

  response = {
    "statusCode": str(200),
    "body": json.dumps(f"Image ready"),
  }

  return response
