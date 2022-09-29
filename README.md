# Editor de imagenes [Proyecto CDK]

La idea de este proyecto es construir un editor de imagenes usando CDK para levantar la infraestructura en AWS.

La idea es que nuestros clientes puedan llamar a un endpoint de una API, con su imagen y nosotros retornamos la imagen editada

## La infraestructura (Version 1.0)

La primera versión de la infraestructura constará de solo dos recursos, un api gateway y una lambda.

El api gateway nos brindará una URL para invocar a nuestro editor de imagenes.

La lambda, será nuestra capa de computo, acá es donde editaremos la imagen y la dejaremos lista para ser devuelta a un usuario


The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## Layer

Para usar la layer, hay que ejecutar el script layer.cmd que hace un pip install con un directorio como output, luego ese directorio se usa en el recurso LayerVersion para subir las librerías requeridas.
