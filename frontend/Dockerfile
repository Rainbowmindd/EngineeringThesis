# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package.json ./

# Remove package-lock.json if present and reinstall to fix optional deps issue
RUN rm -f package-lock.json && npm install

# Copy the rest of the application source code
COPY . .

# Build the application (Vite produces output in 'dist' folder by default)
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration to support React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]