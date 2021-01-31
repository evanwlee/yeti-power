Application and corresponding services/hardware to monitor Goal Zero Yeti Lithium Battery (https://www.goalzero.com/product-features/portable-power-stations/) 
and trigger remote start generator as needed.

Details:
1) Use Yeti built in API to get state of battery (charge, use, etc).
2) Run script (cron) to monitor charge levels. 
3) When below threshold auto-start generator using 433mhz signal clone.

Primary technologies:
nodeJS
react
bootstrap
express 
shell script
python

Hardware required (see physical component diagram):
Raspberry Pi using transmission on 433mhz (https://amzn.to/2M9saGC) to remotely control remote start generator. 
Remote start generator
IoT Enable Portable Solar Generator

Prerequisite:
Abillity to decode the RF signal sent by the remote start transmitter. One method is to use Arduino Uno with RF recieve and corresponding library to listen on 433mhz. An example: https://randomnerdtutorials.com/decode-and-send-433-mhz-rf-signals-with-arduino/
