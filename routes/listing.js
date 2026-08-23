const express = require("express");
const router = express.Router();

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

const wrapAsync = require("../utils/wrapAsync.js");
// const { listingSchema } = require("../schema.js");
// const ExpressError = require("../utils/ExpressError.js");
// const Listing = require("../models/listing");
// const Review = require("../models/review.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});




router.route("/").get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync(listingController.createNewListing));

//Index Route

// router.get("/", wrapAsync(listingController.index));

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show route

router.route("/:id").get( wrapAsync(listingController.renderShowListing)).put(isLoggedIn ,isOwner,upload.single('listing[image]'), validateListing ,wrapAsync(listingController.updateListing)).delete(isLoggedIn,isOwner, wrapAsync(listingController.deletelisting));


//Create rout

// router.post("/", validateListing, wrapAsync(listingController.createNewListing));

//Edit rout

router.get("/:id/edit", isLoggedIn, isOwner ,wrapAsync(listingController.editListing));

//Update route

router.put("/:id",isLoggedIn ,isOwner, validateListing ,wrapAsync(listingController.updateListing)); 

//Delete route

// router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.deletelisting));

module.exports = router;