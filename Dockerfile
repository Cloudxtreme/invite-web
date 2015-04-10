FROM lavab/bati-nginx

ADD build/ /var/www

CMD 'nohup bati && nginx'