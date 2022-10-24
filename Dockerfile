FROM node:bullseye-slim
RUN apt update
RUN apt install python3 wget libegl1 libopengl0 xz-utils python3-pyqt5 -y
RUN wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin
ENV PATH="${PATH}:/opt/calibre/"

#FROM node:16-alpine
#RUN apk add python3 python3-requests

WORKDIR /usr/src/app/


RUN mkdir /tmp/app.bombi/ 

COPY ./express/package*.json ./

RUN npm install .

COPY ./express .
COPY ./angular/dist/bombi ./static

EXPOSE 4545
CMD ["node", "./bin/www"]