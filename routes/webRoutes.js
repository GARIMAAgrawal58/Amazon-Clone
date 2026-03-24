const express = require('express');
const router = express.Router();
const path = require('path');

// ✅ FIX (ADD THIS BLOCK)
router.use((req, res, next) => {
    req.con = req.app.locals.con;
    next();
});

// ============== Multer ==============
const multer=require('multer');
const st = multer.diskStorage({
    destination: (req,file,cb)=> cb(null,'ecommerce/uploads/'),
    filename: (req,file,cb)=> cb(null,file.originalname)
});
const upload = multer({ storage: st });

// ========= Argon2 =========
const argon2=require('argon2')

// ============== Pages ==============
router.get('/', (req, res) => {
    let q = "SELECT * FROM product";

    req.con.query(q, (err, result) => {
        if (err) return res.send("Database error");

        res.render("index", { 
            data: result,
            uemail: req.session.uemail || null,
            uname: req.session.uname || null
        });
    });
});

router.get('/index',(req,res)=>res.redirect('/'));
router.get('/contact',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/contact.html')));
router.get('/register',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/register.html')));
router.get('/login',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/login.html')));
router.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/adminlogin.html')));
router.get('/admindash',(req,res)=>res.render('admindashboard'));

// ===================== EXAMPLE FIX APPLIED =====================

// add to cart
router.get('/addcart',(req,res)=>{
    if(req.session.uemail==null) return res.redirect('/login');

    var E=req.session.uemail;
    var ID=req.query.id;

    var q="SELECT * FROM cart WHERE email=? and id=?"

    req.con.query(q,[E,ID],(err,result)=>{
        if(result.length>0){
            res.redirect('/?error=exists')
        } else {
            var qt="INSERT INTO cart(email,id) values(?,?)"
            req.con.query(qt,[E,ID],()=>{
                res.redirect('/')
            })
        }
    })
});

// login example
router.post("/loginprocess",(req,res)=>{
    const {logemail,logpwd} = req.body;

    let q="SELECT * FROM register WHERE email=?";
    req.con.query(q,[logemail],async (err,result)=>{
        if(result.length>0){
            const hashedPassword=result[0].password;

            const isValid= await argon2.verify(hashedPassword,logpwd);
            if(isValid){
                req.session.uemail=result[0].email;
                req.session.uname=result[0].name;
                return res.redirect('/index')
            }
        }
        res.redirect('/login?error')
    });
});

module.exports = router;