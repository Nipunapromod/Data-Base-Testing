const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});

app.get('/php/:file', (req, res) => {
  const file = req.params.file;

  // Security tip: allow only letters, numbers, underscores, and hyphens
  if (!/^[\w-]+$/.test(file)) {
    return res.status(400).send('Invalid file name.');
  }

  const filePath = path.join(__dirname, `${file}.php`);
  const php = spawn('php', [filePath]);

  let output = '';
  php.stdout.on('data', (data) => {
    output += data;
  });

  php.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  php.on('close', (code) => {
    if (code !== 0) {
      res.status(500).send('PHP script error.');
    } else {
      res.send(output);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
