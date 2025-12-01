// ============== Basic Setup ==============
const express = require('express');
const app = express();
const path = require('path');

// EJS + Static + Parsing
app.set('view engine', 'ejs');
app.use(express.static("ecommerce"));
app.use(express.urlencoded({ extended: true }));

// ============== Session Setup ==============
const session = require('express-session');
app.use(session({
    secret: '1231www@',
    resave: true,
    saveUninitialized: true
}));
app.use((req,res,next)=>{
    res.locals.aname = req.session.aname;
    res.locals.aemail = req.session.aemail;
    res.locals.uname=req.session.uname;
    res.locals.uemail=req.session.uemail;
    next();
});


// ============== Database Connection ==============
const mysql = require("mysql");
const con = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"",
    database:"amazon"
});
con.connect((err)=>{
    if(err) 
        console.error('Connection error')
    console.log("Connected to MySQL ✔");
});

// make MySQL available for routes
app.locals.con = con;




// static for uploaded images
app.use(express.static("ecommerce/uploads"));

// ============== Web Routes File ==============
const webroutes = require('./routes/webRoutes');
app.use('/', webroutes);




// ========= Server Start =========
app.listen(1000, ()=>{
    console.log("Server running on port 1000 ✔");
});
