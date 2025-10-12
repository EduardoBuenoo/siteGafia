FROM php:8.2-apache

# Instala suporte a PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copiar todo o conteúdo do repositório
COPY . /var/www/html/

# Ativar mod_rewrite do Apache (URLs amigáveis)
RUN a2enmod rewrite

# Definir diretório de trabalho
WORKDIR /var/www/html

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Apache
CMD ["apache2-foreground"]
