FROM php:8.2-apache

# Instalar suporte ao PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copiar todo o conteúdo do repositório para o container
COPY . /var/www/html/

# Ativar mod_rewrite para URLs amigáveis
RUN a2enmod rewrite

# Definir diretório de trabalho
WORKDIR /var/www/html

# Expor a porta padrão do Apache
EXPOSE 80

# Comando para iniciar o Apache
CMD ["apache2-foreground"]
