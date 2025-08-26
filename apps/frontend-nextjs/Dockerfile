FROM nginxinc/nginx-unprivileged


ENV NGINX_ENVSUBST_OUTPUT_DIR /tmp
RUN mkdir /usr/share/nginx/buffer

COPY build /usr/share/nginx/buffer
COPY deploy.sh /usr/share/nginx/buffer
RUN chmod +x /usr/share/nginx/buffer/deploy.sh
RUN cd /usr/share/nginx/buffer && ./deploy.sh
COPY nginx-conf-overwrite.conf /etc/nginx/conf.d/default.conf

COPY nginx.conf.template /etc/nginx/templates/default.conf.template