const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const port = 3000;
const outputFile = './swagger-auto.json';
const routes = ['./index.ts'];

const doc = {
  info: {
    title: 'Video API Service',
    description: '',
  },
  host: `127.0.0.1:${port}`,
};

swaggerAutogen(outputFile, routes, doc);
