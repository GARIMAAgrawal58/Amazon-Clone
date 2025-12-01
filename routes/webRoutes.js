const express = require('express');
const router = express.Router();
const path = require('path');


// ============== Multer (Used Later for Products) ==============
const multer=require('multer');

const st = multer.diskStorage({
    destination: (req,file,cb)=> cb(null,'ecommerce/uploads/'),
    filename: (req,file,cb)=> cb(null,file.originalname)
});
const upload = multer({ storage: st });

// ========= Argon2 hash password setup ========
const argon2=require('argon2')



// ============== Pages ==============
router.get('/', (req, res) => {
    let q = "SELECT * FROM product";   // your products table

    req.app.locals.con.query(q, (err, result) => {
        if (err) {
            console.log("DB fetch error");
            return res.send("Database error");
        }

        res.render("index",  { 
            data: result,
            uemail: req.session.uemail || null,
            uname: req.session.uname || null
        });   // <-- send products array to EJS
    });
});

router.get('/index',(req,res)=>res.redirect('/'));
router.get('/contact',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/contact.html')));
router.get('/register',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/register.html')));
router.get('/login',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/login.html')));
router.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'../ecommerce/adminlogin.html')));
router.get('/admindash',(req,res)=>res.render('admindashboard'));

// ===========add to cart=======
router.get('/addcart',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    else{
    var E=req.session.uemail;
    var N=req.session.uname;
    var ID=req.query.id;
    var Pn=req.query.name;
    var Ct=req.query.category;
    var P=req.query.price;
    var IM=req.query.img;

    var q="SELECT * FROM cart WHERE email=? and id=?"

    req.app.locals.con.query(q,[E,ID],(err,result)=>
    {
        if(err)
            console.error('database error')
        else
        {
            var L=result.length;
            if(L>0)
            {
                res.redirect('/?error=product_already_added_to_cart')
            }
            else
            {
                var qt="INSERT INTO cart(name,email,id,prodname,category,price,pimage) values(?,?,?,?,?,?,?)"
                req.app.locals.con.query(qt,[N,E,ID,Pn,Ct,P,IM],(err,result)=>
                {
                    if(err)
                        res.send('insertion error')
                    else
                        // res.send('added success')
                    res.redirect('/')
                })
            }
        }
    })
}
    
})

//==========view cart=====
router.get('/vcarts',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    else{
        var E=req.session.uemail;
    var q="select * from cart where email=?"
    req.app.locals.con.query(q,[E],(err,result)=>
    {
        if(err)
            console.error('database error')
         res.render('vcart',{data:result})
    })
}
})

//==========delete cart ============
router.get('/delcart',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    else
    {
        var E=req.session.uemail;
        var ID=req.query.id;
        var q="delete from cart where id=? and email=?"
        req.app.locals.con.query(q,[ID,E],(err,result)=>
        {
            if(err)
                return res.redirect('/vcarts?error=deletion')
            else
            {
                res.redirect('/vcarts')
            }
        })
    }
})
//==========view orders=====
router.get('/vieworders',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    else{
        var E=req.session.uemail;
    var q="select * from orders where email=?"
    req.app.locals.con.query(q,[E],(err,result)=>
    {
        if(err)
            console.error('database error')
         res.render('vorder',{data:result})
    })
}
})
//==========delete orders ============
router.get('/delorder',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    else
    {
        var E=req.session.uemail;
        var N=req.query.name;
        var q="delete from orders where prodname=? and email=?"
        req.app.locals.con.query(q,[N,E],(err,result)=>
        {
            if(err)
                return res.redirect('/vieworders?error=deletion')
            else
            {
                res.redirect('/vieworders')
            }
        })
    }
})

// ============== Register User ==============
router.post('/registerprocess',async (req,res)=>{
    const {name,email,pwd} = req.body;

    //hash password
    const hashPwd=await argon2.hash(pwd)

    let q = "INSERT INTO register VALUES(?,?,?)";
    req.app.locals.con.query(q,[name,email,hashPwd],(err)=>{
        if(err) return res.redirect('/register?error=insertion');
        return res.redirect('/index?msg=registered');
    })
});


// ============== Contact Form ==============
router.post('/contactdetail',(req,res)=>{
    const {cname,cemail,sub,msg} = req.body;

    let q = "INSERT INTO contact VALUES(?,?,?,?)";
    req.app.locals.con.query(q,[cname,cemail,sub,msg],(err)=>{
        if(err) return res.redirect('/contact?error=insertion');
        return res.redirect('/?msg=contact_saved');
    });
});


// ============== User Login ==============
router.post("/loginprocess",(req,res)=>{
    const {logemail,logpwd} = req.body;

    let q="SELECT * FROM register WHERE email=?";
    req.app.locals.con.query(q,[logemail],async (err,result)=>{
        if(err)
           return res.redirect('/login?error=DB_Failed');
        else
        {
            var L=result.length;
            if(L>0)
            {
                const hashedPassword=result[0].password;

                // if old users with plain text password

                if(!hashedPassword.startsWith('$argon2'))
                {
                if(hashedPassword==logpwd)
                {
                    req.session.uemail=result[0].email;
                    req.session.uname=result[0].name;
                    return res.redirect('/index?old_user')
                }
                else
                {
                    return res.redirect('/login?error=password')
                }
            }
            const isValid= await argon2.verify(hashedPassword,logpwd);
            if(isValid)
            {req.session.uemail = result[0].email;  // <<< REQUIRED!
            req.session.uname = result[0].name;  
                return res.redirect('/index')
            }
            res.redirect('/login?error=password')
        }
            
            else{
                return res.redirect('/login?error=wrong_email')
            }
        }
    });
});

//admin login process
router.post('/adminprocess',(req,res)=>
{
    var E=req.body.email;
    var P=req.body.password;

    var q="SELECT * FROM ADMIN WHERE email=?"

    req.app.locals.con.query(q,[E],(err,result)=>
    {
        if(err)
            return res.redirect('/admin')
        else
        {
            var L=result.length;
            if(L>0)
            {
                if(result[0].password==P)
                {
                    req.session.aemail=result[0].email;
                    req.session.aname=result[0].name;
                    return res.redirect('/admindash')
                }
                else{
                    return res.redirect('/admin?error=password')

                }

            }
            else{
                return res.redirect('/admin?error=incorrect_email')
            }
        }
    })
})

//=======proceed now shipping page=====
router.get('/checkout',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    res.render('shipping')
})
//=========order============
router.post('/submitorders',(req,res)=>
{
    if(req.session.uemail==null)
        res.redirect('/login')
    else
    {
        var E=req.session.uemail;
        var N=req.session.uname;
        var Ad=req.body.address;
        var Ph=req.body.phone;
        var City=req.body.city;
        var Pin=req.body.pin;
        var Mo=req.body.mode;

        var qt="select prodname,price from cart where email=?";

        req.app.locals.con.query(qt,[E],function(err,result)
        {
            if(err) return res.send("Cart fetching error");

            var pn="";
            var p=0;

            for(i=0;i<result.length;i++)
            {
                pn=pn+result[i].prodname+" ";
                p=p+result[i].price;
            }

            // 🔥 Insert query is now inside the SELECT callback
            var q="insert into orders(name,email,address,phone,city,pin,mode,prodname,amount) values(?,?,?,?,?,?,?,?,?)";

            req.app.locals.con.query(q,[N,E,Ad,Ph,City,Pin,Mo,pn,p],(err,result)=>
            {
                if(err)
                    res.redirect('/checkout')
                else
                {req.app.locals.con.query("DELETE FROM cart WHERE email=?",[E]);
                    res.redirect('/')
                }
            })
        })
    }
})
//======users log out========
router.get('/loggedout', (req, res) => {
    req.session.destroy(err => {
        if(err) console.error(err);
        res.redirect('/'); // redirect to homepage after logout
    });
});


//view registered users
router.get('/vusers',function(req,res)
{
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    var q="SELECT * FROM register"

    req.app.locals.con.query(q,(err,result)=>
    {
        if(err)
        {
            console.error('database error')
            res.redirect('/vusers?error=database')
        }
        else
            return res.render('vusers',{data:result})

    })
}
})
//delete users
router.get('/deluser',function(req,res)
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    var E=req.query.em;
    var q="delete from register where email=?"

    req.app.locals.con.query(q,[E],(err,result)=>
    {
        if(err)
        {
            console.error('database error')
            res.redirect('/vusers?error=database')
        }
        else
            return res.redirect('/vusers')

    })
}
})
//add product form
router.get('/addproduct',(req,res)=>
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    res.render('addproducts')
    }
})
//add products
router.post("/productprocess", upload.single('productImage'), function (req, res) {
    if (req.session.aemail == null)
        res.redirect('/admin')
    else {
        var a = req.body.productId;
        var b = req.body.productName;
        var c = req.body.category;
        var d = req.body.quantity;
        var e = req.body.price;
        var f = req.body.description;
        var g = req.file.filename;
        var q = "insert into product(pid,pname,category,quantity,price,description,image) values(?,?,?,?,?,?,?)";
        req.app.locals.con.query(q, [a, b, c, d, e, f, g], function (err, result) {
            if (err)
                return res.redirect('/addproduct?error=insertion')
            else
                res.redirect("/vproducts")
        })
    }
    })

//view products
router.get('/vproducts',function(req,res)
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    var q="SELECT * FROM product"

    req.app.locals.con.query(q,(err,result)=>
    {
        if(err)
        {
            console.error('database error')
            res.redirect('/vproducts?error=database')
        }
        else
            return res.render('vproducts',{data:result})

    })
}
})
//delete products
router.get('/delproduct',function(req,res)
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    var ID=req.query.id;
    var q="delete from product where pid=?"

    req.app.locals.con.query(q,[ID],(err,result)=>
    {
        if(err)
        {
            console.error('database error')
            res.redirect('/vproducts?error=database')
        }
        else
            return res.redirect('/vproducts')

    })
}
})
//view enquiries

router.get('/venq',function(req,res)
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    var q="SELECT * FROM contact"

    req.app.locals.con.query(q,(err,result)=>
    {
        if(err)
        {
            console.error('database error')
            res.redirect('/venq?error=database')
        }
        else
            return res.render('venq',{data:result})

    })
}
})
//delete enquiries
router.get('/delenq',function(req,res)
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    var E=req.query.em;
    var q="delete from contact where email=?"

    req.app.locals.con.query(q,[E],(err,result)=>
    {
        if(err)
        {
            console.error('database error')
            res.redirect('/venq?error=database')
        }
        else
            return res.redirect('/venq')

    })
}
})
// ===view orders=====
router.get('/vorders',(req,res)=>
{
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
var N=req.session.name;
        var q="select * from orders"
        req.app.locals.con.query(q,(err,result)=>
        {
            if(err)
                res.send('error')
            else
                res.render('adminorders',{data:result})
        })
    }
})

//setting page
router.get('/settings',function(req,res)
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
        res.render('settings')
    }
})
router.post('/updatepassword', (req, res) => {
    if (!req.session.aemail) return res.redirect('/admin');

    const E = req.session.aemail;
    const Opwd = req.body.currentpassword; // match your form
    const Npwd = req.body.newpassword;     // match your form

    const q = "UPDATE admin SET password=? WHERE email=? AND password=?";

    req.app.locals.con.query(q, [Npwd, E, Opwd], (err, result) => {
        if (err) return res.redirect('/settings?error=updation');

        if (result.affectedRows > 0) {
            res.send("✔ Password updated successfully");
        } else {
            res.send("❌ Old password is incorrect");
        }
    });
});







//log out
router.get('/logout',(req,res)=>
{
    
    if(req.session.aemail==null)
        return res.redirect('/admin')
    else
    {
    req.session.destroy((error)=>
    {
        if(error)
            console.error('there is an error')
        else
            res.redirect('/admin')
    })
}
})




module.exports = router;
