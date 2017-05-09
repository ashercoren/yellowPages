// import React from 'react';
// import ReactDOM from 'react-dom';

// ReactDOM.render(
//   <h1>Hello, world!</h1>,
//   document.getElementById('root')
// );

const fields=["name","birthday","phone","address","avatar_image"];
fetchData = function(value){
  $.get( "/query", {query:value,fields:fields}, data=>{
    console.log(data);
  })
}

var timeout = null;

function inputChanged(e){
  if (timeout){
    clearTimeout(timeout);
  }
  timeout = setTimeout(()=>{
    fetchData(e.value);
  },1000);
}