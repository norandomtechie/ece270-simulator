# Changelog
### Keep in mind that not all features indicated here are relevant.  Future updates may have removed such features and they may not have been logged.  
### 7/24/2020
- Let's talk DDOSing.  In 2020, we saw a 542% increase in the number of DDOS attacks worldwide due to the pandemic.  The importance of implementing protections is therefore at an all-time high, and since we don't have the resources to build a huge worldwide CDN network to absorb DDOS attacks, we're going to go with simple rate-limiting.  
- Primarily, we don't want attacks to slow down the server for everyone, so from today onwards, all requests to the server are rate-limited - you can't access most public resources more than 200 times per hour (like just visiting the login page), protected resources more than 100 times per hour (if you're logged in and visiting the page) while simulations will remain unlimited since there is evidence that students will simulate well over 200 times per hour in peak periods, so there's no getting around that.  It won't completely stop an attack, but it will definitely slow one down.  
- I've also created, developed, debugged (the last two with Rick's help, obviously) and deployed a KarnaughMap.js library - much like WaveDraw, it's an embeddable module that will be used on the review page for students to draw out k-map circles, set k-map values and prime implicant types (essential/non-essential), and have all that data saveable/loadable so students can submit/review at will.  The demo is public, so you can try it out [here](https://verilog.ecn.purdue.edu/mindpalace/karnaughmap/index2.html)!  
### 7/4/2020
- Happy (I guess) 4th of July!  
- To help with Rick's needs, writing HDLwave ended up spawning a child project called WaveDraw, which is an embeddable module that one can use to generate waveforms from given data, like the names of signals, bitstreams for those signals in which each bit corresponds to a time unit (eg. 1010101101) and support for displaying metastable/unknown (X) and disconnected/hi-Z (Z) values.  Rick plans to use this to give a much better interface on the review page for students to draw out waveforms, instead of the confusing "enter transitions here" stuff that he was forced to use due to a lack of a better tool.  
- With this kind of embed, not only do we have a way for students to literally just 'draw' waveforms instead of typing them out, or a waveform viewer for HDLwave to render the JSON data when it comes back from testbench simulation on the server, but also we now have a universal module utilizing only handwritten JavaScript and jQuery for drawing out timing diagram waveforms.  In my research to find a similar tool, the closest one that has come close to this is WaveDrom, but it's very fixed in its operation - it will only render given data once, and has no capability of editing the waveform once it's been rendered, so I'm convinced of the uniqueness of this kind of module.  
- In tandem with the simulator, we now have a means of design simulation as well as design verification - a crucial component of hardware design that we could not possibly just leave to ECE 337.  In my possibly uninformed opinion, learning Verilog is pointless if you aren't learning the rigorous methods of verification that will help you write better Verilog.  While 270 probably won't go so far as to have students writing rigorous testbenches for testing, the need to have a waveform viewer for visual learning is definitely important enough for students to be able to appreciate being able to fully verify their designs.  
- Finally got around to working on a live-session code editor on my own system.  While the tools needed to allow two people to work in the same session on the simulator would work on the server, the client-side configuration is really messing up.  The good news is that it connects to the live-session-serving tools just fine - the bad news is that not all information about each of the users is going through those tools.  When I try opening the same live session in another tab to pretend to be another user, the cursor for the other one shows up, but it doesn't move when I click around or try to select things.  It does detect that there is some activity going on, but there is nothing else showing up on the editor regarding the other user.  This is going to take a while to patch too - the tools are highly integrated, and it's difficult to pinpoint the part of the code where the user activity is supposed to be sent.  
### 6/15/2020
- Summer has officially started, and I've finished v0.2 of HDLwave.  I'm not sure if you watch Bollywood movies, but one thing they're all infamous for is having an interval in the middle.  The movie stops at a cliffhanger, you get up, stretch your legs, get some more popcorn, nachos or a Coke, and you come back and wait for it to start again.  For me, I've reached a good point (...an interval...) in HDLwave where I can stop and start looking at some other projects to take a run at.  
- One of the most exciting things that I talked with Rick about that I'd like to try is creating an automated grader.  My past experience with writing autograder scripts has me now knowing Rick's review system inside out, as well as a keen sense of the POST requests made by his assignment pages whenever a TA clicks "Save scoring".  The reason I'm so excited about this now is because of a little annoying policy called CORS (cross-origin resource sharing) and the fact that Rick's review page is protected by Purdue-set authentication methods, which prevented me from setting up a website to scrape assignments from the review page, grade them on verilog.ecn, and send the scores back to the review page as a POST request.  I couldn't do this before because 1) Rick couldn't embed the simulator without modifying the CORS policy, which could possibly expose student assignments to the outside web and 2) even if we completely ignored that security hole, I would still need a way to authenticate myself using Purdue credentials - either my own, or the person accessing the autograder site I mentioned - and that would completely bypass Purdue's own security regulations protecting university credentials against being stolen by student-written software, making it a terrible idea.  
- What's changed is that I learned about a new method of cross-site communication - window.postMessage.  
    - The way it works is by setting up JS listeners on both websites, in this case, engineering.purdue.edu/ece270/review and verilog.ecn.purdue.edu.  
    - When you open up the review page, there should be a button called "Simulate" (to try out the code immediately in the simulator) and/or "Verify" (to run the code with a testbench that will perform functional verification and if possible, timing checks, produce a score, and send it back to the review page).
    - Let's discuss the latter.  When you click Verify, that should open a new page with the autograder page (a popup of verilog.ecn.purdue.edu/autograde, if you will, and assuming the browser hasn't blocked popups from engineering.purdue.edu) and queue a message with the assignment details (no names, and the details are used to set which testbench is to be used) and the code to be tested.  
    - By the time the autograder loads, its own postMessage listener will receive the message with the code, and perform the grading work.  Once it receives a score from the server which does the simulation work, it gets sent back to the original window with engineering.purdue.edu, which will then understand that this is the score, set it for the student, and programmatically save scores.  
### 6/4/2020
- Took a few more days off due to more personal issues.  Finally got to integrating Verilator into the simulator - and it was a one day job!  I'll have to experiment a lot more to see what kinds of errors won't show up on the webpage.
- While migrating the simulator to my personal website, I realized that the code is now simple enough to deploy on with a Bash script on WSL on Windows.  I'm going to let macOS users experiment (sorry), and for Linux users it should be old hat to run a script to install dependencies and set up the server.  Since both HTTP/S and WSS run on the same port, there are three ways of running the simulator:
    - Remote webpage, local WS server - best for low-latency, worst for updates.  You would load the page from verilog.ecn but configure it to run the simulation on your own computer, eliminating the latency between your machine and the verilog server, preventing possible connection breaks and reducing the load on the main simulator.  However, it would be on you to run 'git pull' every now and then to keep up to date with simulator updates.  Rick doesn't like this idea because it means having to issue a "press release" every time there's an update, instead of silently pushing it out on the main server with minimal disruption.  
    - Remote webpage, remote WS server - Worse latency, best for updates.  This is the default - you would load the web page and simulations would stil take place on verilog.ecn.  Adds to the load there, and connections could break if you're extremely far away, like out of the country, but you wouldn't have to worry about updating anything.
    - Local webpage, local WS server - Generally not a good idea for this class, but it's a good idea for exporting the simulator to other universities.  
### 5/31/2020
- After a week and two days, one sprained ankle, and a whole mess of debugging, I've finally put out a beta of HDLwave!  It's accessible with the appropriate credentials at https://verilog.ecn.purdue.edu/hdlwave, or the public version at https://hdlwave.nirajmmenon.com - YES I HAVE OTHER SUBDOMAINS ON MY PERSONAL SITE NOW!
- HDLwave takes Verilog code, simulates it with a back-end testbench with Verilator to produce a VCD file, then parses that VCD file to show a "waveform" on the page.  Right now, it looks pretty crappy, but it is functionally correct and does show waves by time unit, with a breakdown of the buses in the design by every bit.  You can even zoom in/out with Ctrl+Shift+scroll while in the waveform editor.
- Setting up hdlwave within the simulator base code has made me realize that importing new extensions is extremely complicated - I have to keep calling the session authentication methods before serving protected content.  I've now rewritten server.js so that before accessing any protected routes (like the main page, or /hdlwave), the request has already been authenticated first.  The optimization has really reduced the size of the code in that file, so I'm glad I noticed this now.
- I think I want to make the /portal page an actual portal - you can select if you want to visit the hdlwave page, or the main simulator!  I have some ideas on how to make that look really slick, so I think I'll maybe figure that out in a bit after writing this.
### 5/22/2020
- Taking a bit of a break today.
- Set up the toolchain for Verilator-Yosys-Icarus.  Took a look again at the Icarus VPI spec and examples and I couldn't understand anything or even stop cringing at how convoluted it is.  It'll probably be a while before I can make sense of it.  I really wish Verilator would support delay modeling so I don't have to though.
- Okay, something happened around 5 PM and I'm getting a "Broken Pipe" error when I try to SSH into verilog.ecn.  Probably a sign to chill out.  Trying again tomorrow.
### 5/21/2020
- Pushed all these changes to GitHub.
- Whoa!!!  Switching dark mode suddenly causes the page to badly stutter as it gets recolored.  That's not good.  Doesn't seem to be an issue with the new blur, so how's this happening?
- Realized that the theme option for the editor actually gets overridden if you switch to dark mode (or back).  Decided to add seperate options to store the themes set while in light and in dark mode.
    - Yeah... lots of cosmetics.  I would like to start over, but I don't really want to take away Rick's/the TAs' familiarity with the page.
- The performance is really badly starting to slow as I write the student profile viewer, so I decided to wade into the muck of JS.  I'm realizing that I'm maybe far too dependent on jQuery.  One should not use jQuery methods in functions that get called almost every millisecond, like the resize tab on the editor's right side.  That creates an unnecessarily long call stack, so instead, use the DOM manipulation methods directly (no $(...), document.querySelector would be a better option). 
- Finally changed the "close everything" behavior of the Escape key.  It usually causes more harm than good (as we saw with the autocomplete issue).  It now checks if any of the panels are open before closing them.
- Naturally, the performance hit is only an issue with Firefox.  Chrome works just fine but only after opening a panel which will stutter, but after that, graphics run just fine.
- On the user profile panel, I turned the error data into a graph that shows how many errors were made by day, just because that data is easily presentable, along with counts of visits, demoes and simulations.  A link to the actual JSON file is also present.
### 5/20/2020  
- The tabs now contain a open/close state!  Tabs will no longer all reopen when the page is refreshed.  
- Just went for a stroll through the latest Yosys commits andddddd... typedef enum vars no longer need parentheses for definitions!  
    - What works right now is the following (not on the simulator at the moment - just Yosys itself):  
```  
typedef enum logic [1:0] {INIT, READ, WRITE, HALT} randomstate_t;  
randomstate_t state_x, state_y;

always @(posedge clk, posedge reset) begin
    if (reset) begin
        state_x = INIT;
    else if (pb[1])
        state_x = READ;
    else if (pb[2])
        state_x = WRITE;
    else
        state_x = HALT;        
    end
end
```  
- What about using a Verilator -> Yosys -> IcarusVerilog flow?  Three tools is probably frustrating, but probably better than the outdated nonsense that is CVC.  I could probably just use a Makefile to handle the multiple tools.  
    - This will require some work getting Icarus to communicate with node.js using the VPI interface instead of DPI, but if done right, it could mean we have the power of a SV-specification-complete syntax checker, as well as a simulator that can handle timing delays.
    - The simulator processing would therefore change to the following three-state flow - SystemVerilog syntax checking, upon successful verification of which will result in the subsequent conversion of the SV code to structural Verilog utilizing cells with embedded delays, which will be simulated while exchanging I/O with the user.
- Resized tabs so they look a little more lean and provide more space for other tabs.  
- Added a personalized message on the top.  Every single person should be able to access the data being stored about themselves, so this will be a profile viewer to satisfy that requirement.  This replaces the "Current user: your_username" tag that was in Settings.
    - Required addition of /profile route to server.js.  This sends back the JSON for the username provided in the request, only IF the request was correctly authenticated and authorized using the relevant session ID, and also by filtering out the password hash and session IDs for very obvious security reasons.
    - Cleaned up the entire top header in the process.  You know when you stay in a dorm room for a year, and you have that one drawer that you keep dumping non-essential stuff into, and it keeps filling up until finally you open it to clean it up at the end of the year and you find that it's filled with the most unnecessary junk ever that you will never need?  The HTML for this page is my drawer.  I haven't cleaned it for a year, and I'm finding very icky code that makes me cringe as I read through it.  Does that mean I've grown as a person?  I guess so.
    - I'm not really sure what the rationale is for "eceFPGA", but I guess it's a bit of wishful thinking (let's get ECE 437 onboard, boys and girls!) and the fact that it looks a bit cool in that font.  I think I'll keep it that way.  437 does use an FPGA + SoC system...  
- Realized during clean up that I need to add some support for the newly discovered Ace options menu.  I added the site-wide theming to it, and I realized so, sooooo late that you can actually get all the Ace in-built editor options with a single command - editor.getOptions().  Calling this gives you a JSON object with all the options, allowing me to simply save all the options at once to localstorage, then restore the options upon reopening the page.  I don't know why I never found this when students were actually using it.  Go figure.  
- Added 'title' tags to each of the top icons.  Hovering over them will now show their purpose for the simulator.  
- I have been thinking about how the tutorial system would look.  That would require a step-by-step explanation, which necessitates disabling inputs and controls as per the current step of the tutorial, which will require some reclassification on my part to immediately disable all such elements instantly, then turn on the active control for the user to try out as part of the tutorial.
### 5/19/2020
- UART enabled by default.  Auto-switch-to-terminal feature left as a switch in UART panel.
- Tool output viewer added.  Shows CVC precheck and Yosys output when simulation starts.
- Terminal view now changes color with theme
- node processes on ee65 + 69 keep quitting due to cluster reboot, need some kind of persistence to keep them running, so possible fix was added using Ansible  
    - Set up a crontab for every minute  
        - Check for running node(s).  If none exist,  
        - Run bash script to set up node and sockets again
    - However, it doesn't work.  Maybe check with Rick when he comes back online.
    - Reboot test not yet performed with cluster due to no root privileges, so will wait for cluster to reboot
- Improved resizing issues with terminal and output view (makes use of body onresize property)
- Added blur effect to body behind panel views, kind of like Apple's iCloud login!
    - The trick for an animated blur (albeit a very inefficient one) is to use a combination of Promises, setTimeout and filter: blur(Xpx).  
    - When loading a panel, wait 1ms, then increase blur by 0.2px.  Repeat until blur reaches 2px.  
    - When closing a panel, wait 1ms, then decrease blur by 0.2px.  Repeat until blur reaches 0px.  
    - The code is synchronous, causing the panel to open/close after the blur animation completes, which might mean that people who generally notice minor details will also notice that there's a delay while opening the Settings/Open panels (like I do considering I wrote the whole thing from scratch - and yeah I know that's a bit narcissistic to mention in a public write-up like this).  
    - Still finicky.  Will work on this towards the end in August if someone points it out or if it still looks terrible by then.  
- Some ideas I'm having...  
    - Creating a /download route that will be used as the instruction page for setting up the simulator backend on your own.  
        - Might be difficult to set this up because I also need to test for Mac.  Just... get Windows or Linux.  Please.  
            - Hmm... but if we switch to a Verilator + Yosys + Icarusverilog flow instead like I found out the next day, 
        - Settings panel now has a switch that allows for configuring the simulator to use the local software instead of the server-side one, as well as a choice of port.
### 5/12/2020
IT'S DEVELOPMENT TIME!!!  Warning:  Niraj is going to treat this as his personal diary wrt to the simulator in addition to writing the changelog.  He will type some things that will probably alarm you, so just ignore them!
### 2/3/2020  
- Login page set up to allow easier sign-ups, password resets, moving from Basic HTTP Auth.  
- There is now a Log Out button for easier profile handling.
- Editor now features tabs!  
- To add a new tab, click the + button.  
- To remove a tab, click the corresponding button, but you cannot close all the tabs. One must be open at all times.  
- To open a tab, simply click on it. Hold down Ctrl while hovering over the tab label if you want to change the name.  
- Keyboard shortcuts are also available. While your cursor is active inside the editor:  
    - Ctrl+Alt+W will close the current tab.  
    - Ctrl+Shift+T will add a tab.  
    - Ctrl+\` will scroll to the next tab. The ` key is the one right above Tab on your keyboard.  
- Currently, only the code visible on the screen in one tab will be simulated at once. We may add module support by tabs at a later date.  
- SystemVerilog (sort of) works. You won't be able to use things like `typedef enum`, but you can use logic instead of regs, reformat the module declaration header, or `always_ff, always_latch, always_comb` etc.  
- Code will be saved ONLY to your browser. It does not leave your computer, so please do not ask for partial credit if you finished your assignment on the simulator but didn't turn it in.  
### 10/13/2019  
- You can now reset your password at https://verilog.ecn.purdue.edu/reset. This will give you a temporary password that will allow you to login, and then change your password once you've logged in. Sorry for the delay - we were having internal issues that did not allow us to set this up earlier.  
- For those of you familiar with Regex, the Ace code editor now has a Find box with Regex support. Regex (or regular expressions) is a powerful language that allows users to capture multiple words with the same pattern.  
- Some of you noticed that holding more than one key does not hold down the corresponding button, and that was why we had set up the Shift key to allow holding down more than one key. You can now hold down up to four buttons at once by holding down their respective keys.  
- Color fades with status change now as opposed to simply switching colors in the status bar (as well as the description section of About/Functionality/Usage/Credits/Privacy/Source). I learnt some fancy CSS animation today, and I thought I'd utilize it!  
### 10/1/2019  
- Added a visibility toggler for the password change box.  
### 9/30/2019  
- Trying to pulse buttons on the simulator may kill your simulations. This is because the software is intended to handle humans calmly pressing buttons to send inputs to the server, and not pretend machines attempting to break keyboards. In no lab will you ever have to rapidly hit the buttons.  
### 6/6/2019
- Working PWM module now part of demo. Made some more bug fixes and performed timing analysis.
- Also made primary clock run at ~1000 Hz with a clock divider to get it down to 6 Hz
  for the non-PWM outputs.
- CPU usage is slightly higher due to PWM simulation.
### 5/19/2019
- Finalized at git commit `f6ccf041204e1f422f392162f9510fb50b30376a`
- A fully-featured stable version of the simulator was finally finished.  Intended as a proof-of-concept, the simulator models Verilog designs on the ispMACH 4256ZE Development board with the breakout board.  In addition to the main capability of simulating Verilog in a way that allows users to toggle inputs via virtual pushbuttons and switches and view outputs on the virtual LEDs, the simulator can also handle multiple simulations for multiple users from any browser, and can model a clock running at 6.25 Hz.  
### 3/23/2019
- Added a demo mode to show users what a working design on the ispMACH board would look like.
### 3/5/2019
- We're still at the drawback issue. Purdue's ECN department has given us permissions to set up the site for testing, but the basic WebSocket capability cannot be added to Apache. (Why, IT Support, why!?) That makes the site useless because we intended to use a secure WebSocket connection to exchange the inputs and outputs.
- Rick then noted that we may have to move to our own infrastructure. That's actually something I'd appreciate more, seeing as there's more flexibility with using our own infrastructure. He suggested the use of file descriptors as a way to exchange data. I'm not exactly clear on how this works internally, but I believe it's creating a socket that can be shared across an SSH connection between the local server (serving the main page) and a high-performance machine that will handle all simulations. The socket will serve as a shared space where inputs are sent from the server to the simulation machine via SSH, and the outputs are sent from the simulation machine back to the local server, again via SSH.
- There is a feature in OpenSSH that allows this - socket forwarding. I'm going to try beta testing this on my own machine before Rick finds the time and gets the infrastructure in place. I really appreciate all that he's doing, but I feel like I need to get this done on my own if I want to have some understanding of how this works.
### 2/14/2019
- Things have been moving extremely quickly these last two weeks, and I finally managed to connect the simulation script to the website! <span style="font-weight:bold">I have a working implementation of the simulator!<span>
- Here's a basic rundown of how it works:
    - A user opens the following web page:  
    ![secondfpga.PNG](md/secondfpga.PNG)
    - They type their code - or load a template from the bottom - and click Simulate.
    - The JavaScript function tied to the button sets up a WebSocket client connected to a Python WebSocket server implementation running at the same address at a different port.
    - It then grabs all the inputs from the page (the values of the buttons and switches along with the Verilog code) and sends them as text through the WebSocket to the Python script.
    - The Python script then puts it through compilation and synthesis (iverilog) and if the process is successful, it sends back data through the WebSocket that compilation was successful and the simulation will start.
    - The script then sets up a Process object (from the multiprocessing package) from a function that sets up the myHDL simulation, which in turn starts the vvp simulator. 
    - myHDL uses an object file that implements a VPI (Verilog Procedural Interface) connecting vvp back to the myHDL library. This allows the script to exchange inputs and outputs (I/O) between the simulation and the script. The simulation then starts, and the initial inputs from the web page are passed into the simulator.
    - The simulator runs infinitely, so we immediately get the outputs back, which are then sent back to the web page through the WebSocket.
    - The button's JavaScript, upon receiving the outputs as JSON, will parse them and set the corresponding properties on the SVG for the user to watch.
    - A stream is thus set up, exchanging the inputs from the web page for the outputs from the simulator. That ensures any input changes made by the user will be reflected immediately in the simulator, along with the output changes they may cause. Currently the connection has low enough latency that we can exchange data every 10 milliseconds.
    - There are also a bunch of other functions, like Reset, (stopping the simulation at the back end) and just random artifacts at the top to fill up the space and provide some aesthetic, filling the console output text box with data.
- Right now there is one critical drawback, which is the simulator not being able to support more than one user. I realized this far too late since I had set up the script assuming it would automatically be able to handle the Process object generation by itself. It definitely doesn't.
### 2/1/2019
- <span style="font-weight:bold">EUREKA! I can change inputs using Python!</span>
- It's been a while since i wrote in this, but cocotb was horrible for use as a VPI software. I switched to myHDL, which had some excellent documentation. As of now, I managed to get working a simulation of the ispMACH board whose inputs are connected to a Python program utilizing myHDL to continuously change inputs. When I assigned BOTRED to DIP (a row of LEDs to a row of switches) and cycled through the possible values as inputs to the DIP from Python to Verilog, the BOTRED reflected the expected results! This has been a major breakthrough!
- I have now set up the Flask server to check for inputs and pass them to the Verilog simulator and I can retrieve the outputs from it as well. The only issue now is how to send these inputs to the page. The way serving pages works is that once it is served, the server itself cannot modify the page. Therefore we need to establish a link between Flask and the page (perhaps using JSON) to allow an exchange of inputs and outputs between the two.
### 1/31/2019
- Progress! I finally talked to Rick again about what was missing, and I realized he'd mentioned a way to link C object files into Verilog that had completely gone over my head the first time he'd explained it. Verilog Procedural Interface is a way for C to talk with Verilog, in ways that include creating Verilog system tasks in C using vpi header files for instantiation and Verilog registration. It then sort of clicked - make an object file that continually read input lines from the web simulator, and then push them into the test-bench lines via VPI instantiation in the Verilog module. 
- To be honest, this seems like the long way around to performing a task. I wondered why not connect directly with Python? And so I head out on to that path. On the Wikipedia link that Rick sent for VPI, there was a mention of cocotb, a library for connecting Python with Verilog! Hallelujah! 
- I start from cocotb's Quickstart page to try it out. My Python was 64 bit, so I followed the instructions accordingly. And of course - it doesn't work. Some flag went unrecognized and I wasn't able to debug it, so I quit it for now. I'm going to go with the Python | C | Verilog route, as hard as it sounds, but we have to start somewhere.
### 1/29/2019
- I found that vvp is a bit hard to configure for passing inputs and specifying run-time, so a little more 337 plays into this. I wrote a test bench with a module and I'm going to try to see what happens when I pass inputs through from the test bench. At first I hope the simulation timing works perfectly.
- It works just fine! I found that one can generate a .VCD log from vvp, the simulation software that executes the program compiled by iverilog. The format is something like this:
```
    $date
     Tue Jan 29 12:41:20 2019
    $end
    $version
     Icarus Verilog
    $end
    $timescale
     1s
    $end
    $scope module tb_abc $end
    $var wire 1 ! tb_c $end
    $var reg 1 " tb_a $end
    $var reg 1 # tb_b $end
    $scope module a_b_c $end
    $var wire 1 " a $end
    $var wire 1 # b $end
    $var wire 1 ! c $end
    $upscope $end
    $upscope $end
    $enddefinitions $end
    #0
    $dumpvars
    0#
    0"
    0!
    $end
    #5
    1!
    1#
    #10
    0#
    1"
    #15
    0!
    1#
    #20
```
- …which was generated from the following code:
```
    module abc (a, b, c);
    input wire a, b;
    output wire c;
    assign c = a ^ b;
    endmodule
    module tb_abc ();
    reg tb_a;
    reg tb_b;
    wire tb_c;
    abc a_b_c (.a (tb_a), .b (tb_b), .c (tb_c));
    initial begin
        $dumpfile ("abc.vcd");
        $dumpvars(0, tb_abc);
        tb_a = 0;
        tb_b = 0;
    #5
        tb_a = 0;
        tb_b = 1;
    #5
        tb_a = 1;
        tb_b = 0;
    #5
        tb_a = 1;
        tb_b = 1;
    #5
        $finish;
    end
    endmodule
```
- Pretty straightforward XOR implementation, and you can clearly see that each wire/reg has a symbol attached to it. Figure out the pattern of the symbols and we should understand how to map the simulation to the board.
- The only problem I see with this now is we can't change inputs when the board is in simulation. That's another whole hurdle to cross. For now I think I'll start mapping the generated log to the simulator.
- Yet another hurdle is modifying the SVG to ID every single part of the circuit, so I'm going to leave that to Shreya. Right now I'm more concerned with finding out why modifying input signals is so hard.
### 1/28/2019
- I've gotten a basic front-end up with the help of my best friend, Shreya Ilango. She's incredibly good at HTML/CSS/web development, and she helped me with setting up an SVG graphic for the development board. Right now, it's like this:  
![firstfpga.PNG](md/firstfpga.PNG)  
- Parts include:
    - The left text box is for entering your Verilog code.
    - The right text box is a read-only box that will contain console output.
    - The picture is the SVG graphic mentioned earlier - we don't have buttons and stuff working right now, but I  expect - Shreya will create some logical code that I can work with to simulate some Verilog.
- I downloaded the source code for Icarus Verilog, and it wasn't too much of an effort to build. A simple `autoconf`, `./configure`, and `sudo make install` was enough to do the job.
- So I got down the top module to compile it, and naturally, I run into a syntax error (why is nothing ever simple for once?) Turns out the oscillator instantiation wouldn't work because I never had the oscillator code.
- Thankfully, I'm taking ECE 337, which goes really in-depth into SystemVerilog which would've been really helpful to have during ECE 270. I can probably set up a simple always block in another module and create a delay that flips the clock signal every 1/6th second or something.
- I try this out, but there's a small issue with the line defparam I1.TIMER_DIV = 1048576 . Mind you, I'm not that familiar with Verilog, but I do remember from ECE 337 that one can use parameters in the traditional sense as passing a variable to a function in C. That meant I had to change the extension of oscillator.v to oscillator.sv, since it doesn't look like Verilog supports parameters. So I go ahead and do that, and voilà! 
```
    $ iverilog oscillator.sv ispmach_top.sv -o ispmach
    $ # No errors! YES!
```
- With glee, I type in `vvp ispmach` to see what happens. Nothing… and then my laptop's fans are suddenly spinning at full speed! 10 minutes pass and no window has popped up yet, and I'm getting concerned. I haven't put any code into the top module, so what's taking so long?! 
- Finally, I hit Ctrl+C, and then that's when I see:
```
    ** VVP Stop(0) **
    ** Flushing output streams.
    ** Current simulation time is 2017361050 ticks.
    > 
```
- It was working this entire time!
- I do some research, and I find (from the iVerilog Wikia for simulation) that, similar to my ECE 337 simulation software, the simulator was working directly with no intervention from the user. I realized this was problematic because when the simulation is running, I can't find a way to change the inputs asynchronously. This will take some serious digging.
- In the meanwhile, I updated the Python Flask back-end to support the compilation technique. For now, this will check if you've written valid Verilog code, otherwise it should throw out an error onto the console. I guess this is some real progress!
### 11/30/2018
- ECE 270 is an introductory course that gives a very useful overview of digital design concepts with the help of GAL chips and CPLDs. Starting off with 74 series logic gates, students are taught how to wire up Boolean functions, measure voltage/current characteristics, and eventually Verilog to model complex circuits to build a range of concepts from shift registers and counters, to calculators, digital locks, and even an ALU as a final assignment.
- Perhaps one of the first things that I wanted from ECE 270 was a simulator for the ispMACH 4256ZE development board that was locked down in Purdue's EE 65, a laboratory in the EE building meant for ECE 270 students. When I finished the course in Spring 2018, I set out to create one. 
- What I tried before even realizing there was a Verilog simulator  -  using a Python script to lex the Verilog and create logic blocks from modules. I went as far as to write a whole script to look for every single Verilog keyword, use Regex to identify always blocks and combinational assignments, convert them to a format that I could execute, and created a frontend in Visual Basic to show outputs. I only got as far as a script, and even that was horribly buggy.
- Recently I had a conversation with my instructor, Dr. Richard Kennell, in ECE 362 who told me about a very straightforward simulator called IcarusVerilog. My shame at not finding this earlier set aside, I appreciated its incredible simplicity: the executable iverilog compiles a given Verilog file into an object file, and vvp runs it. I think I may finally have this project working, and so I'll be using this page as a sort of one-page documentation for all the work I'll be doing on this project.
### <a href="#" onclick='displayPage("md/intro.md")'>Back to Introduction</a>
