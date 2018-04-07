import express from 'express';
import passport from 'passport';
import crypto from 'crypto' ;
import SMS from '../models/sms' ;
import request from 'request' ;
import config from '../config/config' ;

let router = express.Router();

router.get('/login' , (req , res) => {
    res.render('login');
});

// router.get('/thanks' , (req , res) => {
//     res.render('feedback');
// });


router.post('/login' , passport.authenticate('local-login' , {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// router.post('/signup' , passport.authenticate('local-signup' , {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: false
// }));

router.get('/logout' , function (req,res) {
    if(req.isAuthenticated()){
        req.logOut();
        res.redirect('/login');
    }
});

router.get('/chart' , isLoggedIn , function(req , res){

    SMS
    .aggregate([
        {
            "$match": {
                completed: true
            }
        },
        { 
            "$group": {
                "_id": {
                    "rating": "$response.rating",
                    "station": "$station"
                },
                "stationcount": { "$sum": 1 }
            }
        },
        { 
            "$group": {
                "_id": "$_id.station",
                "rating": { 
                    "$push": { 
                        "rating": "$_id.rating",
                        "count": "$stationcount"
                    },
                },
                "count": { "$sum": "$stationcount" }
            }
        }
		
    ])
    .then((data) => {
        console.log( JSON.stringify(data , null , 4)  ) ;
        
        let stationdict = {};

        data.forEach( station => {
            if( station._id === null  ){
                return
            }

            let array = [0,0,0,0,0] ;
            station.rating.forEach(element => {
                array[  parseInt(element.rating) - 1 ] = element.count    
            });

            stationdict[station._id] = array


        })

        console.log(stationdict);
        res.render('chart' , {
            recordsstring : JSON.stringify(stationdict) ,
            records : stationdict ,
            user : req.user
        })
    })
});


router.get('/details/' , isLoggedIn , function(req , res){

    SMS.find({completed : true}).then((data) => {
        res.render('details' , {
            records : data ,
            user : req.user
        })
    })

})


router.post('/newsms' , function(req,res){
    if(req.isAuthenticated()){
        let name = req.body.name ;
        let mobno = req.body.mobno ;
        let station = req.body.station ;
        let token = crypto.randomBytes(15).toString('hex');
        console.log(token);

        let doc = {
            name : name ,
            mobno : '91' + mobno ,
            token : token ,
            station : station
        }
        
        let sms = new SMS(doc);
        sms.save().then((data)=>{
            res.redirect('/sendsms/' + token);
        } , (err) => {
            res.send(err); 
        });
    
    } else {
        res.send({
            'message' : "Not Authenticated. Please Login Again"
        })
    }
}); 

router.get('/sendsms/:token' , function(req,res){
    if(req.isAuthenticated()){
        
        SMS.findOne({
            token : req.params.token
        }).then(( data )=>{
            if(data) {
                console.log("Found Token. Sending SMS")
                console.log(data);

                let url = config.url +  "/feedback/" + data.token ; 
                
                console.log(url);
                
                let payload = {
                    url ,
                    to : '+91' + data.mobno 
                }

                console.log(payload);

                var options = {
                    url: "http://api.msg91.com/api/v2/sendsms" ,
                    headers: {
                      "authkey": config.authkey
                    } ,
                    json : true ,
                    body : {
                        "sender": "ARUPOL",
                        "route": "4",
                        "country": "91",
                        "sms": [
                          {
                            "message": 'Please fill this feedback for your recent visit at the police station. ' + payload.url + ' OR SMS APFEEDBACK 5/4/3/2/1 at 9229224424. Example "APFEEDBACK 5" to 9229224424' ,
                            "to": [
                              data.mobno
                            ]
                          }
                        ]
                      } ,
                    method : "POST"
                  };
                
                  console.log(options)

                  function callback(error, response, body) {
                      console.log('Callback')
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                        data.expired = true ;
                        data.save().then(function(dddddd){
                            res.redirect('/?success=true')
                        } , function(err) {
                            console.error(err) ;
                            res.send("Some Error Occured in Saving")
                        })
                    } else {
                        console.log(error);
                        console.log(response);
                        console.log(body);
                        res.send('not ok');
                    }
                  }
                  
                  request(options, callback);

            } else {
                console.log("Not Found Token. Abort")
                res.send({
                    'message' : 'Token not Found. Please Try Again'
                })
                
            }
        })
    } else {
        res.send({
            'message' : "Not Authenticated. Please Login Again"
        })
    }
});


router.get('/feedback/:token/' , (req, res) => {
    SMS.findOne({
        token: req.params.token 
    }).then((sms) => {
        if(  !sms.completed ) {
            res.render( 'feedback' , {
                'sms' : sms ,
                'isolated' : true
            })
        } else  {
            res.send("Already Collected Feedback from this Token")
        }

    } , (err) => {
        res.send("Critical Error. Please Try Again Later")
    }) 
}); 


router.post('/feedback/:token/' , (req, res) => {
    SMS.findOne({
        token: req.params.token 
    }).then((sms) => {
        
        if(  !sms.completed  ) {
            sms.response = req.body ;
            sms.completed = true ;
            sms.save().then((data) => {
                res.render('thanks' , {
                    sms : data
                })
            })
        } else  {
            res.send("Already Collected Feedback from this Token")
        }

    } , (err) => {
        res.send("Critical Error. Please Try Again Later")
    }) 
}); 


router.get('/' , (req , res)=>{
    
    console.log("Coming at Home")
    if( req.isAuthenticated() ){
        console.log(req.user);
        
        if( req.query.success ) {
            res.render('dashboard' , {
                user : req.user ,
                success : true
            });
        } else {
            res.render('dashboard' , {
                user : req.user
            });
        }

        
    }  else {
        res.redirect('/login')
    }
    
});

router.post('/smsprovider/callback' , (req , res ) => {
    console.log(req.body);
    let number = req.body.number ;
    let message = req.body.message ;
    let keyword = req.body.keyword ;

    SMS.find({
        mobno : number ,
        completed : false
    }).then((data) => {
        console.log(data);

        if(  Array.isArray(data)  ) {
            data = data.pop();
        }

        console.log(data);
        console.log(data.save);

        data.response.rating = parseInt(message) ;
        data.completed = true ;

        data.save().then((result) => {
            console.log(result)
            res.send('ok');
        });
    } , (err) => {
        console.log(err);
        res.code(500).send();
    });


});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    
    res.redirect('/');
}

export default router;
