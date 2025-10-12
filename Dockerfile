# Dockerfile
FROM public.ecr.aws/lambda/nodejs:18

WORKDIR /var/task

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD [ "dist/lambda/index.handler" ]
