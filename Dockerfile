#FROM node:16 as build
#WORKDIR /opt
#COPY . /opt
#ARG VERSION=latest
#RUN touch /opt/version
#RUN echo "$VERSION"  > /opt/version
#RUN npm i -g env-cmd && \
#    npm install react-scripts@3.3.1 -g
#RUN yarn install && \
#    yarn build

FROM nginx:stable

COPY build /usr/share/nginx/html
COPY version /opt/version
COPY init.sh /

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/proxy.conf /etc/nginx
RUN chmod 777 -Rf /usr/share/nginx/html/media/

CMD ["/bin/sh",  "-c", "/init.sh"]

EXPOSE 80
