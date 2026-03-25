import http from 'http'
import path from 'path'
import chalk from 'chalk'
import fs from 'fs/promises'

const port = 3000

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return mime[ext] ?? 'application/octet-stream'
}

const server = http.createServer(async (req, res) => { 
  const uri = req.url.slice(1)
  let file = ''
  if (uri) {
    file = path.join('public', uri)
  } else {
    file = 'index.html'
  }

  try {
    const data = await fs.readFile(file)

    res.statusCode = 200 // OK
    res.setHeader('Content-Type', contentType(file))
    res.write(data)
  } catch {
    res.statusCode = 404 // Not found
    try {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.write(await fs.readFile(path.join('public', '404.html')))
    } catch {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.write('404 - Not found')
    }
  } finally {
    res.end()
  }
})

server.listen(port, () => {
  console.log(chalk.green(`Server listening at http://localhost:${port}`))
})