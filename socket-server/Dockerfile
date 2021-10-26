FROM node:14.17.1 as deps

# Add package file
COPY package*.json ./

# Install deps
RUN npm i

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build dist
RUN npm run build

# Start production image build
FROM node:12-alpine as prod

# Copy node modules and build directory
COPY --from=deps ./node_modules ./node_modules
COPY --from=deps /dist /dist

# Copy static files
# COPY src/public dist/src/public

# Expose port 2000
EXPOSE 2000
CMD ["node", "dist/server.js"]