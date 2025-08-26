
   // app.js
   const express = require('express');
   const session = require('express-session');
   const RedisStore = require('connect-redis').default; // Updated import
   const redis = require('redis');
   const dotenv = require('dotenv');
   const path = require('path');

   dotenv.config();

   const app = express();
   const redisClient = redis.createClient({ url: process.env.REDIS_URL });

   app.set('view engine', 'ejs');
   app.set('views', path.join(__dirname, 'views'));
   app.use(express.static(path.join(__dirname, 'public')));
   app.use(express.urlencoded({ extended: true }));

   app.use(session({
       store: new RedisStore({ client: redisClient }),
       secret: process.env.SESSION_SECRET,
       resave: false,
       saveUninitialized: false,
       cookie: { secure: false } // Set to true if using HTTPS
   }));

   redisClient.connect().catch(console.error);

   // Dummy user for demonstration
   const user = {
       username: 'user',
       password: 'password'
   };

   // Routes
   app.get('/', (req, res) => {
       res.render('login');
   });

   app.post('/login', (req, res) => {
       const { username, password } = req.body;
       if (username === user.username && password === user.password) {
           req.session.user = user;
           return res.redirect('/dashboard');
       }
       res.redirect('/');
   });

   app.get('/dashboard', (req, res) => {
       if (!req.session.user) {
           return res.redirect('/');
       }
       res.render('dashboard', { user: req.session.user });
   });

   app.get('/logout', (req, res) => {
       req.session.destroy(err => {
           if (err) {
               return res.redirect('/dashboard');
           }
           res.redirect('/');
       });
   });

   // Start the server
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
       console.log(`Server is running on http://localhost:${PORT}`);
   });
   
