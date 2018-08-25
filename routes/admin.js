import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import SMS from '../models/sms';
import request from 'request';
import config from '../config/config';
var machine = require('../models/machines');
var breakdown = require('../models/breakdowns');
var users = require('../models/user');
let router = express.Router();

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


router.get("/register", isLoggedIn, function(req, res) {
    res.render("newuser", {
        user: req.user
    });
});

router.post("/register", isLoggedIn, function(req, res) {
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

router.get('/index/new', isLoggedIn, function(req, res) {
    res.render('newmachine.hbs', {
        user: req.user
    });
});
router.post('/index', function(req, res) {
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


router.post("/index/breakdowns", function(req, res) {
    var c = req.body.breakdown;
    var p = [];
    p = c.parts.split(",");
    machine.find({
        sno: req.body.sno
    }, function(err, m) {
        if (!err) {
            breakdown.create({
                machine: m._id,
                site_name: c.site_name,
                site_address: c.site_address,
                phone_number: c.phone_number,
                fault: c.fault,
                parts: p,
                solved: c.solved
            }, function(err, breakdown) {
                if (!err) {
                    //                  machine.breakdowns.push(breakdown);
                    //                  machine.save();
                    console.log(breakdown);
                    res.redirect("/");
                }
            });
        } else {
            res.redirect("/");
        }
    });
});


router.get("/index/breakdowns/new", isLoggedIn, function(req, res) {
    machine.findById(req.params.id, function(err, machine) {
        if (!err) {
            res.render("newbreakdown", {
                c: machine,
                user: req.user
            });
        }
    });
});

router.get("/index/:id", function(req, res) {
    machine.findById(req.params.id, function(err, machine) {
        res.render('show', {
            user: req.user,
            c: machine
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

router.post('/smsprovider/callback', (req, res) => {
    console.log(req.body);
    let number = req.body.number;
    let message = req.body.message;
    let keyword = req.body.keyword;

    SMS.find({
        mobno: number,
        completed: false
    }).then((data) => {
        console.log(data);

        if (Array.isArray(data)) {
            data = data.pop();
        }

        console.log(data);
        console.log(data.save);

        data.response.rating = parseInt(message);
        data.completed = true;

        data.save().then((result) => {
            console.log(result)
            res.send('ok');
        });
    }, (err) => {
        console.log(err);
        res.code(500).send();
    });


});


router.get("/index/:id/delete", function(req, res) {
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
})

export default router;