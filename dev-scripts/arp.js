var arp = require('@network-utils/arp-lookup');
const Arpping = require('arpping');
 
// Retrieve the corresponding IP address for a given MAC address
async function doIt(){
        await arp.toIP('<MAC>').then(
            (response) => {console.log(response);}).catch(() => {
                console.error('Error');
            })
        await arp.toMAC('192.168.1.142').then(
            (response) => console.log(response));

        const mac = await arp.toMAC('192.168.1.144');
        const ip = await arp.toIP('<MAC>');
        console.log(mac)
        console.log(ip)

}

function doAlt(){
    
    //var arpping = new Arpping(options);
    var arpping = new Arpping();

    arpping.findMyInfo()
    .then(info => console.log(info)) // ex. {"ip": "192.168.0.20", "mac": "01:23:45:67:89:01", "type": "RaspberryPi"}
    .catch(err => console.log(err));
 
    arpping.discover()
        .then(hosts => console.log(JSON.stringify(hosts, null, 4)))
        .catch(err => console.log(err));


        var macArray = [
            "<MAC>"
        ];
        arpping.searchByMacAddress(macArray)
            .then(({ hosts, missing }) => {
                var h = hosts.length, m = missing.length;
                console.log(`${h} matching host(s) found:\n${JSON.stringify(hosts, null, 4)}`);
                console.log(`The following search term(s) returned no results:\n${missing}`);
            })
            .catch(err => console.log(err));
}

doIt();

doAlt();