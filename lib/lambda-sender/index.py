import json

def processor_handler(event, context):
  '''Send image to user using a signed url'''

  response = {
    "statusCode": str(200),
    "body": json.dumps(f'Hello from lambda'),
  }

  return response
