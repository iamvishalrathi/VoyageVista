const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { saveRedirectUrl, isLoggedIn, isOwner, validateListing, savedRedirectUrl, isValidSearch} = require("../middleware.js");

const multer  = require('multer');
const {storage} = require("../cloud-config.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

router
    .route("/")
    //Index Route
    .get(saveRedirectUrl, wrapAsync(listingController.index))
    //Create Route
    .post(saveRedirectUrl, isLoggedIn ,upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

//New Route
router.get("/new", saveRedirectUrl, isLoggedIn, listingController.renderNewForm);

//Search
router.get("/search", savedRedirectUrl, isValidSearch, saveRedirectUrl ,wrapAsync(listingController.searchListings));

router
    .route("/:id")
    //Show Route
    .get(saveRedirectUrl, wrapAsync(listingController.showListing))
    //Update Route
    .put(saveRedirectUrl, isLoggedIn, isOwner ,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    //Delete Route
    .delete(saveRedirectUrl, isLoggedIn , isOwner , wrapAsync(listingController.deleteListing));

//Edit Route
router.get("/:id/edit", saveRedirectUrl, isLoggedIn , isOwner, wrapAsync(listingController.editListing));

module.exports = router;