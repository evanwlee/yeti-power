const fetch = require('node-fetch');
const { exec } = require("child_process");



//CONFIG
let apiHostIp = "localhost:3001";
let sendScript = '/home/<user>/yeti/dev-scripts/python/send.py';
const chargeLowerThreshold = 80;
let chargeStopPercent = chargeLowerThreshold + (chargeLowerThreshold * 0.12);

if(chargeStopPercent > 100){
	chargeStopPercent = 100;
}

function getStatus() {

	fetch(`http://${apiHostIp}/api/searchIP`)
		.then((response) => response.json())
		.then(
			(data) => {
				return fetch(`http://${data[0].ip}/state`);
			}
			)
		.then(function (response) {
			if (response.ok) {
				return response.json();
			} else {
				return Promise.reject(response);
			}
		}).then((data) => handleStatus( data ));

}


function handleStatus(stateData){
	//console.log(JSON.stringify(stateData));
	console.log('\nChecking Power Status - ' + new Date().toTimeString());
	console.log('Minimum power threshold is ' + chargeLowerThreshold);
	console.log('Stop charge threshold is ' + chargeStopPercent);

	let command = '';
	const commandOn = `/usr/bin/python3 ${sendScript} -p 384 6302497`;
	const commandOff = `/usr/bin/python3 ${sendScript} -p 384 6302498`;

	if(typeof stateData !== 'undefined' && stateData.socPercent !== 'undefined'){
		console.log('Battery Percent = '+stateData.socPercent);
		console.log('Charging State = '+Boolean(stateData.isCharging));
		if(stateData.socPercent < chargeLowerThreshold){
			//if charge is below threshold send on command to start Gen, if not already charging
			if(stateData.isCharging === 0){
				console.log('Turn ON with '+commandOn);
				command = commandOn;
			}else{
				console.log('Already charging, no need to start Generator.');
			}
		}else if(stateData.socPercent >= chargeStopPercent){
			//if charge is above threshold send off command, if charging
			if(stateData.isCharging === 1){
				console.log('Turn OFF with '+commandOff);
				command = commandOff;
			}else{
				console.log('Generator is already stopped.');
			}
		}else{
			console.log('Charge level within threshold.');
		}

		if( command !== ''){
			console.log('Running command: '+command);
			exec(command, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return;
				}
				if (stderr) {
					console.log(`Result ${stderr}`);
				}
				//console.log(`stdout: ${stdout}`);
			});
		}else{
			console.log(`Nothing More To Do.`);
		}

	}

}


getStatus();
