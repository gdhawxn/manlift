import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import router from './routes/index';
import mongodb from './database/mongodb';
import hbs from 'express-hbs';

import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session' ;
import config from './config/config' ;
import flash from 'connect-flash' ;
let MongoDBStore = connectMongo(session);

const port = process.env.PORT || 8888;

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

let store = new MongoDBStore({
    uri: config.database,
    collection: 'appSessions'
});

store.on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
});

app.use(session({
    secret: 'iloveiosd', // session secret
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));

import passport_config from './middlewares/passport' ;
passport_config(passport);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials' ,
    layoutsDir: __dirname + '/views/layouts' ,
    defaultLayout: __dirname + '/views/layouts/' + 'default',
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


app.use('/', router);
app.use(express.static('static'));
app.use(express.static('media'));


hbs.registerHelper('replacespace', function(text, options) {

    return text.replace(" " , "")
  });
  


mongodb.getConnection()
  .then((msg) => {
    console.log(msg);
    app.listen(port, () => {
      console.log(`Server running and listening in http://localhost:${port}`);
    });
    // require('./scripts/gen.js');
  })
  .catch((err) => {
    console.log(err);
  });
