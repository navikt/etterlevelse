FROM nginx
COPY build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
RUN chmod -R 777 /var/cache/nginx