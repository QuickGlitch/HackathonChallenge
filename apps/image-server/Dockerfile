FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY apps/image-server/public/ /var/www/html/

# Create images directory and set permissions
RUN mkdir -p /var/www/html/images && \
    chown -R www-data:www-data /var/www/html/images && \
    chmod -R 755 /var/www/html/images

# Change Apache to listen on port 8090
RUN sed -i 's/Listen 80/Listen 8090/' /etc/apache2/ports.conf && \
    sed -i 's/:80/:8090/' /etc/apache2/sites-available/000-default.conf

# Expose port 8090
EXPOSE 8090
