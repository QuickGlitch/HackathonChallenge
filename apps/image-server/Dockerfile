FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY apps/image-server/public/ /var/www/html/

# Create images directory and set permissions
RUN mkdir -p /var/www/html/images && \
    chown -R www-data:www-data /var/www/html/images && \
    chmod -R 755 /var/www/html/images

# Expose port 80
EXPOSE 80
