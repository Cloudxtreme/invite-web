FROM kyma/docker-nginx
ADD build/ /var/www
CMD 'nginx'