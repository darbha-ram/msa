FROM node:argon

# default 
ENV MONGO_URL mongodb://localhost:27017/test

# Create app directory
RUN mkdir -p /usr/src/msgstoreapp
WORKDIR /usr/src/msgstoreapp

# Install app dependencies
COPY package.json /usr/src/msgstoreapp/
RUN npm install

# Bundle app source
COPY . /usr/src/msgstoreapp

EXPOSE 8081

CMD [ "npm", "start" ]

