# Base image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching).
# bun.lock* matches the text lockfile (bun.lock) this project uses.
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Expose the application port (Render/hosts inject PORT at runtime)
EXPOSE 3000

# Start the application in production (NOT the watch-mode dev script)
CMD ["bun", "run", "start"]
