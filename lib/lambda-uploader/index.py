def uploader_handler(event, context):
  # Subir imagen a bucket/raw desde b64
  print('hola mundo')

  response = {"statusCode": str(200),
              "body": json.dumps(f'Hello from lambda'),
              "headers": {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": '*',
                  "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
                  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
                  "X-Requested-With": "*"                            },
              }
