# Proyecto Lambda con AWS CDK y Docker (ECR)

Este proyecto utiliza AWS CDK para desplegar una función Lambda empaquetada como contenedor Docker en ECR (Elastic Container Registry)

## Requisitos previos

- Node.js >= 14.x
- Docker instalado y corriendo
- Una cuenta de AWS activa
- Tener configuradas tus credenciales de AWS

## Pasos para desplegar

1. Clonar el repositorio:
- git clone https://github.com/Lauraperezal10/Fechas-habiles-lambda.git

2. Instalar AWS CDK globalmente:
- npm install -g aws-cdk

3. Configurar un perfil de AWS:
- aws configure --profile myProfile

4. Instalar dependencias del proyecto:
- npm install

5. Compilar y desplegar con CDK:
- npm run build
- cdk bootstrap --profile myProfile
- npx cdk deploy --profile myProfile

Una vez finalizado el despliegue, se mostrará una URL como la siguiente:
Outputs:
MyLambdaStack.MyLambdaFunctionUrl = https://xxxxxx.lambda-url.us-east-1.on.aws/

Esa URL corresponde a la función Lambda desplegada en un contenedor Docker, alojado en ECR.

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
