const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());
const port = 3000;
app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
});