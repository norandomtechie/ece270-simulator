# Installing the simulator on your own computer
- Yes, this is a thing!  Without open-source software and community, this project could never have existed, and so it's important to make our work open.
- If you're in a area with spotty/high-latency Internet, and you don't want to end up not being able to reliably simulate your Verilog design because the Internet is down or extremely slow, we offer options to get the simulation software on to your own computer so you can simulate without worrying about input lag or being unable to simulate on the course simulator.
- We'll include an update mechanism, but it is your responsibility to update the simulator when you receive a notification.  If we issue an update, it's incredibly important, since it can affect the results of your simulations.
### Windows
- If you have WSL, the easiest thing to do is make sure you're on WSL 2 with `wsl -l -v` in PowerShell, download the simulator repository from [here](https://github.com/norandomtechie/ece270-simulator) in WSL, `cd` inside the folder and run `setup/setup.sh` to install dependencies and simulator code.
- As of Fall 2021, we'll be using GTKwave to view design traces.  The Windows version is available [here](https://sourceforge.net/projects/gtkwave/files/latest/download).
### macOS
- macOS users are going to find things tricky.  As far as we can tell, the easiest way to get the simulator on to your system is to install Docker, and download and run our container with the simulator code.
- If you use something like VMware/Parallels to run a Linux distro like Ubuntu, you can follow the Linux instructions below, and make sure that you configure the VM to open port 4500 so that you can access the local simulator inside the VM, on your Mac's browser.  
- Ask the head TA if you'd still like to install it and need help doing it.  
### Linux
- Any Linux distro is capable of running the code, as long as you're on a popular distribution on which you can install the necessary tools.  
- In general, you should only need to clone the Git repository anywhere in your home folder, cd inside and run `setup/setup.sh`, which should handle all dependencies and starting the simulator server app in the background.