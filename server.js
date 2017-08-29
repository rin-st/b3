var express = require('express');
var app = express();
var mongodb = require('mongodb');
var validUrl = require('valid-url');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI;

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/new/:long(*)", function (request, response) {//for new addresses
  var longUrl = request.params.long;
  //response.writeHead(200, {'Content-Type':'text/html'});
  
  if (validUrl.isWebUri(longUrl)) { 
    var sh = 1 + Math.floor(10000*Math.random());
      response.end(JSON.stringify({"Original_URL": longUrl, "Short_URL": "https://shs.glitch.me/"+sh}));
      MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', url);
      db.collection('shorts').insert({"long": longUrl,"short": sh});
      db.close();
    }    
});
  }
  else response.end(JSON.stringify({"Error": "Wrong url format, make sure you have a valid protocol and real site."}));  
});

app.get("/:shor(*)", function(request, response){//for redirect
  var shortUrl = +request.params.shor;
  
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', url);
      
      var cursor = db.collection('shorts').findOne({"short": shortUrl},function(err,data){
        if (data) response.redirect(data.long);
        else response.end('Error: this url is not on the database')
      }); 
      db.close();    
    } 
  });
});
  

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
