const express = require("express");
const app = express.Router();
const db = require('../models/')
const Comment = require('../models/Comment')

// / Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");


// Routes
///////////////////////////////////////////////
//GET requests to render Handlebars pages
app.get("/", function(req, res) {
    db.Article.find({"saved": false}, function(error, data) {
      var hbsObject = {
        article: data
      };
      console.log(hbsObject);
      res.render("home", hbsObject);
    });
  });
  
  app.get("/saved", function(req, res) {
    db.Article.find({"saved": true}).populate("comments").exec(function(error, articles) {
      var hbsObject = {
        article: articles
      };
      res.render("saved", hbsObject);
    });
  });
  
  // A GET request to scrape the echojs website
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("http://www.nytimes.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function(i, element) {
  
        // Save an empty result object
        var result = {};
  
        // Add the title and summary of every link, and save them as properties of the result object
        result.title = $(this).children("h2").text();
        result.summary = $(this).children(".summary").text();
        result.link = $(this).children("h2").children("a").attr("href");
  
        // Create a new Article using the `result` object built from scraping
        //whichever results we get write to the db after visiting the scrape route
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
          
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
    // Tell the browser that we finished scraping the text
  });
  
  
  
  // This will get the articles we scraped from the mongoDB
  app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    db.Article.find({}, function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(err, dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });
  
  // Grab an article by it's ObjectId
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ "_id": req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comment")
    .then(function(err, dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });
  
  
  // Save an article
  app.post("/articles/save/:id", function(req, res) {
        // Use the article id to find and update its saved boolean
        db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
        // Execute the above query
        .then(function(err, dbArticle) {
          // If we were able to successfully find an Article with the given id, send it back to the client
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
  });
  
  // Delete an article
  app.post("/articles/delete/:id", function(req, res) {
        // Use the article id to find and update its saved boolean
        db.Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false, "comments": []})
        // Execute the above query
        .then(function(err, dbArticle) {
          // If we were able to successfully find an Article with the given id, send it back to the client
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
  });
  
 // Create a new note
app.post("/comments/save/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newComment = new Comment({
    body: req.body.text,
    article: req.params.id
  });
  // console.log(req.body)
  // And save the new note the db
  newComment.save(function(error, comment) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's notes
      db.Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "comments": comment } })
      // Execute the above query
      .exec(function(err) {
        // Log any errors
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          // Or send the note to the browser
          res.send(comment);
        }
      });
    }
  });
});

  
  // Delete a comment
  app.delete("/comments/delete/:comment_id/:article_id", function(req, res) {
    // Use the comment id to find and delete it
    db.Comment.findOneAndRemove({ "_id": req.params.comment_id }, function(err) {
      // Log any errors
      if (err) {
        console.log(err);
        res.send(err);
      }
      else {
        db.Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"comments": req.params.comment_id}})
         // Execute the above query
         .then(function(dbArticle) {
          // If we were able to successfully find an Article with the given id, send it back to the client
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
      }
    });
  });


  

module.exports = app;