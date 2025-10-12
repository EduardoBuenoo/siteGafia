FROM php:8.2-apache

# Instala suporte a PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copiar todos os arquivos do repositório
COPY . /var/www/html/

# Ativar mod_rewrite
RUN a2enmod rewrite

WORKDIR /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
