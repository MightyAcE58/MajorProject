if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const PORT = process.env.PORT || 8080;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const Review = require("./models/review.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { log } = require('console');

const dbUrl = process.env.ATLASDB_URL;


main().then(() => {
    console.log("Connected to DB")
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

console.log("ATLASDB_URL exists:", !!process.env.ATLASDB_URL);
console.log("SECRET exists:", !!process.env.SECRET);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on("error", (err)=>{
    console.log("ERROR in Mongo Store", err);
    
});

const sessionOPtions = {
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


app.use(session(sessionOPtions));
app.use(flash());

//passport

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => { //here we can define local variable to access 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;

        console.log("currUser:", res.locals.currUser);
    next();
});


// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.use("/", userRouter);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);



app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
    //  res.status(statusCode).send(message);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
