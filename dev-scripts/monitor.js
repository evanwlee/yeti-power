const fetch = require('node-fetch');
const {exec} = require("child_process");

//CONFIG
let apiHostIp = "localhost:3001";
let sendScript = '/home/<user>/yeti/dev-scripts/python/send.py';
const chargeLowerThreshold = 95;
let chargeStopPercent = chargeLowerThreshold + (chargeLowerThreshold * 0.12);

if (chargeStopPercent > 100)
{
	chargeStopPercent = 100;
}

//Only run generator in defined time window
let windowStart = '08:00:10';
let windowEnd = '21:30:00';

let x = 0;
let xy = 0;
const generatorCommandRepetitions = 8;//once every second
const generatorCommandPause = 1;//seconds
let intervalID = null;
const statusRepetitions = 6;//once every 20 seconds
const statusCheckPause = 20;//seconds
let statusIntervalId = null;
let desiredState = null;

let command = '';
let commandShort = '';

const logging = true;

function getStatus()
{
	printDetails();
	statusIntervalId = setInterval(robustCheck, (statusCheckPause*1000));
}

function handleStatus(stateData)
{
	out('\n'+xy+') Checking Power Status - ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

	const commandOn = `/usr/bin/python3 ${sendScript} -p 385 6302497`;
	const commandOff = `/usr/bin/python3 ${sendScript} -p 385 6302498`;

	if (typeof stateData !== 'undefined' && stateData.socPercent !== 'undefined')
	{
		out('State of Charge = ' + stateData.socPercent + '%');
		out('Charging Status = ' + (Boolean(stateData.isCharging) ? "Charging":"Not Charging"));
		out('');

		if (stateData.socPercent < chargeLowerThreshold)
		{
			//if charge is below threshold send on command to start Gen, if not already charging
			if (stateData.isCharging === 0)
			{
				if(canRunBasedOnTimeOfDay(windowStart,windowEnd)){
					out('Turn ON with ' + commandOn);
					commandShort = 'ON';
					command = commandOn;
				}else{
					out('Not starting because we are outside of run window.');
				}
			}
			else
			{
				out('Already charging, no need to start Generator.');
			}
		}
		else if (stateData.socPercent >= chargeStopPercent)
		{
			//if charge is above threshold send off command, if charging
			if (stateData.isCharging === 1)
			{
				out('Turn OFF with ' + commandOff);
				commandShort = 'OFF';
				command = commandOff;
			}
			else
			{
				out('Generator is already stopped.');
			}
		}
		else
		{
			out('Charge level within threshold.');
		}

		if (command !== '')
		{
			intervalID = setInterval(doCommand, (generatorCommandPause*1000));
		}
		else
		{
			desiredState = stateData.isCharging;
			out(`Nothing More To Do.`);
		}
	}
}

function robustCheck()
{
	if (++xy === ( statusRepetitions + 1) || desiredState !== null)
	{
		out('\n');
		if(desiredState === null && xy > 0){
			out('Completed the maximum number of status checks ('+statusRepetitions+').');
			out(' ** WARNING: It appears that the '+commandShort+' command probably FAILED.');
		}else if(desiredState !== null){
			out('Generator is in desired state or completed the maximum number of status checks ('+statusRepetitions+').');
			if( commandShort !== '' ){
				out(' ** SUCCESS: It appears that the '+commandShort+' command probably SUCCEEDED.');
			}
		}
		out('Done.');
		xy = 0;
		clearInterval(statusIntervalId);
	}
	else
	{
		fetch(`http://${apiHostIp}/api/searchIP`)
			.then((response) => response.json())
			.then(
				(data) => {
					return fetch(`http://${data[0].ip}/state`);
				}
			)
			.then(function (response) {
				if (response.ok)
				{
					return response.json();
				}
				else
				{
					return Promise.reject(response);
				}
			})
			.then((data) => handleStatus(data))
			.catch(error => {
				out('Not able to get status from Yeti' + error);
			});
		;
	}
}

function doCommand()
{
	if (++x === (generatorCommandRepetitions +1 ))
	{
		out('Maximum number of '+commandShort+' commands attempted ('+generatorCommandRepetitions+')');
		x = 0;
		clearInterval(intervalID);
	}
	else
	{
		out(x+' - Running command: ' + command);
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

function canRunBasedOnTimeOfDay(startTime,endTime){

	let currentDate = new Date()

	let startDate = new Date(currentDate.getTime());
	startDate.setHours(startTime.split(":")[0]);
	startDate.setMinutes(startTime.split(":")[1]);
	startDate.setSeconds(startTime.split(":")[2]);

	let endDate = new Date(currentDate.getTime());
	endDate.setHours(endTime.split(":")[0]);
	endDate.setMinutes(endTime.split(":")[1]);
	endDate.setSeconds(endTime.split(":")[2]);


	return startDate < currentDate && endDate > currentDate
}

function printDetails(){
	if( logging ) {
		out('\nStarting Power Status Check @ ' + new Date().toLocaleString('en-US', {timeZone: 'America/Los_Angeles'}));
		out('Doing up to ' + statusRepetitions + ' status checks. One every ' + statusCheckPause + ' second(s).');
		out('If required, doing ' + generatorCommandRepetitions + ' generator command attempts. One every ' + generatorCommandPause + ' second(s).');
		out('Minimum state of charge percent is ' + chargeLowerThreshold + '%. This indicates when to start generator.');
		out('Max state of charge percent is ' + chargeStopPercent + '%. This indicates when to stop generator.');
		out('Run window is ' + windowStart + ' to ' + windowEnd + '.');
		out('\n\n');
	}
}

function out(msg){
	if( logging ){
		console.log(msg);
	}
}

getStatus();
