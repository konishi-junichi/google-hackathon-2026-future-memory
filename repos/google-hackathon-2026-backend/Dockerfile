FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Litestream
# See: https://litestream.io/install/
RUN curl -L https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.tar.gz | tar -xz -C /usr/local/bin

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Configuration and scripts
COPY litestream.yml /etc/litestream.yml
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

# Environment variables (Defaults)
ENV DATABASE_PATH=/app/data/app.db
ENV PORT=8080

# Create data directory
RUN mkdir -p /app/data

EXPOSE 8080

# Use run.sh as the entrypoint
CMD ["/app/run.sh"]
