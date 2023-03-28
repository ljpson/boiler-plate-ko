const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://15.164.214.250:4002',
            changeOrigin: true,
        })
    );
};