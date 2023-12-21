# Use the official Node.js image as the base
FROM node:20

# Set non-interactive mode during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        texlive \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-latex-base \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# Reset the non-interactive mode
ENV DEBIAN_FRONTEND=dialog

# Other instructions for your Dockerfile...


# Set the working directory inside the container
WORKDIR C:\Users\bilal\OneDrive\Desktop\expressDocker

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Expose the port on which your application will run
EXPOSE 8080

# Specify the command to run your application
CMD ["node", "index.js"]
