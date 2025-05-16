# Instructions on how this server runs 

# 1. Base Image (Starting point for the docker image)
FROM node:22

# 2. Working Directory (Where the app will be run)
WORKDIR /app

# 3. Copy package.json and package-lock.json (if exists) to the working directory
COPY package*.json ./

# 4. Install dependencies
RUN npm install --legacy-peer-deps

# 5. Copy the rest of the app to the working directory
COPY . .

# 6. Expose the port the app runs on
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# 7. Run the app
CMD ["sh", "-c", "npx expo login -u \"${EXPO_PUBLIC_USERNAME}\" -p \"${EXPO_PUBLIC_PASSWORD}\" && npx expo start"]
