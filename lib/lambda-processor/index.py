import json

def processor_handler(event, context):
  # Procesar imagen y subir a bucket/done
  print('hola de nuevo')
  
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
