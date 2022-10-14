FROM node:16-alpine

WORKDIR /usr/src/app/

COPY ./express/package*.json ./
#COPY ./express ./express

RUN npm install .

COPY ./express .
COPY ./angular/dist/bombi ./static

EXPOSE 4545
CMD ["node", "./bin/www"]