// ============== Basic Setup ==============
const express = require('express');
const app = express();
require("dotenv").config();
const path = require('path');

// EJS + Static + Parsing
app.set('view engine', 'ejs');
app.use(express.static("ecommerce"));
app.use(express.urlencoded({ extended: true }));

// ============== Session Setup ==============
const session = require('express-session');
app.use(session({
    secret: '1231www@',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req,res,next)=>{
    res.locals.aname = req.session.aname;
    res.locals.aemail = req.session.aemail;
    res.locals.uname = req.session.uname;
    res.locals.uemail = req.session.uemail;
    next();
});

// ============== Database Connection ==============
const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err)=>{
    if(err) {
        console.error("DB Error:", err);
    } else {
        console.log("Connected to MySQL ✔");
    }
});

// ✅ IMPORTANT FIX (DO NOT CHANGE NAME)
app.locals.con = db;


// static for uploaded images
app.use(express.static("ecommerce/uploads"));

// ============== Web Routes File ==============
const webroutes = require('./routes/webRoutes');
app.use('/', webroutes);

// ========= Server Start =========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));