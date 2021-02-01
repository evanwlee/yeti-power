Application and corresponding services/hardware to monitor Goal Zero Yeti Lithium Battery (https://www.goalzero.com/product-features/portable-power-stations/) 
and trigger remote start generator as needed.
<img src="https://github.com/evanwlee/yeti-power/blob/master/PhysicalComponentDiagram.png"/>

Details:
1) Use Yeti built in API to get state of battery (charge, use, etc).
2) Run script (cron) to monitor charge levels. 
3) When below threshold auto-start generator using 433mhz signal clone.

Primary technologies:
1) nodeJS
2) react
3) bootstrap
4) express 
5) shell script
6) python

Hardware required (see physical component diagram):
1) Raspberry Pi using transmission on <a href="https://amzn.to/2M9saGC">433mhz tx/rx</a> to remotely control remote start generator. 
2) Remote start generator
3) IoT Enable Portable Solar Generator

Prerequisite:<br>
Abillity to decode the RF signal sent by the remote start transmitter. One method is to use Arduino Uno with RF recieve and corresponding library to listen on 433mhz. An example: https://randomnerdtutorials.com/decode-and-send-433-mhz-rf-signals-with-arduino/
