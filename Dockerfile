# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Copy the rest of the application code
COPY . .

# Install dependencies using pnpm
RUN pnpm install

# Copy the Prisma schema into the container
COPY prisma ./prisma

# Generate Prisma Client
RUN pnpm prisma generate

# Build the TypeScript code
RUN pnpm run build

# Expose the application port
EXPOSE 3000

# # Start the application
CMD ["node", "dist/server.js"]