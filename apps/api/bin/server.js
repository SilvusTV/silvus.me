import http from 'node:http'

const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 3333)

const server = http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', app: 'silvus-api' }))
})

server.listen(port, host, () => {
  console.log(`[api] listening on http://${host}:${port}`)
})
