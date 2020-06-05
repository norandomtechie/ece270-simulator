# Feature List
### The top set of icons:  
- ![new.PNG](md/new.PNG) New - Pulls an empty template with the top module declaration from the server. Be very careful - you cannot recover any unsaved work after clicking it!  
- ![open.PNG](md/open.PNG) Open - Opens up a list of previously saved code files, from both autosaves and manual saves. Double clicking on an option loads the code into the editor.  
- ![save.PNG](md/save.PNG) Save (the floppy disk) - Self-explanatory. Saves the code to the browser. Do keep in mind that code is not saved across browsers.  
- ![download.PNG](md/download.PNG) Download (circle with a down arrow) - Lets you download the code directly to a file on your computer.  
- ![settings.PNG](md/settings.PNG) Settings (set of gears) - Contains settings for Dark Mode, Simulate-upon-Save, password change, AutoSave interval, board color change  
- ![help.PNG](md/help.PNG) Help (a question mark) - Simply opens this page!  
### Options under settings:  
- Dark Mode - if you're used to coding in the dark, or you just like dark themed code editors, there's an option to enable this in Settings. The setting is not saved to the server, so if you use the simulator on multiple browsers, you will have to set it for each one. The default option is Disabled.
- Simulate-upon-Save - not as fancy as it sounds! Enabling it allows you to use Ctrl+S to save as well as simulate immediately while you are typing in the editor. The default option is Disabled.  
- Toggle Autocomplete - If the simulator editor's autocomplete feature is getting in the way of your coding (especially during multicursor typing) you can turn it off.
- Change AutoSave Interval - Determines the amount of time between saves.  
- Change Evaluation Board Theme - The actual FPGA evaluation board is green, but I preferred blue to match the theme of the site. Rick disagrees and wants it to be an exact replica of the board. So we leave the color option to you. You can select the Modern (blue board) option, which is selected by default, or the Original option (green board) option.
### Buttons underneath the board:  
- ![](md/reload.PNG) ![](md/loadtemplate.PNG)  
  This will change text based on whether you have saved code. If you have loaded the site for the first time, or no code has been saved to the browser, the button will   say Load Template, otherwise it will say Reload Code. You can force it to reload the empty code template by holding down Ctrl as you click the button (which also changes the text!)
- ![](md/simulate.PNG)  
  Whatever code is entered in the text editor undergoes a few checks first, then is sent to the server via WebSocket for compilation. If successful, simulation will start, and if not,   errors will be displayed line-by-line on the site.
- ![](md/demo.PNG)  
  A simple demonstration of a Verilog module that flashes all the lights with no interaction from the user. This is simply to showcase the capability of the output handling from the server,   and was the first feature I added to test whether the simulator was working!
- ![](md/freeze.PNG)  
  This stops the simulation, but doesn't clear the board outputs. If you want to take a screenshot of the state of the board when you assert a certain output, but you can't because the   output is changing rapidly, you can quickly hit Freeze to stop the simulation server-side, but hold the current output on the board.
- ![](md/stop.PNG)  
  This does the same thing as Freeze, but the board resets to its initial state.  
### Miscellaneous features:
- The simulator automatically backs up your code every 2 minutes to the browser's local storage, and manually saves your code every time you hit Ctrl+S, while you are typing inside the editor.   Pressing Ctrl+S outside the code editor will not save the code, however.
- The Ace code editor you're typing code into has some pretty great shortcuts. Check them out here. One of my favorite ones is Ctrl+Alt+Up/Down, which can be used to select multiple lines. While the cursor is one line, use Ctrl+Alt+Direction to duplicate the cursor in the direction you want to edit. You can also hold down Ctrl while clicking on multiple lines to add cursors to them.
- (ignore this until you start sequential logic in class) When you design flip-flops using the provided 'reset' input as the reset signal, you can manually assert the 'reset' signal by pressing 3-0-W.
- Clicking the button (push down and release) will also push and then release the button. You can also hold down a button with the mouse, or use Shift+Click to make sure it stays down.  
- You don't always have to click the input buttons! They are also mapped to the corresponding keyboard keys, i.e. 0-9, A-F and W,X,Y,Z. Holding down Shift while holding down one of the buttons will keep the button down.
### <a href="#" onclick='displayPage("md/intro.md")'>Back to Introduction</a>