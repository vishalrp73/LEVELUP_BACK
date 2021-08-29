const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require('bcrypt');

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

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users WHERE role = "student"', function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

/* LOGIN AND SIGNUP ENDPOINTS */

app.post('/signup', (req, res) => {
    const hashPass = bcrypt.hashSync(req.body.password, 12);

    db.query('INSERT INTO users SET ?', { email: req.body.email, password: hashPass }, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('Data inserted into database')
            res.status(201).send('Successful sign up')
        }
    })
})

app.post('/login', function (req, res) {

    const plainPass = req.body.password

    db.query(`SELECT * FROM users WHERE email = ?`, [req.body.email], (err, result) => {
        console.log(result)
        if (result.length <= 0) {
            res.status(401).send('Login failed')
        } else {
            const passCheck = bcrypt.compareSync(plainPass, result[0].password);
            if (passCheck) {
                res.status(200).send(result)
            } else {
                res.status(401).send('Login unsuccessful')
            }
        }
    })
})



/* PROGRESS TRACKER AND STUDENT PROFILES ENDPOINTS */

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users WHERE role = "student"', function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

app.post('/getUser', (req, res) => {
    db.query('SELECT * FROM users WHERE users.user_id = ?', 
    [req.body.user_id], (err, result) => {
        res.send(result);
    })
});


app.get('/projects', (req, res) => {
    db.query('SELECT * FROM project', function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/prog_hist', (req, res) => {
    db.query('SELECT users.user_id, users.first_name, users.last_name, progress_history.project_id, progress_history.date_completed FROM users LEFT JOIN progress_history ON users.user_id = progress_history.user_id WHERE teacher_id = 1',
    function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});


/* STUDENT REQUESTS ENDPOINTS */

app.get('/requests', (req, res) => {
    db.query('SELECT help_request.user_id, users.first_name, users.profile_pic, help_request.date_created, help_request.done FROM help_request INNER JOIN users ON users.user_id=help_request.user_id WHERE help_request.done = 0 ORDER BY date_created ASC',
    function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/archive', (req, res) => {
    db.query('SELECT help_request.user_id, users.first_name, users.profile_pic, help_request.date_created, help_request.done FROM help_request INNER JOIN users ON users.user_id=help_request.user_id WHERE help_request.done = 1 ORDER BY date_created ASC',
    function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

app.post('/remove', function (req, res) {
    if (req.body != null) {
        
        let front = [];
        let back = [];

        /* Iterates through progress history array and converts each element into human readable date
        then compares value to front end converted value */

        db.query('SELECT * FROM help_request', function (err, result) {
            if (err) {
                console.log(err)
            } else {
                for (let i = 0; i < result.length; i++) {
                    let convert = new Date(result[i].date_created).toLocaleString().split(',');
                    convert = convert[0].split('/').reverse().join('-') + convert[1];
                    back.push(convert);
                }
                for (let x = 0; x < req.body.checkedValues.length; x++) {
                    let frontVert = new Date(req.body.checkedValues[x]).toLocaleString().split(',');
                    frontVert = frontVert[0].split('/').reverse().join('-') + frontVert[1];
                    front.push(frontVert);
                }

                back.forEach(backDate => {
                    front.forEach(frontDate => {
                        if (frontDate == backDate) {
                            db.query('UPDATE help_request SET done = 1 WHERE date_created = ' + JSON.stringify(frontDate),
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            })
                        }
                    })
                })
            }
        })
        res.status(201).send('Successful removal')
    } else {
        res.status(401).send('Unsuccessful removal')
    }
})

/* STUDENT SUBMISSIONS ENDPOINTS */

app.get('/subs', (req, res) => {
    db.query('SELECT progress_history.date_submitted, progress_history.date_completed, progress_history.submission, users.first_name, users.profile_pic FROM progress_history INNER JOIN users ON progress_history.user_id = users.user_id',
    function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

app.post('/sub_complete', function (req, res) {
    if (req.body != null) {
        let subFront = [];
        let subBack = [];

        /* Iterates through progress history array and converts each element into
        human readable date then compares cakue to front end converted value. This
        is because the date_submitted is the only unique identifier in the MYSQL table. */

        db.query('SELECT * FROM progress_history', function (err, result) {
            if (err) {
                console.log(err);
            } else {
                for (let i = 0; i < result.length; i++) {
                    let convert = new Date(result[i].date_submitted).toLocaleString().split(',');
                    convert = convert[0].split('/').reverse().join('-') + convert[1];
                    subBack.push(convert);
                }
                for (let x = 0; x < req.body.checkedValues.length; x++) {
                    let frontVert = new Date(req.body.checkedValues[x]).toLocaleString().split(',');
                    frontVert = frontVert[0].split('/').reverse().join('-');
                    subFront.push(frontVert);
                }

                subBack.forEach(backDate => {
                    subFront.forEach(frontDate => {
                        if (frontDate == backDate) {
                            db.query('UPDATE progress_history SET date_completed = CURRENT_TIMESTAMP WHERE date_submitted = ',
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            })
                        }
                    })
                })
            }
        })
        res.status(201).send('Successful');
    } else {
        res.status(401).send('Unsuccessful')
    }
});

app.listen(4000);