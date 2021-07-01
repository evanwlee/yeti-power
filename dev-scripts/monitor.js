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

function getStatus()
{
	console.log('\nStarting Power Status Check @ ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
	console.log('Doing up to ' +statusRepetitions+' status checks. One every '+statusCheckPause+' second(s).');
	console.log('If required, doing ' +generatorCommandRepetitions+' generator command attempts. One every '+generatorCommandPause+' second(s).');
	console.log('Minimum state of charge percent is ' + chargeLowerThreshold+'%. This indicates when to start generator.');
	console.log('Max state of charge percent is ' + chargeStopPercent +'%. This indicates when to stop generator.');
	console.log('\n\n');
	statusIntervalId = setInterval(robustCheck, (statusCheckPause*1000));
}

function handleStatus(stateData)
{
	console.log('\n'+xy+') Checking Power Status - ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));


	const commandOn = `/usr/bin/python3 ${sendScript} -p 384 6302497`;
	const commandOff = `/usr/bin/python3 ${sendScript} -p 384 6302498`;

	if (typeof stateData !== 'undefined' && stateData.socPercent !== 'undefined')
	{
		console.log('State of Charge = ' + stateData.socPercent + '%');
		console.log('Charging Status = ' + (Boolean(stateData.isCharging) ? "Charging":"Not Charging"));
		console.log('');

		if (stateData.socPercent < chargeLowerThreshold)
		{
			//if charge is below threshold send on command to start Gen, if not already charging
			if (stateData.isCharging === 0)
			{
				console.log('Turn ON with ' + commandOn);
				commandShort = 'ON';
				command = commandOn;
			}
			else
			{
				console.log('Already charging, no need to start Generator.');
			}
		}
		else if (stateData.socPercent >= chargeStopPercent)
		{
			//if charge is above threshold send off command, if charging
			if (stateData.isCharging === 1)
			{
				console.log('Turn OFF with ' + commandOff);
				commandShort = 'OFF';
				command = commandOff;
			}
			else
			{
				console.log('Generator is already stopped.');
			}
		}
		else
		{
			console.log('Charge level within threshold.');
		}

		if (command !== '')
		{
			intervalID = setInterval(doCommand, (generatorCommandPause*1000));
		}
		else
		{
			desiredState = stateData.isCharging;
			console.log(`Nothing More To Do.`);
		}

	}

}

function robustCheck()
{
	if (++xy === ( statusRepetitions + 1) || desiredState !== null)
	{

		console.log('\n');
		if(desiredState === null && xy > 0){
			console.log('Completed the maximum number of status checks ('+statusRepetitions+').');
			console.log(' ** WARNING: It appears that the '+commandShort+' command probably FAILED.');
		}else if(desiredState !== null){
			console.log('Generator is in desired state or completed the maximum number of status checks ('+statusRepetitions+').');
			console.log(' ** SUCCESS: It appears that the '+commandShort+' command probably SUCCEEDED.');
		}
		console.log('Done.');
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
				console.log('Not able to get status from Yeti' + error);
			});
		;
	}
}

function doCommand()
{

	if (++x === (generatorCommandRepetitions +1 ))
	{
		console.log('Maximum number of '+commandShort+' commands attempted ('+generatorCommandRepetitions+')');
		x = 0;
		clearInterval(intervalID);
	}
	else
	{
		console.log(x+' - Running command: ' + command);
		exec(command, (error, stdout, stderr) => {
			if (error)
			{
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr)
			{
				console.log(`Result ${stderr}`);
			}
			//console.log(`stdout: ${stdout}`);
		});
	}
}

getStatus();
