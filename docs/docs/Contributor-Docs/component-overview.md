---
sidebar_position: 2
sidebar_label: "Component Overview"
---

# Overview

This page will give you an overview over the different **Components** that you will start to understand along the process.
Those are the building blocks of the project, understanding each of those is key to build something like the **SynSip!**

## Components - Pressure Sensor

### Gauge Pressure sensor
This is the device that actually reads out the pressure. It operates at 5V and outputs a linear analog signal that indicates 0-200PSI in a voltage range of 0.5-4.5V.

### 3.7V LiPo Battery
This is the powerhorse of the sensor, it provides it with energy and allows recharging

### Charging module
The usb-c charging module manages the power supply for the circuit and manages reloading and provides general protection for the battery.

### Buck Converter
Since the battery provides 3.7V but the pressure sensor operates at 5V we need to step up the voltage in order to power the sensor.

### Microcontroller
This is the brain of the application. It reads the pressure values, calculates it into bar and send it via bluetooth low energy to the data aggregation tool.

### ADC1115
The microcontroller does not provide a pin for analog input, thereofore we need to convert it to digital. This board allows us to do that.

### Logic level converter
Since it is recommended to use the pins of the microcontroller with 3.3 instead of 5V we convert the voltage from 5 to 3.3


