/* eslint-disable @typescript-eslint/no-var-requires */
const { createProxyMiddleware } = require('http-proxy-middleware')

// Used in local development server only
module.exports = function (app) {
  const target = 'http://localhost:8080'
  const headers = {
    'Nav-Consumer-Id': 'etterlevelse-local',
  }

  app.use(
    createProxyMiddleware({
      pathRewrite: {
        '^/api': '',
      },
      pathFilter: '/api',
      target,
      headers,
    })
  )

  app.use(createProxyMiddleware({ target, pathFilter: '/login', headers }))
  app.use(createProxyMiddleware({ target, pathFilter: '/oauth2', headers }))
  app.use(createProxyMiddleware({ target, pathFilter: '/logout', headers }))
}
