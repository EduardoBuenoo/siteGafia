FROM php:8.2-apache

# Instalar dependências do sistema para PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copiar todos os arquivos do repositório
COPY . /var/www/html/

# Ativar mod_rewrite
RUN a2enmod rewrite

WORKDIR /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
