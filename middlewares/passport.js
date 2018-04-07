import passport_local from 'passport-local';
import User from '../models/user' ;

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    passport.use('local-login', new passport_local.Strategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            if (username)
                username = username.toLowerCase();
            // asynchronous
            process.nextTick(function () {
                User.findOne({ 'username': username }, function (err, user) {
                    console.log(err , user);

                    if (err)
                        return done(err);

                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (!user.comparePassword(password)){
                        console.log("wrong Pasword");
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    }

                    else {
                        return done(null, user);
                    }
                });
            });

        }));

    // // LOCAL SIGNUP ============================================================
    passport.use('local-signup', new passport_local.Strategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            if (username)
                username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {

                if (!req.user) {
                    User.findOne({ 'username': username }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        } else {

                            var newuser = new User();

                            newuser.username = username;
                            newuser.email = req.body.email ;
                            newuser.password = password ;
                            newuser.name = req.body.name;
                            
                            console.log(req.body);

                            newuser.save(function (err) {
                                if (err)
                                    console.log(err);
                                    return done(err);

                                return done(null, newuser);
                            });
                        }

                    });

                } else {
                    return done(null, req.user);
                }

            });

        }));
};
