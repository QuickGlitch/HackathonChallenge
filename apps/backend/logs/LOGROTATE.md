# Logrotate Setup for Backend

This backend service uses [logrotate](https://github.com/logrotate/logrotate) to manage log file rotation and compression.

## How It Works

1. The Dockerfile installs logrotate and copies the configuration
2. The entrypoint script (`entrypoint.sh`) starts a background process that runs logrotate every hour
3. Logs are stored in `/app/logs/access.log` inside the container
4. A Docker volume (`backend-logs`) persists logs across container restarts

## Viewing Logs

To view current logs:
```bash
docker exec store-hackathon-backend tail -f /app/logs/access.log
```

To view rotated logs:
```bash
docker exec store-hackathon-backend ls -lh /app/logs/
```

## Manual Rotation

To manually trigger log rotation:
```bash
docker exec store-hackathon-backend logrotate -f /etc/logrotate.d/backend-logs
```

## Customization

To modify the rotation settings, edit `logrotate.conf` and rebuild the container:

```bash
docker-compose build backend
docker-compose up -d backend
```

## Log Location on Host

The logs are stored in a Docker volume. To find the location on the host:
```bash
docker volume inspect store-hackathon_backend-logs
```

## Notes

- The `copytruncate` option is used because Pino keeps the log file open. This ensures logs continue to be written without restarting the application.
- Logrotate runs hourly to check if rotation is needed based on the configured rules.
- Compressed logs use `.gz` extension and are automatically cleaned up after 30 days.
