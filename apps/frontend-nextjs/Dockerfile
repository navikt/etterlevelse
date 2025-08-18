FROM nginxinc/nginx-unprivileged


ENV NGINX_ENVSUBST_OUTPUT_DIR /tmp

COPY nginx-conf-overwrite.conf /etc/nginx/conf.d/default.conf

COPY build /usr/share/nginx/html

COPY build/static /usr/share/nginx/html/_next/static
COPY public /usr/share/nginx/html/public

COPY nginx.conf.template /etc/nginx/templates/default.conf.template