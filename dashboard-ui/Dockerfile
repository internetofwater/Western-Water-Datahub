FROM node:lts-alpine

WORKDIR /dashboard-ui/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]