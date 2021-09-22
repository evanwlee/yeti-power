import './App.css';
//import React, {  useState } from "react";
import React from "react";
import { capitalCase } from "capital-case";
import Modal from 'react-bootstrap/Modal';

//const apiHostIp = '192.168.42.100:3001';
//const apiHostIp = '192.168.1.195:3001';
const ip = window.location.hostname;
const apiHostIp= ip + ':3001';


class Yeti extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      yetiIp:'',
      yetiData:{status:'loading...'},
      showModal: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleIhandleGetIpClickpClick = this.handleGetIpClick.bind(this);
  }
  componentDidMount() {
    this.refreshData();
    this.dataRefresh = setInterval(
      () => this.refreshData(),
      10000
    );
  }
  componentWillUnmount() {
    clearInterval(this.dataRefresh);
  }
  refreshData() {
    if(this.state.yetiIp === ''){
      fetch(`http://${apiHostIp}/api/searchIP`)
      .then((response) => response.json())
      .then((data) => {
        this.setState( { yetiIp : data[0].ip })
        return fetch(`http://${data[0].ip}/state`);
      } )
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject(response);
        }
      }).then((data) => this.setState( { yetiData : data }))
    }else{
      fetch(`http://${this.state.yetiIp}/state`)
        .then((response) => response.json())
        .then((data) => this.setState( { yetiData : data }));
    }
  }

  handleGetIpClick() {
    fetch(`http://${apiHostIp}/api/searchIP`)
    .then((response) => response.json())
    .then((data) => this.setState( {yetiIp:data[0].ip}) );
  }
  
  handleClick(field) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let toggle = 1 - this.state.yetiData[field];
    var obj = {};
    obj[field] = toggle;
    var raw = JSON.stringify(obj);


    var requestOptions = {
      method: 'POST',
      mode: 'no-cors',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`http://${this.state.yetiIp}/state`, requestOptions)
      .then(response => response.text())
      .then(result => this.refreshData())
      .catch(error => console.log('error', error));

  }

  handleGetWifiClick(){
    var myHeaders = new Headers();
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders
    };

    fetch(`http://${this.state.yetiIp}/wifi`, requestOptions)
      .then(response => response.json())
      .then((data) => this.setState({ message: 'Wifi Info: '+JSON.stringify(data, null, 4), showModal:true }) )
      .catch(error => console.log('error', error));
  }
  
  handleStartGenClick(){
    
    fetch(`http://${apiHostIp}/api/gen/start`)
    .then((response) => response.json())
    .then((data) => this.setState({ message: 'Generator start command sent.\n\nRetry if it did not start.', showModal:true }) );
  }

  handleStopGenClick(){
    fetch(`http://${apiHostIp}/api/gen/stop`)
    .then((response) => response.json())
    .then((data) => this.setState({ message: 'Generator stop command sent.\n\nRetry if it did not stop.', showModal:true }) );

  }

  close = () => {
    this.setState({ showModal: false });
  }

  render() {
    //console.log(this.state)
    
    let ipStatus = '';
    if (this.state.yetiIp === '') {
      ipStatus = <li className="list-group-item d-flex justify-content-between align-items-center" key="ipAddre">Seeking Yeti IP...</li>
    }else{
      ipStatus = <li className="list-group-item d-flex justify-content-between align-items-center" key="ipAddre">Yeti IP: <span className="badge badge-primary badge-pill">{this.state.yetiIp}</span></li>
    }
    const list = (<div>
      <Modal show={this.state.showModal} onHide={this.close}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Action Taken</h5>
              <button type="button" className="close" data-dismiss="modal" onClick={this.close} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <pre>{this.state.message}</pre>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.close} data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </Modal>
      <ul className="list-group">
          {
                Object.entries(this.state.yetiData).map(([key, val]) => 
                  {
                    //console.log('The key is --> '+key)
                    if(typeof val === 'object'){
                      return <ComplexListItem key={key} name={key} dataMap={val}/>
                    }else{
                      switch(key) {
                        case 'v12PortStatus':
                        case 'usbPortStatus':
                        case 'acPortStatus':
                          return <ActionableListItem key={key} name={key} value={val} passedFunction={this.handleClick}/>
                        case 'temperature':
                          return <TempratureListItem key={key} name={key} value={val}/>
                        case 'inputDetected':
                        case 'isCharging':
                        case 'backlight':
                        case 'app_online':
                          return <BooleanListItem key={key} name={key} value={val}/>
                        default:
                          return <SimpleListItem key={key}  name={key} value={val}/>
                      }
                    }
                  }
                )
            }
            {ipStatus}
      </ul><br/>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-6">
            <button onClick={() => this.handleGetWifiClick()} type="button" className="btn btn-sm btn-outline-primary">Get Wifi Info</button>
          </div>
          <div className="col-6">
            <button onClick={() => this.handleStartGenClick()} type="button" className="btn btn-sm btn-outline-primary">Start Generator</button>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12">
            &nbsp;          
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-6">
            <button onClick={() => this.handleGetIpClick()} type="button" className="btn btn-sm btn-outline-primary">Reload Yeti IP</button>
          </div>
          <div className="col-6">
            <button onClick={() => this.handleStopGenClick()} type="button" className="btn btn-sm btn-outline-primary">Stop Generator</button>
          </div>
        </div>
      </div>


    </div>);
    return list ;
  }
}

function TempratureListItem(props) {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center" >
    {capitalCase(props.name)}: <span className="badge badge-primary badge-pill">{cToF(props.value)}</span>
    </li>
  );
}

function ComplexListItem(props) {
  //console.log('here',props.dataMap);

  if(props.dataMap === null){
    return '';
  }else{
    return (<li className="list-group-item d-flex justify-content-between align-items-center">{capitalCase(props.name)} ->  
      {
        Object.entries(props.dataMap).map(([tkey, tval]) => 
          {
            return ' ' + capitalCase(tkey) + ` : ${tval},`
          }
        )
      }
      </li>
    )
  }
}

function SimpleListItem(props) {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">{capitalCase(props.name)}: 
    <span className="badge badge-primary badge-pill">{props.value}</span>
    </li>
  );
}

function BooleanListItem(props) {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
    {capitalCase(props.name)}: <span className="badge badge-primary badge-pill">{boolToString(props.value)}</span>
    </li>
  );
}

function ActionableListItem(props) {
  return (
  <li className="list-group-item d-flex justify-content-between align-items-center">
    {capitalCase(props.name)}: <span className="badge badge-primary badge-pill">{statusToString(props.value)}</span>
    <button onClick={() => props.passedFunction(props.name)} type="button" className="btn btn-sm btn-outline-primary">Toggle</button>
    </li>
  );
}


function App() {
  return (
    <div className='App'>
      
      <div className='container'>
        <h1>My Yeti</h1>
      </div>
      <div className='yeti-container'>
        <Yeti />
      </div>
      <footer>
        <div className='footer'>
          <br/><br/>
          Built with{' '}<span role='img' aria-label='love'>
          💙
          </span>{' '} by Evan Lee
        </div>
      </footer>
    </div>
  );
}


//utils
function statusToString(val){
  if(val === 1){
    return "On";
  }else{
    return "Off"
  }
}
function cToF(val){
  var cTemp = val;
  var cToFahr = cTemp * 9 / 5 + 32;
  return cTemp+'\xB0C is ' + cToFahr + ' \xB0F.';
}

function boolToString(val){
  if(val === 1){
    return "True";
  }else{
    return "False"
  }
}

export default App;

