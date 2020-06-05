# Changelog
### Keep in mind that not all features indicated here are relevant.  Future updates may have removed such features and they may not have been logged.  
### 5/31/2020
- After a week and two days, one sprained ankle, and a whole mess of debugging, I've finally put out a beta of HDLwave!  It's accessible with the appropriate credentials at https://verilog.ecn.purdue.edu/hdlwave.
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
    - I'm not really sure what the rationale is for "eceFPGA", but I guess it's a bit of wishful thinking and the fact that it looks a bit cool in that font.  I think I'll keep it that way.  437 does use an FPGA + SoC system...  
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