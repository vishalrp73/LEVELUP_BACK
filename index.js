const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors);

const db = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: "",
});


app.listen(4000);