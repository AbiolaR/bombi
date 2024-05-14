FROM frolvlad/alpine-glibc:alpine-3.17_glibc-2.34
RUN apk add python3 py-requests py3-qt5 npm chromium chromium-chromedriver

WORKDIR /usr/src/app/

RUN mkdir /opt/calibre/
RUN wget "https://cloud.tinym.de/s/zHER2QyAT3AzjET/download" -O /tmp/calibre.txz
RUN tar -xf /tmp/calibre.txz -C /opt/calibre/
RUN /opt/calibre/calibre_postinstall

RUN mkdir /usr/src/app/resources
RUN wget "https://cloud.tinym.de/s/wrZym3n9E6ZBtQ8/download" -O /usr/src/app/resources/python.zip 
RUN unzip /usr/src/app/resources/python.zip -d /usr/src/app/resources 
RUN rm /usr/src/app/resources/python.zip


RUN mkdir /tmp/app.bombi/ 

COPY ./express/built .
COPY ./express/locales/ ./locales
COPY ./express/resources/sql/ ../resources/sql
COPY ./express/package*.json ./

RUN npm install .

COPY ./angular/dist/bombi ./static

EXPOSE 4545
CMD ["node", "./bin/www"]