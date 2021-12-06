
const fetch = require('node-fetch');
const {exec} = require("child_process");
const { Client } = require('node-scp')
const http = require('http');
const fs = require('fs');

const remote_server = {
  host: 'evanwlee.sarse.com', //remote host ip
  port: 22, //port used for scp
  username: 'evanwlee', //username to authenticate
  password: 'Kenm0rE1', //password to authenticate
}


let url = "http://evanwlee.sarse.com/cabin/command.json";
let sendScript = '/home/ewl_1975/yeti/dev-scripts/python/send.py';
const commandOn = `/usr/bin/python3 ${sendScript} -p 385 6302497`;
const commandOff = `/usr/bin/python3 ${sendScript} -p 385 6302498`;

//how many times to run the command
let generatorCommandRepetitions = 20;
let intervalID = null;
let generatorCommandPause = 1;

let settings = { method: "Get" };

let logging = true;
let runCount = 0;

let commandShort = 'none';

fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        // do something with JSON
        out('Incoming command = '+json.command);
        commandShort = json.command;

        if( commandShort == 'on' || commandShort == 'off'){
            intervalID = setInterval(doCommand, (generatorCommandPause*1000));
            clearCommand(commandShort);
        }else{
            out('Nothing to do');
        }


    });

function doCommand()
{
    let command = '';
    if(commandShort == 'on'){
        command = commandOn;
    }else if(commandShort == 'off'){
        command = commandOff;
    }else{
        out('Unknown command: ' + commandShort);
        clearInterval(intervalID);
        return;
    }


    if (++runCount === (generatorCommandRepetitions +1 ))
    {
            out('Maximum number of '+commandShort+' commands attempted ('+generatorCommandRepetitions+')');
            runCount = 0;
            clearInterval(intervalID);
    }
    else
    {
            out(runCount+' - Running command: ' + command);
            exec(command, (error, stdout, stderr) => {
                    if (error)
                    {
                            out(`error: ${error.message}`);
                            return;
                    }
                    if (stderr)
                    {
                            out(`Result ${stderr}`);
                    }
            });
    }
}

function clearCommand(currentCommand){

    let updateCommand = 'none';
    var local_file_path = '/home/ewl_1975/yeti/dev-scripts/command.json';
    var destination_file_path = './html/cabin/command.json';

    let output = '{"command":"'+updateCommand+'","last-run-time":"'+new Date().toLocaleString()+'","last-command":"'+currentCommand+'"}';
    fs.writeFile(local_file_path, output, function (err) {
              if (err) return out(err);
              out("Sending updated file to server");
              Client(remote_server).then(client => {
                out("Scp connected");
                client.uploadFile(local_file_path, destination_file_path)
                        .then(response => {
                            out("File Sent to server");
                            client.close()
                        })
                        .catch(error => out(error))
                }).catch(e => out(e));
    });



}

function out(msg){
    if( logging ){
            console.log(msg);
    }
}
