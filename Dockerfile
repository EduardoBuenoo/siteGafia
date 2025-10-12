# Usa a imagem PHP com Apache
FROM php:8.2-apache

# Instala suporte ao PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copia TODO o conteúdo do projeto (raiz + api + css + js + etc)
COPY . /var/www/html/

# Ativa reescrita de URLs (opcional, mas bom pra API e roteamento)
RUN a2enmod rewrite

# Define o diretório de trabalho como a raiz do servidor web
WORKDIR /var/www/html

# Expõe a porta padrão do Apache
EXPOSE 80

# Comando padrão para iniciar o servidor
CMD ["apache2-foreground"]
