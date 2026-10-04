// Dependency-free development server. Run: node server.js
// This serves static files locally; gameplay runs entirely in the browser.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolve files relative to this script, regardless of where the terminal was opened.
const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8000);
// JavaScript modules need a recognized content type to load in the browser.
const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
};
// Each request maps to one file; the site root opens index.html.
// The listen call binds only to this computer, not to the public internet.
http.createServer(async (req, res) => {
    try {
        const pathname = decodeURIComponent(
            new URL(req.url, 'http://localhost').pathname,
        );
        const file = path.resolve(
            root,
            '.' + (pathname === '/' ? '/index.html' : pathname),
        );
        // Block paths outside the game folder and hidden files such as .git/config.
        const relative = path.relative(root, file);
        if (
            relative.startsWith('..') ||
            path.isAbsolute(relative) ||
            relative.split(path.sep).some((part) => {
                return part.startsWith('.');
            })
        ) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        const data = await readFile(file);
        // Disable caching so refreshing the page picks up edits made in VS Code.
        res.writeHead(200, {
            'Content-Type':
                (types[path.extname(file)] || 'application/octet-stream') +
                '; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
        });
        res.end(data);
    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(port, '127.0.0.1', () => {
    return console.log(
        `Pond Patrol is ready at http://localhost:${port}\nPress Ctrl+C to stop.`,
    );
});
