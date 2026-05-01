FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm@10
COPY . .
RUN pnpm install --frozen-lockfile=false
RUN pnpm build
EXPOSE 8080
CMD ["node", "dist/index.js"]
