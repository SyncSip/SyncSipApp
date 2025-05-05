---
sidebar_position: 1
sidebar_label: "Installation"
---

# Installation Guide
This Tutorial will help you to load the software onto your physical pressure sensor

## Required Tools & Software

To get started with the Project you only need two things downloaded on your computer.

- [Visual Studio Code](https://code.visualstudio.com/)
- Platform IO (inside of Visual Studio Code)
 
When you have downloaded VS Code you can go to the Extensions tab on the side and download
the Platform IO extension.

![PlatformIO Logo](../assets/platformio-logo.png)

## Cloning the Repository

Open your Terminal and navigate to the place where the Repository should be created.
And run the following command.

1. Clone the repository on GitHub.
```bash
git clone https://github.com/SyncSip/SyncSipPressureSensor.git
```

This will create a project folder called **SyncSipPressureSensor**, 
in this folder you will find the source code and documentation files.

Now take a usb-c cable and plug it into the microcontrollers port and into your computer.

Now you are ready to load the software onto your device! look for the build and upload buttons on the bottom of your screen inside of vsCode.
Click the upload button and wait until its done uploading the code. In order to verify if the upload was successful you can open the serial monitor and check
for pressure readings.


