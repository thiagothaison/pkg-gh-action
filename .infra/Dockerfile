# Use a base image for ARM architecture
FROM --platform=linux/arm/v7 arm32v7/node:18-bookworm

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the executable using pkg
RUN npm run dist

# Rename the generated binary file
RUN mv releases/etiquetei-application releases/etiquetei

# Create a volume to store the generated binary
# This ensures that the releases folder is accessible from both the container and the host
VOLUME ["/usr/src/app/releases"]
