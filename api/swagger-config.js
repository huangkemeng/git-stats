// api/swagger-config.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        "openapi": "3.0.0",
        "info": { "title": "GitLab 提交统计 API", "version": "1.0.0" },
        servers: [
            {
                url: process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : 'http://localhost:3000',
                description: process.env.VERCEL ? '生产环境' : '本地开发'
            }
        ],
        "paths": {
            "/api/commits":
            {
                "get":
                {
                    "summary": "统计git提交", "tags": ["统计git提交"],
                    "parameters":
                        [{
                            "in": "query",
                            "name": "gitlabHost",
                            "required": true,
                            "schema": { "type": "string" },
                            "description": "gitlab服务器地址"
                        },
                        {
                            "in": "query",
                            "name": "privateToken",
                            "required": true,
                            "schema": { "type": "string" },
                            "description": "gitlab access token"
                        },
                        {
                            "in": "query",
                            "name": "userIds",
                            "required": true,
                            "schema": {
                                "type": "array",
                                "items": { "type": "string" }
                            },
                            "description": "用户id"
                        },
                        {
                            "in": "query",
                            "name": "startDate",
                            "required": true, "schema": { "type": "string", "format": "date" }, "description": "开始时间（格式：YYYY-MM-DD）"
                        },
                        {
                            "in": "query",
                            "name": "endDate",
                            "required": true,
                            "schema": { "type": "string", "format": "date" },
                            "description": "结束时间（格式：YYYY-MM-DD）"
                        }],
                    "responses":
                    {
                        "200": {
                            "description": "成功返回提交统计",
                            "content": {
                                "application/json":
                                {
                                    "example": { "code": 200, "data": [] }
                                }
                            }
                        }
                    }
                }
            }
        }, "components": {}, "tags": [{ "name": "统计git提交", "description": "统计某个时间段内某些用户提交的天数和commit个数" }]
    },
    apis: [],
};

module.exports = swaggerJSDoc(options);