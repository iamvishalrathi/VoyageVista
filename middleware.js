const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    req.session.redirectUrl = req.originalUrl;
    res.locals.redirectUrl = req.session.redirectUrl;
    console.log(`Redirect Url : ${req.session.redirectUrl}`);
    next();
};

module.exports.savedRedirectUrl= (req,res,next)=>{
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isValidSearch = (req,res,next)=>{
    console.log(req.query);
    let {destination,country,city}= req.query;
    if( (typeof destination === "undefined" || typeof country === "undefined" || typeof city === "undefined") || (destination==="" && country==="" && city==="")){
        req.flash("error", "Enter Valid Keywords");
        // console.log(res.locals.redirectUrl);
        let redirectUrl = res.locals.redirectUrl || "/listings";
        return res.redirect(redirectUrl);
    }
    next();
};

module.exports.isAuthorisedUser = (req,res,next)=>{
    const authorisedUsers= ["user2","user3","random"];
    for (const user of authorisedUsers) {
        if (user===res.locals.currUser.username) {
            return next();
        }
    }
    req.flash("error", "You aren't authorised to create Listing. Contact Owner!");
    return res.redirect(`/listings`);
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You aren't the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You aren't the auhtor of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    console.log(error);
        if (error) {
            let errMsg = error.details.map((el)=>el.message).join(","); //To print additional
            //details with error
            console.log(errMsg);
            throw new ExpressError(400, errMsg);
        } else{
            next();
        }
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    console.log(error);
        if (error) {
            let errMsg = error.details.map((el)=>el.message).join(","); //To print additional
            //details with error
            console.log(errMsg);
            throw new ExpressError(400, errMsg);
        } else{
            next(); 
        }
};