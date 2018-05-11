// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
const router = require('./routes/routes');


//replace mongoose promises (incase not working?)
mongoose.Promise = Promise;

// Require all models
// var db = require("./models");
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Set Handlebars.
var exphbs = require("express-handlebars");

//Define port
var port = process.env.PORT || 3000

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

//use router directory
app.use('/', router);


app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/asdfasdfasd");


// Listen on port
app.listen(port, function() {
  console.log("App running on port " + port);
});

