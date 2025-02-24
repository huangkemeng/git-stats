// api/swagger-config.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GitLab 提交统计 API',
            version: '1.0.0',
        },
        servers: [
            {
                url: process.env.VERCEL_URL
                    ? `http://${process.env.VERCEL_URL}`
                    : 'http://localhost:3000',
                description: process.env.VERCEL ? '生产环境' : '本地开发'
            }
        ]
    },
    apis: ['./api/*.js'] // 扫描所有 API 文件
};

module.exports = swaggerJSDoc(options);