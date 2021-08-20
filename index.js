const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "database-1.cznv306sxvoj.ap-southeast-2.rds.amazonaws.com",
    user: "admin",
    password: "admin123",
    database: "missionx"
});

db.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connection successful !");
    }
});


app.get('/projects', (req, res) => {
    db.query('SELECT * FROM project', function (err, result) {
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
});

app.listen(4000);