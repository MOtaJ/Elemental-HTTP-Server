const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const PORT = process.env.PORT || 8080;

const fileNotFoundErrorHandler = (res) => {
  res.statusCode = 500;
};

const sendContent = (res, content) => {
  res.setHeader('Content-Type', 'text/plain');
  res.write(content);
  res.end();
};

const cssContent = (res, content) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(content);
}

const server = http.createServer( (req, res) => {
  let theUrl = req.url.slice(1);
  /*console.log('req.url', theUrl);
  console.log('req.method', req.method);
  console.log('req.headers', req.headers);
  console.log();*/

  if(req.method === 'POST' && req.url === '/elements'){
      let reqBody = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      reqBody += chunk;
    });

      req.on('end', () => {
        let bodyQS = reqBody.parse(res)
        let templateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${bodyQS.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${bodyQS.elementName}</h1>
  <h2>${bodyQS.elementSymbol}</h2>
  <h3>${bodyQS.elementAtomicNumber}</h3>
  <p>${bodyQS.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;

  fs.readdir('./public', (err, files) => {
        if (files.indexOf(`${bodyQS.elementName.toLowerCase()}.html`) < 0 ) {
          fs.writeFile(`./public/${bodyQS.elementName.toLowerCase()}.html`, `${newHTMLFile}`, (err) => {
            if (err) {
              fileNotFoundErrorHandler(res);
            }
            fs.readFile('./public/index.html', { encoding: 'utf8' },  (err, data) => {
              if (err) {
                fileNotFoundErrorHandler(res);
              } else {
                let updatedIndex = data.replace('</ol>',
  `  <li>
      <a href="${bodyQS.elementName.toLowerCase()}.html">${bodyQS.elementName}</a>
    </li>
  </ol>`);
                fs.writeFile('./public/index.html', updatedIndex, (err) => {
                  if (err) {
                    fileNotFoundErrorHandler(res);
                  }
                });
              }
            });
            res.writeHead(200, 'OK', {
              'Content-Type': 'application/json'
            });
            res.write('{ "success" : true }');
            res.end();
            return;
          });
        } else {
          res.statusCode = 403;
          res.end('File already exists');
          return;
        }
      });

    });
  } else if ( theUrl === 'css/styles.css' && req.method === 'GET') {
    fs.readFile('./public/css/styles.css', (err, data) => {
      if (err) {
        fileNotFoundErrorHandler(res);
      } else {
        res.setHeader('Content-Type', 'text/css');
        sendContent(res, data);
      }
    });
  } else if ( req.url === '/' ) {
    fs.readFile('./public/index.html', (err, data) => {
      if (err) {
        fileNotFoundErrorHandler(res);
      } else {
        sendContent(res, data);
      }
    });
  } else {
    fs.readdir('./public', (err, files) => {
      if ( files.indexOf(theUrl) > 0 ) {
        fs.readFile(`./public/${theUrl}`, {encoding: 'utf8'}, (err, data) => {
          if (err) {
            fileNotFoundErrorHandler(res);
          }
          res.setHeader('Content-Type', 'text/html');
          sendContent(res, data);
        });
      } else {
        fs.readFile('./public/404.html', {encoding: 'utf8'}, (err, data) => {
          if (err) {
            fileNotFoundErrorHandler(res);
          }
          res.statusCode = 404;
          sendContent(res, data);
        });
      }
    });
  }
});


server.listen(PORT, () => {
  console.log('server is listening on port', PORT)
  })

