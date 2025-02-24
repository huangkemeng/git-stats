// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger 配置项
const options = {
    definition: {
        openapi: "3.0.0", // 使用的 OpenAPI 版本
        info: {
            title: "Git统计API", // 文档标题
            version: "1.0.0", // 文档版本
            description: "统计某个时间段内某些用户提交的天数和commit个数等", // 描述
        },
        servers: [
            {
                url: "http://localhost:3003", // 服务器地址
                description: "本地开发环境",
            },
        ],
        components: {
            securitySchemes: {
                // 可选：配置鉴权（如 JWT）
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    // 指定包含 Swagger 注释的文件路径（通常是路由文件）
    apis: ["server.js"],
};

const swaggerSpec = swaggerJSDoc(options);

// 导出 Swagger 中间件
module.exports = (app) => {
    // 提供 JSON 格式的 Swagger 文档
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    // 提供 Swagger UI 界面
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};