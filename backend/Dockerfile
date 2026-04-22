
# Base image
FROM oven/bun:1.0

# Set working directory
WORKDIR /app


# Install dependencies
COPY package.json bun.lockb ./
RUN bun install


# Copy application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "dev"]