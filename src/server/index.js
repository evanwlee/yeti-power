require('dotenv').config({ path: '.env.local' });

const { exec } = require("child_process");



const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Arpping = require('arpping');
const port = process.env.SERVER_PORT || 3001;

const app = express();

let sendScript = '/home/ewl_1975/yeti/dev-scripts/python/send.py';

var allowedOrigins = ['*'];
app.use(cors({
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      //allow all, on internal network
    //   if(allowedOrigins.indexOf(origin) === -1){
    //     var msg = 'The CORS policy for this site does not ' +
    //               'allow access from the specified Origin.';
    //     return callback(new Error(msg), false);
    //   }
      return callback(null, true);
    }
  }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  let endpoints = ['GET - /api/searchIP','GET - /api/gen/start','GET - /api/gen/stop'];
  res.send(JSON.stringify(endpoints, null, 4));
});

app.get('/api/searchIP', (req, res) => {
    var arpping = new Arpping();
    var macArray = [
        "24:6f:28:83:9d:3c"
    ];
    arpping.searchByMacAddress(macArray)
        .then(({ hosts, missing }) => {
            var h = hosts.length, m = missing.length;
            console.log(`${h} matching host(s) found:\n${JSON.stringify(hosts, null, 4)}`);
            console.log(`The following search term(s) returned no results:\n${missing}`);
            res.send(JSON.stringify(hosts, null, 4));
        })
        .catch(err => console.log(err))
    
})

app.get('/api/gen', (req, res) => {
  let endpoints = ['GET - /api/gen/start','GET - /api/gen/stop'];
  res.send(JSON.stringify(endpoints, null, 4));
});

app.get('/api/gen/start', (req, res) => {
  exec(`/usr/bin/python3 ${sendScript} -p 348 6302497`, (error, stdout, stderr) => {
    if (error) {
        res.send(JSON.stringify({status:'failed'}, null, 4));
        return;
    }
    res.send(JSON.stringify(stderr, null, 4));
});

  
})

app.get('/api/gen/stop', (req, res) => {
  exec(`/usr/bin/python3 ${sendScript} -p 348 6302498`, (error, stdout, stderr) => {
    if (error) {

    res.send(JSON.stringify({status:'failed'}, null, 4));
      return;
    }
    res.send(JSON.stringify(stderr, null, 4));
  });
  
})


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});