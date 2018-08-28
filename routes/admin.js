import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import request from 'request';
import config from '../config/config';
var machine = require('../models/machines');
var breakdown = require('../models/breakdowns');
var users = require('../models/user');
let router = express.Router();
var employees = require('../models/employee');

router.get('/login', (req, res) => {
    res.render('login');
});




router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
}));

router.get('/logout', function(req, res) {
    if (req.isAuthenticated()) {
        req.logOut();
        res.redirect('/login');
    }
});


router.get("/user/new", isLoggedIn, function(req, res) {
    res.render("newuser", {
        user: req.user
    });
});

router.post("/user/new", isLoggedIn, function(req, res) {
    users.create({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            console.log(user);
        }
    })
    res.redirect("/");
});

router.get("/employee/new", isLoggedIn, function(req, res) {
    res.render("newemployee", {
        user: req.user
    });
});

router.get("/employees/get",function(req,res){
   employees.find({}).then(data => {
        if (data) {
            res.render('indexemployee', {
                mcs: data,
                user: req.user
            })
        }
    });
});

router.post("/employee/new", isLoggedIn, function(req, res) {
    employees.create({
        name: req.body.name,
        phone_number: req.body.phone_number,
        password: req.body.password,
        email: req.body.email
    }, function(err, employee) {
        if (err) {
            console.log(err);
        } else {
            console.log(employee);
        }
    })
    res.redirect("/");
});

router.get('/machine/new', isLoggedIn, function(req, res) {
    res.render('newmachine.hbs', {
        user: req.user
    });
});
router.post('/machine', function(req, res) {
    var sno = req.body.sno;
    var make = req.body.make;
    var model = req.body.model;
    var year = req.body.year;
    var rival = req.body.rival;
    var depo = req.body.deponame;
    var catagory = req.body.catagory;
    var fuel = req.body.fuel;
    var hmeter = req.body.hmeter;
    machine.create({
        sno: sno,
        make: make,
        model: model,
        year: year,
        rival: rival,
        catagory: catagory,
        deponame: depo,
        fuel: fuel,
        hmeter: hmeter
    }, function(err, machine) {
        if (err) {
            console.log(err);
        } else {
            console.log(machine);
        }
    })
    res.redirect("/");
});


router.post("/machine/breakdown", function(req, res) {
    machine.findOne({
        sno: req.body.sno
    }, function(err, m) {
        if (!err) {
            console.log(m);
            console.log(req.body)
            breakdown.create({
                ...req.body ,
                machine:m._id
            }).then( breakdown => {
                console.log(breakdown);
                    res.redirect("/");
                }).catch(err => {
                console.error(err)
            })
        } else {
            res.redirect("/");
        }
    });
});


router.get("/machine/breakdown/new", isLoggedIn, function(req, res) {
    machine.find({}).then(data => {
        if (data) {
            res.render('newbreakdown', {
                mcs: data,
                user: req.user
            })
        }
    })
});

router.post("/machine/breakdown/complete",function(req,res){
    const {parts, solved , signature , job , id } = req.body ;
    let input = {
        parts ,
        solved ,
        signature ,
        job ,
        completed : true
    } 
    let query = {
        _id  : id
    }
    
    if(!query._id){
        res.json({
            success : false ,
            message : "ID Field is Required"
        })
    }
    
    
    
    breakdown.findOneAndUpdate(query , input , {new : true}).then(data => {
        console.log(data);
        res.json({
            success : true ,
            data : data
        });
    }).catch(err => {
        console.error(err);
    }) 
});


router.get('/machine/get' , (req , res) => {
    let query = {};
    const {id , sno } = req.query;
    if(id){
        query._id = id ;
    } else if(sno){
        query.sno = sno ;
    } else {
        res.json({
            success : false ,
            message : "ID or SNO is Reqd"
        })
    }
    machine.findOne(query).then(data => {
        if(data){
            res.json({
                success : true ,
                data 
            })    
        } else {
            res.json({
                success : false ,
                message : "Machine Not Found" 
            })
        }
        
    }).catch(err => {
        console.error(err);
        res.json({
            success : false ,
            message : "Some Error Occured"
        })
    })
    
})

router.get('/machine/breakdowns/get' , (req , res) => {
    let query = {};
    const {id} = req.query;
    if(id){
        query.machine = id ;
    } else {
        res.json({
            success : false ,
            message : "ID is Reqd"
        })
    }
    breakdown.find(query).then(data => {
        if(data){
            res.json({
                success : true ,
                data 
            })    
        } else {
            res.json({
                success : false ,
                message : "No Breakdown For Machine" 
            })
        }
        
    }).catch(err => {
        console.error(err);
        res.json({
            success : false ,
            message : "Some Error Occured"
        })
    })
    
})



router.get("/machine/:id", function(req, res) {
    machine.findById(req.params.id, function(err, machine) {
        res.render('show', {
            user: req.user,
            c: machine,
            link:"/machine/"+req.params.id
        });
    })
});

router.get('/', isLoggedIn, (req, res) => {

    machine.find({}).then(data => {
        if (data) {
            res.render('index', {
                mcs: data,
                user: req.user
            })
        }
    })

    // res.render('index',{mcs:machine})

});


router.get("/machine/:id/delete", function(req, res) {
    var id = req.params.id;
    console.log(id);
    machine.findByIdAndRemove(id, function(err, machine) {
        if (!err) {
            res.redirect('/');
        } else {
            res.redirect("/");
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

router.get("/users", function(req, res) {
    users.find({}).then(data => {
        if (data) {
            res.render('indexuser', {
                mcs: data,
                user: req.user
            })
        }
    })
});

export default router;