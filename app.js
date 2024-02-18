require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./server/config/db');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = 5000 || process_params.ev.PORT;

connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'zany vagabond',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}));

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Branch Routing
app.use('/', require('./server/routes/public'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});