FROM php:8.3-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    libxml2-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pcntl \
    sockets

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy source
COPY . .

# Install dependencies
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

# Laravel permissions
RUN mkdir -p storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD sh -c "\
php artisan migrate --force && \
php artisan db:seed --force && \
php artisan config:cache && \
php artisan route:cache && \
php artisan view:cache && \
php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"