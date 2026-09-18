# ==========================================
# Stage 1: Build the App
# ==========================================
FROM node:18-alpine AS builder
WORKDIR /app

# Install Python and build tools required for node-pty (C++ compilation)
RUN apk add --no-cache python3 make g++

# Copy the entire project into the builder
COPY frontend ./frontend
COPY backend ./backend

# 1. Install and Build Frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 2. Install Backend Dependencies
WORKDIR /app/backend
RUN npm install

# ==========================================
# Stage 2: Production Image
# ==========================================
FROM node:18-alpine AS production
WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# FIX: Install the Docker CLI so node-pty can successfully run "docker exec"
RUN apk add --no-cache docker-cli

# Copy the backend files (with node_modules now successfully compiled)
COPY --from=builder /app/backend ./backend

# Copy the compiled frontend build
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose the port your Express app runs on
EXPOSE 3000

# Set the working directory
WORKDIR /app/backend

# Start the unified server: Seed the database first, then start the app
CMD ["sh", "-c", "node src/utils/seedPlan.js && npm start"]