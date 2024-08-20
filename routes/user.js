const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { savedRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../controllers/users.js"); 

//Signup
router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(savedRedirectUrl, wrapAsync(userController.signup));

//Login
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(savedRedirectUrl,
        passport.authenticate("local", 
        {failureRedirect: "/login", failureFlash:true}),
        wrapAsync(userController.login));

//Logout
router.get("/logout", userController.logout);

module.exports= router;
