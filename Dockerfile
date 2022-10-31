#FROM node:bullseye-slim
#RUN apt update
#RUN apt install python3 wget libegl1 libopengl0 xz-utils python3-pyqt5 -y
#RUN wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin
#ENV PATH="${PATH}:/opt/calibre/"

#FROM node:16-alpine
FROM frolvlad/alpine-glibc
RUN apk add python3 py-requests py3-qt5 npm

RUN mkdir /opt/calibre/
RUN wget "https://download.calibre-ebook.com/4.23.0/calibre-4.23.0-x86_64.txz" -P /tmp/
RUN tar -xf /tmp/calibre-4.23.0-x86_64.txz -C /opt/calibre/
RUN /opt/calibre/calibre_postinstall


#RUN wget "https://archive.org/download/kindlegen_linux_2.6_i386_v2_9.tar/kindlegen_linux_2.6_i386_v2_9.tar.gz" -P /tmp/ 
#RUN tar -xzf /tmp/kindlegen_linux_2.6_i386_v2_9.tar.gz -C /bin/ kindlegen

WORKDIR /usr/src/app/

RUN mkdir /tmp/app.bombi/ 


COPY ./express/package*.json ./

RUN npm install .

COPY ./express .
COPY ./angular/dist/bombi ./static

EXPOSE 4545
CMD ["node", "./bin/www"]