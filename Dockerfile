FROM lavab/bati-nginx

ADD build/ /var/www
ADD start.sh /

CMD /start.sh