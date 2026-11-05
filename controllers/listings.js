const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MPA_TOKEN;
// const geocodingClient = mbxGeocoding({
//     accessToken: MPA_TOKEN
// });


module.exports.index = async (req, res) => {
    let filter = {};
    if (req.query.q) {
        let q = req.query.q.trim();
        filter = {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        };
    } else if (req.query.region) {
        filter = {
            location: { $regex: req.query.region, $options: "i" }
        };
    }
    let allListings = [];
    try {
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            allListings = await Listing.find(filter);
        }
    } catch (err) {
        console.log("DB find note:", err.message);
    }

    if (!allListings || allListings.length === 0) {
        try {
            const initData = require("../init/data.js");
            if (initData && initData.data) {
                allListings = initData.data;
                if (req.query.q) {
                    const q = req.query.q.toLowerCase();
                    allListings = allListings.filter(l => 
                        (l.title && l.title.toLowerCase().includes(q)) ||
                        (l.location && l.location.toLowerCase().includes(q)) ||
                        (l.country && l.country.toLowerCase().includes(q))
                    );
                } else if (req.query.region) {
                    const r = req.query.region.toLowerCase();
                    allListings = allListings.filter(l => l.location && l.location.toLowerCase().includes(r));
                }
            }
        } catch (e) {
            console.log("Fallback data load error:", e.message);
        }
    }
    res.render("listings/index", { allListings });
};


module.exports.renderNewForm =  (req, res) => {
    res.render("listings/new.ejs");
};


module.exports.renderShowListing = async (req, res) => {
    let { id } = req.params;
    let listing = null;
    try {
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            listing = await Listing.findById(id).populate({path:"reviews", 
                populate: {
                    path:"author",
                }
            }).populate("owner");
        }
    } catch (err) {
        console.log("DB findById note:", err.message);
    }
    
    if (!listing) {
        try {
            const initData = require("../init/data.js");
            if (initData && initData.data) {
                listing = initData.data.find(l => l._id && l._id.toString() === id) || initData.data[0];
                if (!listing.owner) {
                    listing.owner = { username: "John", _id: "6a732c11e83ec879008236db" };
                }
                if (!listing.reviews) {
                    listing.reviews = [];
                }
            }
        } catch(e) {}
    }

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createNewListing = async (req, res) => {

    // let response = await geocodingClient.forwardGeocode({
    //     query: req.body.listing.location,
    //     limit: 1,
    // }).send();

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    // newLinsting.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
   let originalImage =  listing.image.url;
    originalImage =  originalImage.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImage });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
 if(typeof req.file!=="undefined"){
   let url = req.file.path;
    let filename = req.file.filename;
    listing.image ={url, filename};
    await listing.save();
 };
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deletelisting = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}