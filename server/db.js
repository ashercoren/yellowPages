const MongoClient = require('mongodb').MongoClient;
/**
  Connect to the Mongo database
**/
var db;
var collection;
const RECCONECT_INTERVAL = process.env.MONGO_RECCONECT_INTERVAL || 2000;
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/klarna";

const indexColumns = ["name","phone","birthday"];
const collectionName = "yellow-pages"
function createIndexes(){
  indexColumns.forEach(index=>{
    var indexObject = {};
    indexObject[index] = 1;
    collection.createIndex(indexObject,(err,indexName)=>{
      if (err){
        console.error("error while creating index", indexName);
      }
      else {
        console.log("successfully created index", indexName)
      }
    })
  });
}

function connect (callback){
  MongoClient.connect(url, function(err, conn) {
    if (err){
      console.error("could not connect to db: " + err);
      callback(err);
    }
    else {

      console.log("Connected correctly to Mongo server");
      db = conn;
      collection = db.collection(collectionName);
      createIndexes();

      db.on("close",function(e){
        db = null;
        console.error("ALERT: database closed!");
        reconnect();
      });
      db.on("error",function(e){
        console.error("database error: " + e);
      });
      callback(null);
    }
  });
};

function reconnect(){
  console.log("attempting to reconnect to database");
  var interval = setInterval(function(){
    connect(function(err){
      if (!err){
        clearInterval(interval);
      }
    })
  },RECCONECT_INTERVAL);
};

connect(function(err){
  if (err){
    console.error("ALERT: could not connect to db: " + err);
    process.exit(1);
  }
});

module.exports = {
  find:function(query,fields,callback){
  var collection = db.collection(collectionName);
  var projection = fields.reduce((res,field)=>{
    res[field]=1;
    return res;
  },{});
  collection.find(query,projection).toArray(callback);
  }
}