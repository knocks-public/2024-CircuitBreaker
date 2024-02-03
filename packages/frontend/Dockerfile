FROM node:20

RUN npm install -g expo-cli

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
