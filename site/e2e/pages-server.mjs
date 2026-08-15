import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"

// Serves a directory the way GitHub Pages does.
const root = process.argv[2]
const port = Number(process.argv[3] ?? 4174)

const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".png": "image/png", ".woff2": "font/woff2", ".map": "application/json",
}

const readable = async (path) => {
  try {
    const info = await stat(path)
    return info.isFile() ? path : null
  } catch {
    return null
  }
}

const resolve = async (pathname) => {
  const base = join(root, normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, ""))
  return (
    (await readable(base)) ??
    (await readable(`${base}.html`)) ??
    (await readable(join(base, "index.html")))
  )
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, "http://localhost")
  const found = await resolve(pathname)
  const path = found ?? join(root, "404.html")
  const body = await readFile(path)

  response.writeHead(found ? 200 : 404, {
    "content-type": TYPES[extname(path)] ?? "application/octet-stream",
  })
  response.end(body)
}).listen(port, () => console.log(`pages-like server on ${port} serving ${root}`))
