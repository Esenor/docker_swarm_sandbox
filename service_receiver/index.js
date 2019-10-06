const http = require('http')
const port = 8428

const server = http.createServer((req, res) => {
  console.log('request received')
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    status: 'live',
    scope: (process.env.EFC_APP_ID) ? process.env.EFC_APP_ID : 'No EFC_APP_ID provided'
  }))
})

server.listen(port, () => {
  console.log('Server running')
})
