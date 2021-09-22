
const { Client } = require('node-scp')
const http = require('http');
const fs = require('fs');

var logging = true;

const remote_server = {
  host: 'evanwlee.sarse.com', //remote host ip
  port: 22, //port used for scp
  username: 'evanwlee', //username to authenticate
  password: 'Kenm0rE1', //password to authenticate
}

const options = {
  host: 'ipv4bot.whatismyipaddress.com',
  port: 80,
  path: '/'
};

const local_file_path = '/home/ewl_1975/external-ip/ip.html';
const destination_file_path = './html/external-ip/cabin/ip.html';

http.get(options, function(res) {
  console.log("status: " + res.statusCode);

  res.on("data", function(chunk) {
    let data = chunk + "<br>"+new Date().toLocaleString();
    fs.writeFile(local_file_path, data, function (err) {
        if (err) return out(err);
        Client(remote_server).then(client => {
          client.uploadFile(local_file_path, destination_file_path)
                  .then(response => {
                      out("File Sent to server");
                      client.close()
                  })
                  .catch(error => out(error))
          }).catch(e => out(e));
});
  });
}).on('error', function(e) {
  console.log("error: " + e.message);
});




function out(msg){
    if( logging ){
            console.log(msg);
    }
}
