FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "src/index.js"]
