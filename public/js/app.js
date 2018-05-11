//Handle Scrape button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).then(function(data) {
        console.log(data);
        window.location = "/"
    })
});

//Set clicked nav option to active
$(".navbar-nav li").click(function() {
   $(".navbar-nav li").removeClass("active");
   $(this).addClass("active");
});

//Handle Save Article button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).then(function(data) {
        window.location = "/"
    })
});

//Handle Delete Article button
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).then(function(data) {
        window.location = "/saved"
    })
});

//Handle Save comment button
$(".savecomment").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#commentText" + thisId).val()) {
        alert("please enter a comment to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/comments/save/" + thisId,
            data: {
              text: $("#commentText" + thisId).val()
            }
          }).then(function(data) {
              // Log the response
              console.log(data);
              // Empty the comments section
              $("#commentText" + thisId).val("");
              $(".modalcomment").modal("hide");
              window.location = "/saved"
          });
    }
});

//Handle Delete comment button
$(".deleteComment").on("click", function() {
    var commentId = $(this).attr("data-comment-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/comments/delete/" + commentId + "/" + articleId
    }).then(function(data) {
        console.log(data)
        $(".modalcomment").modal("hide");
        window.location = "/saved"
    })
});
