// api/swagger.json.js
const swaggerSpec = require('./swagger-config');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(swaggerSpec));
};