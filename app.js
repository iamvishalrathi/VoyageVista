if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const { title } = require("process");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate"); //For navbar & footer template
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

//Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//Cookie
const cookie = require("express-session/session/cookie.js");
const flash = require("connect-flash");

//Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//Paths
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const dbUrl = process.env.ATLASDB_URL;

//Mongo Store Middleware
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
    secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

//Session Middleware
const sessionOptions= {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy

passport.serializeUser(User.serializeUser()); // use static serialize and deserialize of model for passport session support
passport.deserializeUser(User.deserializeUser());


//Connection
main()
.then(()=>{
    console.log("Connection to DB");
})
.catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl); 
}

// Local Variable
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
});

//DemoUser
// app.get("/demouser", async(req,res)=>{
//     let fakeUser= new User({
//         email: "abc@gmail.com",
//         username: "abcd"
//     });

//     let registeredUser= await User.register(fakeUser, "abcd");
//     res.send(registeredUser);
// });

//listingRouter
app.use("/listings", listingRouter);

//reviewRouter
app.use("/listings/:id/reviews", reviewRouter);

//userRouter
app.use("/", userRouter);

//Page Not Found
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

//Err Handling Middleware
app.use((err,req,res,next)=>{
    let {statusCode=500, message= "Something went wrong!"}= err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message });
});

//Listen
app.listen("8080", ()=>{
    console.log("Listening to port 8080");
});