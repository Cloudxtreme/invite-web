FROM lavab/bati-nginx

ADD build/ /var/www
ADD start.sh /usr/bin

CMD /usr/bin/start.sh