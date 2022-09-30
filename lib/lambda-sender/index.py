import json
import boto3

def processor_handler(event, context):
  '''Send image to user'''

  image_name = event["queryStringParameters"]["image_name"]
  bucket_name = 'image-processor-bucket-veryuniquename'

  try:
    # Get image from s3
    s3_client = boto3.client('s3')
    response = s3_client.generate_presigned_url('get_object',
                                                Params={'Bucket': bucket_name,
                                                        'Key': image_name},
                                                ExpiresIn=3600)
    print(response)
    text_to_response = 'Here is your image:'
  except:
    text_to_response = 'Your image is still being processed. Try again later.'


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
