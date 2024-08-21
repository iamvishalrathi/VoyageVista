const Listing = require("../models/listing.js");

//Geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Routes
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    //Category Filter
    if(["Arctic", "Amazing Pools", "Farms", "Castles", "Trending", "Rooms", "Iconic Cities", "Mountains", "Camping", "Domes", "Boats"].includes(id)){
        
        const allListings =  await Listing.find({category : id});
        return res.render("listings/index.ejs",{allListings});
    }

    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing doesn't exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // GeoCoding
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    //Image
    let url = req.file.path;
    let filename = req.file.filename;

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");//Flash created
    res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    let {destination,country,city}= req.query;
    const listing1 = await Listing.find({title : destination});
    const listing2 = await Listing.find({country : country});
    const listing3 = await Listing.find({location : city});

    function findCommon(listing1, listing2, listing3){
        // Check if all three arrays are empty
        if (listing1.length === 0 && listing2.length === 0 && listing3.length === 0) {
            return [];
        }

        // Check if any wrong combination is added
        if ((destination!=[] && listing1.length === 0) || (country!=[] && listing2.length === 0) || (city!=[] && listing3.length === 0)) {
            return [];
        }

        // Check if two arrays are empty
        if (listing1.length === 0 && listing2.length === 0) {
            return listing3;
        }
        if (listing1.length === 0 && listing3.length === 0) {
            return listing2;
        }
        if (listing2.length === 0 && listing3.length === 0) {
            return listing1;
        }

        // One array empty
        if (listing1.length === 0) {
            return listing2.filter(item1 => 
                listing3.some(item2 => item1._id.toString() === item2._id.toString())
            );
        }
        if (listing2.length === 0) {
            return listing1.filter(item1 => 
                listing3.some(item2 => item1._id.toString() === item2._id.toString())
            );
        }
        if (listing3.length === 0) {
            return listing2.filter(item1 => 
                listing1.some(item2 => item1._id.toString() === item2._id.toString())
            );
        }
        
        // No array is empty
        else{
            return listing1.filter(item1 => 
                listing2.some(item2 => item2._id.toString() === item1._id.toString()) &&
                listing3.some(item3 => item3._id.toString() === item1._id.toString())
            );
        }      
    }
    const allListings = findCommon(listing1,listing2,listing3);
    // console.log(allListings);

    res.render("listings/index.ejs",{allListings});
}

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist");
        res.redirect("/listings");
    }
    let originalImgUrl = listing.image.url;
    originalImgUrl = originalImgUrl.replace("/upload", "/upload/ar_1.0,c_fill,h_250,w_300/bo_5px_solid_grey");
    let categoryArr= ["None", "Amazing Pools", "Arctic", "Boats", "Camping", "Castles", "Domes", "Farms", "Iconic Cities", "Mountains", "Rooms", "Trending"];
    res.render("listings/edit.ejs", { listing, originalImgUrl, categoryArr });
};

module.exports.updateListing = async (req, res, next) => {
        // GeoCoding
        let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //Deconstruct & Update Listing
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    listing.geometry = response.body.features[0].geometry;
    await listing.save();
    req.flash("success", "Listing Updated!");//Flash created
    console.log(listing);
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");//Flash created
    res.redirect(`/listings`);
}