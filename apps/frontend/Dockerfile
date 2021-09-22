FROM nginxinc/nginx-unprivileged

ENV NGINX_ENVSUBST_OUTPUT_DIR /tmp

COPY nginx-conf-overwrite.conf /etc/nginx/conf.d/default.conf

COPY build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
