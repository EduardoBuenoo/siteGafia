# Usar imagem base com PHP + Apache
FROM php:8.2-apache

# Instalar a extensão do PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copiar o código do projeto para o container
COPY public/ /var/www/html/

# Permitir reescrita de URLs (caso use .htaccess futuramente)
RUN a2enmod rewrite

# Expor a porta padrão do Apache
EXPOSE 80

# Comando de inicialização
CMD ["apache2-foreground"]
