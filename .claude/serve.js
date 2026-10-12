// Local preview server; not part of the site.
// Used instead of `python -m http.server` because that one ignores Range requests, and a browser
// cannot seek in a video served without them (the seek bar would jump back to the start).
// GitHub Pages supports Range, so the published site does not need this.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const types = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mp4': 'video/mp4',
    '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf'
};

http.createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end();
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');

    fs.stat(file, (err, stat) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        const headers = {
            'Content-Type': types[path.extname(file)] || 'application/octet-stream',
            'Accept-Ranges': 'bytes',
            // always revalidate, so edits show up on a normal refresh
            'Cache-Control': 'no-cache'
        };
        const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
        if (!range) {
            res.writeHead(200, { ...headers, 'Content-Length': stat.size });
            return fs.createReadStream(file).pipe(res);
        }
        // "a-b", "a-" (to the end) or "-n" (last n bytes)
        const start = range[1] ? Number(range[1]) : stat.size - Number(range[2]);
        const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
        if (start > end || start < 0) {
            res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
            return res.end();
        }
        res.writeHead(206, {
            ...headers,
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Content-Length': end - start + 1
        });
        fs.createReadStream(file, { start, end }).pipe(res);
    });
}).listen(8765);
