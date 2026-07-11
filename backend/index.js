const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Chào mừng đến với Backend Website bán sách!');
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});