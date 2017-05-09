import React, { Component } from 'react';
import axios from 'axios';

const fields=["name","birthday","phone","address","avatar_origin"];

class Person extends Component {
  constructor(props){
    super(props);
  }

  buildAge(){
    let birthday = this.props.person.birthday;
    var ageDifMs = Date.now() - birthday;
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);

    // let date = new Date(birthday);
    // let now = new Date();
    // return now.getFullYear() - date.getFullYear();
  }

  buildAddress(){
    let address = this.props.person.address;
    let result = Object.keys(address).reduce((s,key)=>{
      s+= " " + address[key] + ",";
      return s;
    },"");
    return result.slice(0,-1);
  }

  render() {
    return (
      <div className="cui__selector--direct__item"
           key={this.props.person._id}>
        <img className="user-avatar"
             src={this.props.person.avatar_origin}
             alt={this.props.person.avatar_origin}/>
        <div className="cui__selector--direct__label">
             {this.props.person.name} , {this.buildAge()}
        </div>
        <p className="cui__selector--direct__description">
           {this.buildAddress()}
        </p>
        <p className="cui__selector--direct__description">
           {this.props.person.phone}
        </p>
      </div>
    )
  }
}

class App extends Component {

  constructor(props){
    super(props);
    this.timeout = null;
    this.state = {
      result:null
    };
    this.inputChanged = this.inputChanged.bind(this);
  }

  fetchData(){
    axios.get("/query?query="+this.value+"&fields="+fields)
         .then(res=> {
            this.setState({results:res.data});
          })
  }

  inputChanged(element){
    if (this.timeout){
      clearTimeout(this.timeout);
    }
    this.value = element.target.value
    this.timeout = setTimeout(()=>{
      if (this.value.length > 0){
        this.fetchData();
      }
    },1000);
  }

  render() {

    var items;
    var results = this.state.results;
    if (results){
      if (results.length===0){
        items = (<p>No results, please review your search or try a different one</p>)
      }
      else if (results.length>50){
        items = (<p>Too many results; please refine your search</p>)
      }
      else {
          items = results.map(result=>{
          return (<Person person={result}/>)
        })
      }
    }

    return (
      <div className="search">
        <div className="cui__input giant">
          <input className="cui__input__input"
                 id="query-input"
                 onKeyUp={this.inputChanged}
                 placeholder="Type your search query" />
        </div>
        <div className="results">
          <div className="cui__selector--direct title">
              <h2 className="cui__selector--direct__title">
                Search results
              </h2>
              {items}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
