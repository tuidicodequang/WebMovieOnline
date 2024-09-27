const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); 

// ... Các route khác

const app = express();
app.use(bodyParser.json());

// Kết nối đến cơ sở dữ liệu
require('./config/db');


app.get('/', (req, res) => {
    res.send('Hello, World!');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
