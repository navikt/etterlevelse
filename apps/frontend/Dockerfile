FROM nginxinc/nginx-unprivileged

ENV NGINX_ENVSUBST_OUTPUT_DIR /tmp/nginx/conf.d
COPY nginx-conf-overwrite.conf /etc/nginx/conf.d/default.conf

COPY build /usr/share/nginx/html
COPY nginx.conf.template /tmp/nginx/templates/default.conf.template
