// api/swagger-ui.js
const { serve, setup } = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');

module.exports = (req, res) => {
    // 手动实现 swagger-ui-express 的逻辑
    if (req.method === 'GET') {
        if (req.url.endsWith('.css') || req.url.endsWith('.js')) {
            // 从 CDN 加载资源
            var resource = '';
            if (req.url.endsWith('swagger-ui.css')) {
                resource = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui.css';
            }
            else if (req.url.endsWith('swagger-ui-bundle.js')) {
                resource = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js'
            }
            else if (req.url.endsWith('swagger-ui-standalone-preset.js')) {
                resource = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js'
            }
            if (resource) {
                return fetch(resource)
                    .then(r => r.text())
                    .then(data => {
                        res.setHeader('Content-Type', req.url.endsWith('.css') ? 'text/css' : 'application/javascript');
                        res.end(data);
                    });
            }
        }
        else {

        }

        // 返回 HTML 页面
        const html = `<!DOCTYPE html>
          <html>
            <head>
              <link rel="stylesheet" href="/api/swagger-ui/swagger-ui.css">
              <title>API Docs</title>
            </head>
            <body>
              <div id="swagger-ui"></div>
            </body>
                <script src="/api/swagger-ui/swagger-ui-bundle.js"></script>
              <script src="/api/swagger-ui/swagger-ui-standalone-preset.js"></script>
              <script>
                   const ui = SwaggerUIBundle({
            url: "/api/swagger.json",  // 指向你的OpenAPI规范文件路径
            dom_id: '#swagger-ui', // 容器元素的ID
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset  // 启用独立布局
            ],
            layout: "StandaloneLayout",     // 布局模式
            deepLinking: true               // 启用URL深度链接
        });
              </script>
          </html>
        `;
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        res.status(404).end();
    }
};