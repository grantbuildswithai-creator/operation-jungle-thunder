import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFile } from 'node:child_process';
const root = path.dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.md':'text/plain'};
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
    const body = await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
});
const openBrowser=()=>{if(process.argv.includes('--open')&&process.platform==='win32')execFile('explorer.exe',[`http://localhost:${port}`]);};
server.on('error',error=>{if(error.code==='EADDRINUSE'){console.log(`Port ${port} is already in use. If the game is already running, open http://localhost:${port}. Otherwise choose another PORT.`);openBrowser();}else console.error(error.message);});
server.listen(port,'127.0.0.1',()=>{console.log(`Operation Jungle Thunder: http://localhost:${port}`);openBrowser();});
