var express = require("express");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
// var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

var router = express.Router();

//require routes file passes router object
require("./config/routes")(router);

app.use(express.static(__dirname = "/public"));

app.engine("handlebars", expressHandlebars({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//Use bodyParser in our app
app.use(bodyParser.urlencoded({
  extended: false
}));

//have every request go through router middleware
app.use(router);



// // Configure middleware


// // Connect to the Mongo DB
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

//connect mongoose to our db
mongoose.connect(db, function(error) {
  if (error) {
    console.log(error);
  }else {
    console.log("mongoose connection is successful");
  }
});

// // Routes
// A GET route for scraping the yahoo news website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://news.yahoo.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});