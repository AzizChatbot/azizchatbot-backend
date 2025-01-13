FROM node:22-alpine
WORKDIR /app
COPY package.json /app
RUN corepack enable
RUN pnpm install
COPY . /app
RUN pnpm exec prisma generate
CMD ["pnpm","start"]