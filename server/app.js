const express = require('express');
const app = express();
const db = require('./db');

app.use(express.static('build'));

function buildDates(query){
  var numberRegex = /(\d+)/g;
  var matches;
  var dates = [];
  while (matches = numberRegex.exec(query)){
    var age = matches[1];
    if (age < 999){
      var endDate = new Date();
      endDate.setFullYear(endDate.getFullYear()-age);

      var startDate = new Date();
      startDate.setFullYear(startDate.getFullYear()-age-1);
      var birthday = {
        $lt: endDate.getTime(),
        $gt: startDate.getTime()
      };
      dates.push({birthday:birthday});
    }
  }
  if (dates.length === 0){
    return null;
  }
  if (dates.length === 1){
    return dates;
  }
   return {$or:dates};
}

app.get('/query',(req,res,next)=>{
  var query = req.query.query;
  
  var searchQuery = []
  
  var name = query.match(/(?:^| )\D+/g);
  if (name){
    searchQuery.push({name: name[0].trim()});
  }
  
  var phone = query.match(/(\d-?){9,10}/g);
  if (phone){
    searchQuery.push({phone:phone[0]});
  }

  var dates = buildDates(query);
  if (dates) searchQuery = searchQuery.concat(dates);
  if (searchQuery.length===0){
    //no matching regex, return empty response
    return res.send([]);
  }
  searchQuery = {$and:searchQuery};
  console.log("final query:", searchQuery);
  db.find(searchQuery,
          req.query.fields.split(","),
          (err,data)=>{
    if (err){
      next(err);
    }
    else {
      res.send(data)
    }
  })
})

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500);
  res.send(err.message || err);
});

app.listen(process.env.PORT || 3005, function () {
  console.log('Example app listening on ', process.env.PORT || 3005);
})