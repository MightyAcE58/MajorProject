const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const { isReviewAuthor, validateReview, isLoggedIn} = require("../middleware.js");
const reviewsController = require("../controllers/reviews.js");
const review = require("../models/review.js");


//Reviews
//post route

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

//delete reviews route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewsController.deleteReview));


module.exports = router;