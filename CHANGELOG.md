# ECE 270 Simulator Changelog

## Changes made during Fall 2021 (updated Feb 2022)
- Ace code editor has been updated to commit [6c0e60e5525a6d6ff0e9e929848f7834809a4784](https://github.com/ajaxorg/ace-builds/commit/6c0e60e5525a6d6ff0e9e929848f7834809a4784).
- Integrated notification system for better delivery and tracking of site updates.
- This changelog file!
- Under-the-hood optimizations and code clean-up

## Changes made during Summer 2021 (updated Aug 2021)
- 08/18 - VCD file generation with each simulation
- 08/18 - Support for both source-only (source) and synthesized (mapped) simulations
- 08/18 - Tutorial v1.0.0
- Support for IcarusVerilog simulations
- Some easter eggs!
- Under-the-hood optimizations and code clean-up
- Docker image updated to use current version (should remain updated via Git, do a 'git pull' inside the container to receive updates)

Considering adding some more features, and hopefully will have them added before Fall 2021.

## Changes made during Spring 2021
- Added zip download option to archive code
- Workspace-unique support modules (place in support/ folder and check workspace settings)

## Changes made during Summer/Fall 2020
- Introduced workspaces to better organize files  
- Support for SystemVerilog  
- Changed demo code  
- Under-the-hood optimizations and clean-up

Changes that weren't so well documented before:

v2.0 - The simulator was updated in Fall 2019/Spring 2020 with more changes server-side, such as analytics, better user database management, a switch from HTTP Basic Auth to sessions, file tabs, initial SystemVerilog support, and numerous stability and bug fix patches.  It was moved over to verilog.ecn.purdue.edu, whose specs allowed the simulator server code to scale for burgeoning class sizes.

v1.0 - A version of the simulator targeting the Lattice ice40HX8K FPGA, with a new breakout board, was designed in May 2019 from v0.2.  Minor versions first utilized Python and myHDL, before a complete rewrite of the backend to use CVC (a Verilog simulator) and node.js to serve the page and provide better performance and support for WebSocket connections, used to exchange inputs and outputs in a Verilog simulation between the user's webpage and the server.

v0.1 - Work on this simulator began in January 2019 when I wondered why there wasn't an easy way to write and test Verilog outside of the lab.  A version of the simulator targeting the ispMACH 4256ZE, the CPLD in use by ECE 270 in years past with its own custom breakout board, was finished by May 2019 utilizing Python and myHDL.