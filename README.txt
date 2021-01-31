Simple homebrew single page application and corresponding services to monitor Goal Zero Yeti Lithium Battery (https://www.goalzero.com/product-features/portable-power-stations/) 
and trigger remote start generator.

Primary technologies:
nodeJS
react
bootstrap
express 
shell script
python

Hardware required (see physical component diagram):
Raspberry Pi with 433 MHZ TX/RX
Remote start generator
IoT Enable Portable Solar Generator


Uses transmission on 433mhz to remotely control auto-start generator.


Details:
1) Use Yeti built in API to get state of battery (charge, use, etc).
2) Run script (cron) to monitor charge levels. 
3) When below threshold auto-start generator using 433mhz signal clone.
