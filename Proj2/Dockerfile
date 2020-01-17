FROM php:7.4-apache
RUN apt-get update
RUN apt-get install -y libcurl4-openssl-dev pkg-config libssl-dev
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

RUN a2enmod rewrite && service apache2 restart

COPY src /var/www/src
COPY vendor /var/www/vendor
COPY public /var/www/html
