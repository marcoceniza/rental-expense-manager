FROM php:8.4-fpm

# Install system deps + PHP extensions Laravel needs
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libzip-dev \
    zlib1g-dev \
    libssl-dev \
    libpq-dev \
    libxml2-dev \
    git \
    curl \
    unzip \
  && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache xml

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working dir
WORKDIR /var/www/html

# Install node and pnpm for Vite
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# dompdf needs ext-dom (part of xml, already installed above)

USER www-data

CMD ["php-fpm"]
