# Editor de imagenes [Proyecto CDK]

La idea de este proyecto es construir un editor de imagenes usando CDK para levantar la infraestructura en AWS.

La idea es que nuestros clientes puedan llamar a un endpoint de una API, con su imagen y nosotros retornamos la imagen editada

## La infraestructura (Version 1.0)

La primera versión de la infraestructura constará de solo dos recursos, un api gateway y una lambda.

El api gateway nos brindará una URL para invocar a nuestro editor de imagenes.

La lambda, será nuestra capa de computo, acá es donde editaremos la imagen y la dejaremos lista para ser devuelta a un usuario por la misma API

## ¿Como levanto esta infraestructura?

Primero, siempre puedes saber si tu infraestructura esta bien ejecutando `cdk synth`
Al ejecutar ese comando, se generará un archivo en la carpeta cdk.out con los recursos de tu stack.

Si no tienes problemas con el paso anterior entonces estas listo para desplegar tu infraestructura!!
Para eso ejecuta `cdk deploy` 

## La infraestructura (Version 2.0)

Como no queremos mantener todo el proceso de backend junto, vamos a dividir un poco más la infraestructura y así delegar responsabilidades.
(divide and conquer)
La infraestructura 2.0 queda así:
* Un API para recibir requests
* Una lambda que recibe aquella request y guarda la imagen en un bucket
* Un bucket para guardar imagenes
* Una topico SNS que es notificado si hay un archivo nuevo en un bucket
* Una lambda que modifica la imagen
* Una lambda que envia la imagen al cliente final

