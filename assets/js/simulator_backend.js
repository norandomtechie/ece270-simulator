var shiftKey = false;
var STATUS_READY = "#e0e0e0";
var SIM_RUNNING = "#e0f0e0";
var CODE_ERROR = "#f0e0e0";
var SERVER_DOWN = "#eecccc";
var DEMO_RUNNING = "#dafae6";
var lightModeTheme = {
    "STATUS_READY": "#e0e0e0",
    "SIM_RUNNING": "#e0f0e0",
    "CODE_ERROR": "#f0e0e0",
    "SERVER_DOWN": "#eecccc",
    "DEMO_RUNNING": "#dafae6",
    "SYNTHESIS": "#fefe7a",
    "CONNECTING": "#f4f47a"
};
var darkModeTheme = {
    "STATUS_READY": "#444",
    "SIM_RUNNING": "#464",
    "CODE_ERROR": "#644",
    "SERVER_DOWN": "#533",
    "DEMO_RUNNING": "#353",
    "SYNTHESIS": "#687509",
    "CONNECTING": "#585509"
};

var LIT_SS = "#f00";
var BLANK_SS = "#222";
var LIT_RED = "#f00";
var BLANK_RED = "#300";

var TUTORIAL_DESCS = [{
        description: `If this text appears, something went wrong.  Restart the tutorial and/or refresh the webpage.`,
        top: '10vh',
        left: '10vw',
        width: '80vw',
        height: '80vh'
    },

    {
        description: `The simulator is quite simple to work with - all you need to do is type in your SystemVerilog design in this code editor, and click the 
        Simulate button below the virtual FPGA board on the lower left.  Go ahead and type: <br><br><code>assign right[0] = hz100;</code><br><br> beneath the commented line
        that says "Your code goes here".  Then, press the Simulate button (or Ctrl-S), and after your SystemVerilog code is processed, synthesized and has started 
        simulating, you should see the rightmost small red LED start to blink very rapidly.  Congratulations on running your first SystemVerilog simulation!`,
        top: '20vh',
        left: '62vw',
        width: '30vw',
        height: '70vh',
        fade: false
    },

    {
        description: `The Demo button showcases the full capability of the virtual board by running a design that will flash all the LEDs available on the board.  Go ahead 
	                  and click it, and it should start the demo simulation.  Some of the behavior you see here will be taught in your upcoming labs!  Press 0/1/2/3 to change the speed of 
                      the simulation.`,
        top: '20vh',
        left: '62vw',
        width: '30vw',
        height: '70vh',
        fade: false
    },

    {
        description: `Now let's familiarize ourselves with the simulator's embedded code editor.  You will write your SystemVerilog designs  
	for each lab in here, with the ability to toggle options like AutoComplete, Vim/Emacs/Sublime keybindings, tab sizes, and much more - this is where 
    you're likely to be working, so you may find it helpful to customize it to your preferences.  
    <br><br> You can try setting these now by clicking inside the editor, and pressing Ctrl+Comma (or Cmd+Comma on a Mac).  Change some settings, and press 
    anywhere outside the panel - do NOT hit the Escape button!  These settings should persist the next time you open the simulator.`,
        top: '15vh',
        left: '3.5vw',
        width: '25vw',
        height: '80vh',
        fade: false,
        noEscape: true
    },

    {
        description: `If you typically keep windows in split-screen mode (for example, when you only have one screen) and then change back to 
                      a maximized window, you might find that the code editor is suddenly much smaller - this occurs in order to accomodate it 
                      in the narrower view.  You can expand the editor by dragging the slider (it's flashing on the right side of the page!) to 
                      the left/right so you can see less/more of your code.`,
        top: '15vh',
        left: '3.5vw',
        width: '25vw',
        height: '80vh',
        fade: false,
        highlight: '#resize-editor'
    },

    {
        description: `As you move from lab to lab, you'll want to retain modules, and have separate workspaces for each lab.  This site implements a 
        filesystem (of sorts) that will allow you to do that, to help you organize your code in seperate files, in separate workspaces (basically folders).  
        Let's set up a new workspace and give it a unique name.  Start by clicking the Add button above (the one with a plus sign in the first row), and 
        in the alert dialog that appears, type in a workspace name and hit Enter.`,
        width: '60vw',
        height: '40vh',
        top: '20vh',
        left: '31vw',
        fade: false,
        highlight: '#editor-tab-workspace-add'
    },

    {
        description: `You should now be in your shiny new workspace!  You can also perform operations like adding, removing and renaming files within a workspace, as well 
	                  as removing and renaming workspaces.  Add a file by clicking the second Add button, in the second row.  Rename it by holding down the Shift key and double-clicking on 
	                  the newly added file tab, typing in a new filename (for SystemVerilog files, end it with .sv) and hitting Enter.  You can "hide" the file by clicking on the X, and 
                      restoring it from the file manager panel - which we'll look at next.`,
        top: '15vh',
        left: '3.5vw',
        width: '25vw',
        height: '80vh',
        fade: false,
        highlight: '#editor-tab-add'
    },

    {
        description: `Removing the file is intentionally a little more difficult, because we don't want you to lose your code!  Click on the Open Icon above (the second one 
                      from the left that looks like a folder).  The shortcut for Open File (typical of any program) is (Ctrl/Cmd)-O.`,
        top: '10vh',
        left: '5vw',
        width: '25vw',
        height: '45vh',
        fade: false,
        highlight: '.fa-folder-open'
    },

    {
        description: `This is your File Manager.  Here, you can view file data (including creation/modification times), delete files or entire workspaces, or create new ones.  
                      <br>Bear in mind: files are saved only in your browser - NOT on the server!  That means if you accidentally wipe your browser data, your code will disappear.`,
        top: '1vh',
        left: '2.5vw',
        width: '92.5vw',
        height: '17.5vh',
        fade: false,
        noEscape: true
    },

    {
        description: `With that in mind, let's delete the file.  Highlight the file you want to delete by clicking it (a border should appear) and either click the Trash icon, 
                      or press the Delete key.  A confirmation dialog will appear so you're absolutely sure you want to delete a file/workspace.`,
        top: '1vh',
        left: '2.5vw',
        width: '92.5vw',
        height: '17.5vh',
        fade: false,
        noEscape: true
    },

    {
        description: `Great job!  Now, close the File Manager by clicking the X icon below to the right.  `,
        top: '1vh',
        left: '2.5vw',
        width: '92.5vw',
        height: '17.5vh',
        fade: false,
        noEscape: true
    },

    {
        description: `Back to simulations - let's take a look at how the pushbuttons work.  Open a new file, and type: <br><br><code>assign right[0] = pb[0];</code><br><br> 
                      This is going to connect pushbutton 0 (called pb[0]) to the rightmost red LED on the board (called right[0]).  Start the simulation, and observe that 
                      right[0] lights up when you press pb[0], and goes back to dim when you release it.  <br><br> This button behavior is intended to behave exactly the 
                      same way as the FPGA in lab does.<br><br>`,
        top: '20vh',
        left: '62vw',
        width: '30vw',
        height: '70vh',
        fade: false
    },

    
    {
        description: `Suppose you make a mistake in your code - for example, you forget a semicolon somewhere.  Go ahead and remove that from after pb[0] in the line you 
                      just entered, and click Simulate.  You will find that an error appears on the line (or even the one right after it) where you removed the semicolon.  
                      You can hover on the red-highlighted line number to get details about the error.<br><br>  Review these carefully, fix your intentional mistake, and 
                      just hit Simulate again (or Ctrl-S if you enabled the shortcut in Settings) to restart the simulation.`,
        top: '20vh',
        left: '62vw',
        width: '30vw',
        height: '70vh',
        fade: false
    },

    {
        description: `Sometimes, errors in your design appear in the synthesis process, as a result of which a few errors are unable to be mapped to a specific line.  To help with that, 
                      we provide you with the full output of the tools used to lint and synthesize your code in the Tool Output tab at the bottom of the editor, so that you can analyze 
                      the Verilog tool dump to find your error. <br><br> Click the Tool Output tab to view the dump from your last simulation.  Depending on what design you send, it 
                      should show you:
                      <br><br> 1) The Verilator error log (if you had no errors, it will be empty). 
                      <br><br> 2) The JSON netlist of your design (this is effectively a list of the gates and sequential cells it takes to produce your hardware design)
                      <br><br> 3) The output from the Yosys synthesis tool that produces this netlist.`,
        top: '5vh',
        left: '1vw',
        width: '28vw',
        height: '90vh',
        fade: false
    },

    {
        description: `A really awesome extension we added in Spring 2020 was the serial communication interface, which allows you to send/receive data to a simulated terminal window,
                     similar to how you would communicate with a device using its serial port via a computer terminal.  While this is much more interesting on the real FPGA, we provide 
                     a simulated version should you wish to create your design outside of lab.  To see a "Hello world" demo of how this serial communication would work, type anywhere in your 
                     code: 
                     <br><br>
                     <code>// give us a uart demo please</code>
                     <br><br> Then hit Simulate and switch to the Terminal View tab.  Do not include this comment in any of your actual lab assignments, or we will not be able to check them!`,
        top: '15vh',
        left: '1vw',
        width: '28vw',
        height: '80vh',
        fade: false,
        highlight: "#view_terminal"
    },

    {
        description: `When working in a workspace, you have the advantage of segregating your code into separate files.  Sometimes, however, you might want to use multiple modules all in the 
        same file, and don't want to include the other tabs in the workspace.  The File/Workspace Simulation button solves this by having select the type of simulation:
        <br><br> A Workspace Simulation will send the code from all the file tabs in a workspace.
        <br><br> A File Simulation will only send the currently active tab at the time when the Simulate button was clicked.
        <br><br> <b>This is very important to remember</b>, otherwise you're going to try to send multiple file tabs with the same modules, or send one file without the modules in other file tabs.
        Both result in possibly confusing errors.  A lot of users make these mistakes, and end up creating a workspace for every single file - that makes the simulator very hard to use, and is not 
        a good thing to do on a small screen.`,
        top: '25vh',
        left: '32vw',
        width: '60vw',
        height: '62.5vh',
        fade: false,
        highlight: "#switchsim"
    },

    // introduce trace data file
    {
        description: `A crucial component of Verilog design and verification is trace analysis and debugging.  The seasoned hardware designer utilizes waveforms from a simulation in order to find 
        potential problems with their hardware design.  For the web-simulator, we've added the capability of getting the traces from your simulation as a VCD file that you can open in GTKwave - 
        you'll do this in lab as well.  Make sure to get <a target="_blank" href="https://sourceforge.net/projects/gtkwave/">GTKwave</a> so you're able to view these traces.  Further instructions on how to work 
        with GTKwave will be provided in assignments.`,
        top: '25vh',
        left: '32vw',
        width: '60vw',
        height: '62.5vh',
        fade: false,
        highlight: "#tracedown"
    },

    // ending shows IPoAC as a joke
    {
        description: `And so we come to the end of our tutorial.  That's all, folks!  
                          <br><br>
                          There's still a bit more stuff, but we'd like to conserve your time and let you discover those on your own later.  We highly recommend that you go through the Help page as well 
                          - specifically <a href="/help?md=tipstricks" target="_blank">the Tips and Tricks section</a> to help you type up your design faster.  
                          There's also GIFs for different features if you'd like to see things in action rather than reading about it.  
                          <br><br>
                          Good luck with your upcoming lab assignments!  We sincerely hope that you find them informative and engaging.
                          <br><br>
                          We're always looking for more help.  This entire project was done by a single TA (with his instructor's invaluable guidance!) in 1.5 semesters, with no background knowledge of web 
                          development when he started.  You can see the evidence in the source code.  If you dabble in web/server development yourself, and you'd like to have the satisfaction of telling us 
                          off for incorporating horribly inefficient/outdated code into this page (we've had complaints), you can either contact course staff or, even better, open an issue on the 
                          <a href="https://github.com/norandomtechie/ece270-simulator" target="_blank">simulator's GitHub repository</a> with details of what should be added/improved/removed.  
                          <br><br>
                          As a kind-of-reward for finishing this tutorial (hopefully you weren't just clicking through to the end), here's  
                          <a href="https://en.wikipedia.org/wiki/IP_over_Avian_Carriers" target="_blank">a fun article</a> we found over the summer.`,
        top: '10vh',
        left: '10vw',
        width: '80vw',
        height: '80vh',
        fade: true
    }
]

/* ************************************************************* */
// Undo manager handling
window.undoManagers = {};

/* 
	Format will be as follows:
	{
		'workspace1': {
			'filename1.sv': UndoManager(),
			'filename2.sv': UndoManager(),
			'filename3.sv': UndoManager(),
			'filename4.sv': UndoManager()
		},
		'workspace2': {
			'filename4.sv': UndoManager(),
			'filename5.sv': UndoManager(),
			'filename6.sv': UndoManager(),
			'filename7.sv': UndoManager()
		}, ...
	}

	No need to save this to localStorage, avoiding circular 
	object error in JSON.stringify.
*/

/* ************************************************************* */

function showFullscreen(elem) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	}
}
function hideFullscreen(elem) {
	if (elem.exitFullscreen) {
		elem.exitFullscreen();
	} else if (elem.webkitExitFullscreen) {
		elem.webkitExitFullscreen();
	} else if (elem.msExitFullscreen) {
		elem.msExitFullscreen();
	}
}

function focusMode() {
	var elem = document.querySelector("#simview");
	if (window.focusModeState) {
		hideFullscreen(elem);
	} else if (elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen) {
		showFullscreen(elem);
	} else {
		alert ("Sorry, it doesn't look like your browser supports this feature.  Contact course staff or use another browser.");
	}
}

document.addEventListener("fullscreenchange", function() {
	if (window.focusModeState) {
		window.focusModeState = false;
	} else {
		window.focusModeState = true;
	}
}); 

var EDITOR_DARK_THEME = "ace/theme/chaos"; // localStorage.ace_dark_theme
var EDITOR_LIGHT_THEME = "ace/theme/chrome"; // localStorage.ace_light_theme
var pending = null;
var lftred = "";
var rgtred = "";
var rgbled = "";
var template_code = "270sim_source_uart.sv";

var ws;
var errors = [];
var error_id = [];
var time;
var conn_interval = ""
var sample;
var selected_section = -1;
var descbar = document.getElementById("description-navbar")
descbar.style["paddingBottom"] = "0vh"
var opacityChange;

CURRENT_STATUS = ["STATUS_READY", "Status: Ready"]

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, "g"), replacement);
};

if (localStorage.simulateOnSave == "true") {
    document.documentElement.setAttribute("simulate-on-save", "true")
} else if (localStorage.simulateOnSave == "false") {
    document.documentElement.setAttribute("simulate-on-save", "false")
} else if (!localStorage.simulateOnSave) {
    // Please use this extremely helpful shortcut
    localStorage.simulateOnSave = true
    document.documentElement.setAttribute("simulate-on-save", "true")
}

if (localStorage.simulationType == "mapped") {
    document.documentElement.setAttribute("simulation-type", "mapped")
} else if (localStorage.simulationType == "source") {
    document.documentElement.setAttribute("simulation-type", "source")
} else if (!localStorage.simulationType) {
    // by default, simulations will be mapped
    localStorage.simulationType = "mapped"
    document.documentElement.setAttribute("simulation-type", "mapped")
}

if (localStorage.codeAutocomplete == "true") {
    document.documentElement.setAttribute("code-autocomplete", "true")
    editor.setOption("enableBasicAutocompletion", true)
    editor.setOption("enableSnippets", true)
    editor.setOption("enableLiveAutocompletion", true)
} else if (localStorage.codeAutocomplete == "false") {
    document.documentElement.setAttribute("code-autocomplete", "false")
    editor.setOption("enableBasicAutocompletion", false)
    editor.setOption("enableSnippets", false)
    editor.setOption("enableLiveAutocompletion", false)
}

button = document.getElementsByClassName("btn-info")[0]
button.isMouseOver = false

// a-f, w-z, 0-9, ctrl, alt, shift
curmap = {}
bakmap = {}

$(document).bind("keydown", "ctrl+o", function (e) {
	if (e.ctrlKey && e.which == 79) {
		e.preventDefault();
		openWorkspaceManager('open')
	}
});

function updateKeys(e) {
    var no_overlay_open = Array.from(document.querySelectorAll("div")).filter(x => /^overlay/.test(x.id)).filter(x => x.style.display == "flex").length == 0;
    var tutorial_not_running = $('#tutorial').css('display') != 'flex';
    var code_editor_active = !(document.activeElement.className.includes("ace"));
    var not_editing_tab_names = !(document.activeElement.className.includes("tab-label"));
    var body_active = (document.activeElement == document.body);
    if (code_editor_active && tutorial_not_running && not_editing_tab_names && no_overlay_open && body_active) {
        var isNum = e.which >= 48 && e.which <= 57
        var isHex = (e.which >= 65 && e.which <= 70) || (e.which >= 97 && e.which <= 102)
        var isWXYZ = (e.which >= 87 && e.which <= 90) || (e.which >= 119 && e.which <= 122)
        var isNumpad = e.code != undefined && e.code.includes("Numpad")
        if (e.key && e.key.match(/^[0-9a-fw-z]$/i) || ((isNum || isHex || isWXYZ || isNumpad) && (e.shiftKey || curmap["Shift"]))) { // all button options
            toggle_button(e)
        } else if (document.getElementsByClassName("btn-info")[0].isMouseOver == true && e.ctrlKey)
            load_button.innerHTML = "Load Template"
    } else if (document.activeElement.id == "passwd" && e.which == 13 && e.type == "keydown")
        change_password()

    if (e.which == 27 && !(window?.noEscapeTutorial)) {
        $('.overlay').css('display', 'none')
        $('.overlay').css('opacity', '0')
        blurMainView(1)
        tutorialAction("stop")
        toggleTutorial(1)

        if (localStorage.ice40DarkMode == "false") {
            while (document.getElementsByClassName("ace-line-error-dark").length != 0)
                document.getElementsByClassName("ace-line-error-dark")[0].classList.replace("ace-line-error-dark", "ace-line-error-light")
        } else {
            while (document.getElementsByClassName("ace-line-error-light").length != 0)
                document.getElementsByClassName("ace-line-error-light")[0].classList.replace("ace-line-error-light", "ace-line-error-dark")
        }
    } 
    else if ((e.key == "ArrowLeft" || e.key == "ArrowRight") && (e.type == "keydown") && !tutorial_not_running && window?.tutorialStep) {
        e.preventDefault();
        if (e.key == "ArrowLeft") {
            $('.btn-tutorial')[0].click();
        }
        else {
            $('.btn-tutorial')[2].click();
        }
    }
    else if (e.which == 46 && $('#overlay_workspace').css('display') == 'flex') {
        e.preventDefault();
        browserDeleteSelectedFiledirs();
    }
    bakmap = JSON.parse(JSON.stringify(curmap));
}

function populateKeystate(e) {
    e = e || event;     // included for IE compatibility, even though this probably would never work on IE
    if (curmap[e.key] && e.type == "keydown" || e.altKey)
        return false
    if (e.key == "Shift" && e.type == 'keyup') {
        window.holdoverShift = e
        setTimeout(() => {
            curmap[window.holdoverShift.key] = window.holdoverShift.type == "keydown" ? true : false
        }, 50)
    } else {
        curmap[e.key] = e.type == "keydown" ? true : false
    }
    btn0 = document.getElementById("key0").getAttribute("pressed")
    btn3 = document.getElementById("key3").getAttribute("pressed")
    btnW = document.getElementById("keyW").getAttribute("pressed")
    if (!window.populatingKeystates) {
        window.populatingKeystates = [];
    }
    if (bakmap[e.key] != curmap[e.key])
        setTimeout(updateKeys, 10, e)
}

onkeyup = onkeydown =
	function (e) {
		setTimeout(function () { populateKeystate(e) }, 1)
	};

function togglePassword() {
    if (document.getElementById("passwd").type == "password") {
        document.getElementById("passwd").type = "text"
        document.getElementById("toggle_eye").style["opacity"] = 0.5
    } else {
        document.getElementById("passwd").type = "password"
        document.getElementById("toggle_eye").style["opacity"] = 1
    }
}

function ctrl_alt_del(event, key) {
    var cad = [
        [document.getElementById("key0"),
            document.getElementById("text0")
        ],
        [document.getElementById("key3"),
            document.getElementById("text3")
        ],
        [document.getElementById("KeyW"),
            document.getElementById("textW")
        ]
    ];

    for (var i = 0; i < 3; i++) {
        key_element = cad[i][0];
        text_element = cad[i][1];
        x_loc = parseInt(key_element.getAttribute("x"))
        y_loc = parseInt(key_element.getAttribute("y"))
        cur_width = parseInt(key_element.getAttribute("width"))
        cur_height = parseInt(key_element.getAttribute("height"))

        if (key_element.getAttribute("pressed") == "true") {
            key_element.setAttribute("x", x_loc - 10)
            key_element.setAttribute("y", y_loc - 10)
            key_element.setAttribute("width", cur_width + 20)
            key_element.setAttribute("height", cur_height + 20)
            key_element.setAttribute("pressed", false)
            text_element.setAttribute("font-size", 28)
        } else if (key_element.getAttribute("pressed") == "false") {
            key_element.setAttribute("x", x_loc + 10)
            key_element.setAttribute("y", y_loc + 10)
            key_element.setAttribute("width", cur_width - 20)
            key_element.setAttribute("height", cur_height - 20)
            key_element.setAttribute("pressed", true)
            text_element.setAttribute("font-size", 24)
        }
    }
    sendInputs()
}

function toggle_button(event, mousekey) {
    if (event.ctrlKey || (event.ctrlKey && event.shiftKey) || event.altKey || event.metaKey) {
        return false;
    }

    if (event.type.includes("mouse")) {
        key_element = document.getElementById(mousekey)
        text_element = document.getElementById(mousekey.replace('key', 'text'))
    } else if (event.code.includes("Numpad") || event.code.includes("Digit")) {
        key_element = document.getElementById(event.code.replace(/Numpad|Digit/g, 'key'))
        text_element = document.getElementById(event.code.replace(/Numpad|Digit/g, 'text'))
    } else {
        key_element = document.getElementById("key" + event.key.toUpperCase())
        text_element = document.getElementById("text" + event.key.toUpperCase())
    }

    x_loc = parseInt(key_element.getAttribute("x"))
    y_loc = parseInt(key_element.getAttribute("y"))
    cur_width = parseInt(key_element.getAttribute("width"))
    cur_height = parseInt(key_element.getAttribute("height"))
    shiftKey = event.shiftKey || curmap["Shift"]

    if ((key_element.getAttribute("pressed") == "true" && (!shiftKey || event.type == "mousedown" || event.type == "keydown"))) {
        key_element.setAttribute("x", x_loc - 10)
        key_element.setAttribute("y", y_loc - 10)
        key_element.setAttribute("width", cur_width + 20)
        key_element.setAttribute("height", cur_height + 20)
        key_element.setAttribute("pressed", false)
        text_element.setAttribute("font-size", 28)
        shiftKey = false
        sendInputs()
    } else if (key_element.getAttribute("pressed") == "false" && (event.type == "mousedown" || event.type == "keydown")) {
        key_element.setAttribute("x", x_loc + 10)
        key_element.setAttribute("y", y_loc + 10)
        key_element.setAttribute("width", cur_width - 20)
        key_element.setAttribute("height", cur_height - 20)
        key_element.setAttribute("pressed", true)
        text_element.setAttribute("font-size", 24)
        shiftKey = event.shiftKey
        sendInputs()
    }
}

var sentInput = '';

function sendInputs() {
    buttonmap = "0123456789ABCDEFWXYZ"
    inputs = document.getElementsByClassName("inputbutton")

    for (var idx in inputs) {
        button = document.getElementById(inputs[idx].id)
        if (button == null)
            break
        replacement = button.getAttribute("pressed") == "false" ? "f" : "t"
        buttonmap = buttonmap.replace(button.id[button.id.length - 1], replacement)
    }
    if (typeof ws == "undefined" || ws.readyState == ws.CLOSED) return false

    binary = "ffffffff"
    if (txdata_fifo.length > 0) {
        extract = txdata_fifo.pop()
        binary = Array.from(extract.key.charCodeAt(0).toString(2)).map(x => x == '0' ? 'f' : 't').join('')
        binary = "f".repeat(8 - binary.length) + binary
        binary = "t" + binary
    } else {
        binary = "f" + binary
    }
    buttonmap = "t" + binary + buttonmap
    sentInput = buttonmap
    if (ws)
        ws.send(buttonmap)
}

var saved_txclk = '-1';
var txdata_fifo = [];

function setOutputs(json_out) {
    /*  {LFTRED: x, RGTRED: x, RGBLED: x, SS7: x, SS6: x, SS5: x ... SS0: x}  */
    //  also includes {TXDATA: x, TXCLK: x, RXCLK: x}
    lftred = document.getElementsByClassName("lftred")
    rgtred = document.getElementsByClassName("rgtred")
    rgbled = document.getElementById("rgbled")

    for (var i = 7; i >= 0; i = i - 1) {
        ss = document.getElementsByClassName("ss" + i.toString() + "_line")
        for (var j = 7; j >= 0; j = j - 1) {
            if ((parseInt(json_out["SS" + i]) & Math.pow(2, (7 - j))) > 0)
                ss[j].setAttribute("stroke", LIT_SS) // LIT_SS = "#f00"
            else
                ss[j].setAttribute("stroke", BLANK_SS) // BLANK_SS = "#222"
        }

        if ((parseInt(json_out["LFTRED"]) & Math.pow(2, i)) > 0)
			lftred[i].setAttribute("fill", LIT_RED)	// LIT_RED = "#f00"
		else
			lftred[i].setAttribute("fill", BLANK_RED)	// BLANK_RED = "#300"

		if ((parseInt(json_out["RGTRED"]) & Math.pow(2, i)) > 0)
			rgtred[i].setAttribute("fill", LIT_RED)	// LIT_RED = "#f00"
		else
			rgtred[i].setAttribute("fill", BLANK_RED)	// BLANK_RED = "#300"
    }

    color = "#"
    color += json_out["REDLED"] > 0 ? "ff" : "00";
    color += json_out["GRNLED"] > 0 ? "ff" : "00";
    color += json_out["BLULED"] > 0 ? "ff" : "00";

    if (color == "#000")
        color = "#111"
        //     console.log (color)
    rgbled.setAttribute("fill", color)

    if (json_out['RXCLK'] == '1')
        ws.send('tf' + sentInput.slice(2))

    if (json_out['TXCLK'] == '1' && saved_txclk == '0')
        term.write(String.fromCharCode(json_out["TXDATA"]))
    saved_txclk = json_out['TXCLK']
}

function appendVCD(chunk) {
    if (!window.vcd || window.vcd.startsWith("No traces have been")) {
        window.vcd = chunk;
    } else {
        window.vcd += "\n" + chunk;
    }
}

function downloadVCD() {
    if (!window.vcd || window.vcd.startsWith('No traces have been')) {
        alert("A simulation needs to complete before traces can be produced.")
        return;
    }
    var link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([window.vcd], { type: 'text/vcd' }));
    link.download = `${window.vcdworkspace}_simulation.vcd`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function ice40hx8k_handler(demo=false) {
    time = new Date().getTime() / 1000;
    window.vcdworkspace = window.active_workspace;
    window.vcd = "No traces have been generated from a simulation yet.";

    if (editor.session.getValue().includes("’")) {
        alert("Copying code from the notes without typing it out? Tsk tsk...\n" +
            "The code you copied intentionally has special characters that " +
            "cannot be parsed by Yosys or CVC. We highly recommend that you " +
            "type out the entire code segment you are trying to use.\n" +
            "If you really did type it out, and you're still seeing this message, " +
            "contact the head TA.");
        return;
    }
    if (!demo && editor.session.getValue().match(/\/\/ ?module top|(\/\* ?\n?)module top/)) {
        alert("It seems like you have commented out or removed the top module. Your code will not compile!")
        return
    }
    update_status("STATUS_READY", "Status: Ready")

    if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
        ws.onmessage = function() {}
        ws.onclose = function() {}
        ws.close()
        setOutputs({
            "LFTRED": 0,
            "RGTRED": 0,
            "RGBLED": 0,
            "SS7": 0,
            "SS6": 0,
            "SS5": 0,
            "SS4": 0,
            "SS3": 0,
            "SS2": 0,
            "SS1": 0,
            "SS0": 0
        })
    }
    ws = new WebSocket(window.location.protocol.replace("http", "ws") + window.location.host + "/")
    ws.demoMode = demo;
    ws.currentWorkspace = window.active_tab.getAttribute('workspace');
    Array.from($('.editor-tab')).forEach(e => e.removeAttribute('errors'));

    update_status("CONNECTING", "Status: Connecting...")
    var messages = ""
    var synthesis_interval = ""
    ws.onmessage = function(event) {
        if (event.data.includes("Processing Verilog code...")) {
            var msg = document.documentElement.getAttribute('simulation-type') == 'mapped' ? "Synthesizing" : "Compiling";
			update_status("SYNTHESIS", `Status: ${msg}...`)
            messages = event.data + "\n"
            synthesis_interval = setInterval(function () {
				if (document.getElementById("status-text").innerHTML == `Status: ${msg}...`)
					update_status("SYNTHESIS", `Status: ${msg}..`)
				else if (document.getElementById("status-text").innerHTML == `Status: ${msg}..`)
					update_status("SYNTHESIS", `Status: ${msg}.`)
				else if (document.getElementById("status-text").innerHTML == `Status: ${msg}.`)
					update_status("SYNTHESIS", `Status: ${msg}`)
				else if (document.getElementById("status-text").innerHTML == `Status: ${msg}`)
					update_status("SYNTHESIS", `Status: ${msg}...`)
            }, 500)
        } else if (event.data.includes("Simulation successfully started!") || (event.data.includes("warning") && !event.data.includes("Error"))) {
            if (window.localStorage.autoTerminalSwitch == "true" && $('#terminal').css('display') == 'none') {
                switchView(1)
            } else {
                initializeTerminalSafe()
                if ($('#terminal').css('display') == 'none') {
                    switchView(1, 'f')
                    switchView(0, 'f')
                }
            }
            term.write("\r")
            term.clear()
            term.write('UART Terminal connected to simulated ice40 FPGA UART.  Echoing data below...\r\n');
            $("#outputview").val("Output produced:\r\n" + (event.data.split("\n").slice(1).join('\n')))
            clearInterval(synthesis_interval)
            sendInputs()
            clearEditorErrors()
            errors = []
            if (ws.demoMode) {
                update_status("SIM_RUNNING", "Status: Running demo simulation")
            }
            else {
                update_status("SIM_RUNNING", "Status: Simulation is running")
            }
        } else if (event.data.includes("Error") || event.data.includes("failed")) {
            clearInterval(synthesis_interval)
            clearEditorErrors()
            errors = []
            messages = event.data.split("\n")
            console.log(messages);
            var endoflog = false
            for (var elm in messages) {
                if (event.data.startsWith("Error occurred in Icarus compile step") && /.sv:[0-9]+: .+/.test(messages[elm])) {
					var matches = messages[elm].match(/\/([^\/]+\.sv):([0-9]+): (.+)/);
					[filename, num, msg] = [matches[1], parseInt(matches[2]), matches[3]];
					errors.push({
						file: filename,
						workspace: ws.currentWorkspace,
						row: (num - 1).toString(),
						column: 0,
						text: msg,
						type: "error"
					});
				}
				else if (messages[elm].match(/^[\w]+\.sv: Line/)) {
                    var data = messages[elm].replace("Line ", "").replace(/\:/g, "").split(" ")
                    var filename = data[0]
                    var num = parseInt(data[1])
                    var msg = data.slice(2).join(" ")
                    errors.push({
                        file: filename,
                        workspace: ws.currentWorkspace,
                        row: (num - 1).toString(),
                        column: 0,
                        text: msg,
                        type: "error"
                    });
                    if (filename == window.active_tab.getAttribute('name') && ws.currentWorkspace == window.active_tab.getAttribute('workspace')) {
                        error_id.push(editor.session.addMarker(new Range(num - 1, 0, num - 1, 1), localStorage.ice40DarkMode == "true" ? "ace-line-error-dark" : "ace-line-error-light", "fullLine"));
                    }
                    // if 'code.sv' is returned, an arbitrary error with no information was sent.  Attach it to the first file instead
                    if (filename == 'code.sv') filename = getWorkspace(getFilesystem(), ws.currentWorkspace)[0].name

                    // if tab is closed, open tab, then perform below
                    if ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]').length == 0) {
                        var wksp = getWorkspace(getFilesystem(), ws.currentWorkspace)
                        var file = wksp.filter(f => f.name == filename)[0]
                        openFileFromStorage(file, ws.currentWorkspace, true)
                    }
                    // color tab red if it is NOT the current tab since it has an error
                    if ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0] != window.active_tab) {
                        $('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]').css('border', 'var(--editor-tab-error)')
                    }
                    // check if tab is open, check if 'errors' attribute is set, then add line numbers
                    if ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].getAttribute('errors') == null) {
                        $('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].setAttribute('errors', JSON.stringify([num]))
                    } else {
                        var error_lines = JSON.parse($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].getAttribute('errors'))
                        error_lines.push(num)
                        $('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].setAttribute('errors', JSON.stringify(error_lines))
                    }
                }
            }
            editor.getSession().setAnnotations(
                errors.filter(e => e.workspace == window.active_tab.getAttribute("workspace") && e.file == window.active_tab.getAttribute("name"))
            )
            $("#outputview").val(event.data)
            update_status("CODE_ERROR", "Status: Error in code")
            messages = ""
            compile_failed = true
            return false
        } else if (event.data.includes("Unauthorized WebSocket")) {
            update_status("CODE_ERROR", "Status: Unauthorized simulation")
                // alert("Your simulator session has either expired, or not been started.  Refresh the page.");
            alert("Your simulator session has either expired, or not been started.  We'll open a new tab to let you log in again without having to refresh this page.  " +
				"(Borrowed this idea from Brightspace.  It's one of the (few) good things they do).");
			window.open("https://verilog.ecn.purdue.edu/portal?return", "_blank", "toolbar=yes,top=500,left=500,width=600,height=800");
			window.rerunSimulation = setInterval(async () => {
				var resp = await fetch('/', {cache: 'no-store'});
				console.log("resp", resp);
				if (!resp.redirected) {
					clearInterval(window.rerunSimulation);
					delete window.rerunSimulation;
					ice40hx8k_handler();
				}
			}, 1000);
        } else {
            try {
                if ("LFTRED" in JSON.parse(event.data)) {
                    setOutputs(JSON.parse(event.data));
                } else if ("vcd" in JSON.parse(event.data)) {
                    // vcd appears right after simulation has been stopped.  Safe to update status variable here.
                    appendVCD(JSON.parse(event.data).vcd);
                    update_status("CODE_ERROR", "Status: Simulation ended")
                    this.pending = setTimeout(() => {
                        update_status("STATUS_READY", "Status: Ready")
                    }, 1000);
                }
            } catch (err) {
                if (typeof event.data == "string" && event.data.includes("timing violation")) {
                    alert(event.data)
                    update_status("CODE_ERROR", "Status: FF Timing Violation")
                } else if (typeof event.data == "string" && event.data.includes("TIME LIMIT EXCEEDED")) {
                    update_status("CODE_ERROR", "Status: Simulation timeout")
                } else if (typeof event.data == "string" && event.data.includes("MISSING TOP MODULE")) {
                    update_status("CODE_ERROR", "Status: Missing top module")
                    alert("The code received doesn't describe any hardware. Since there's nothing to synthesize and/or simulate, " +
                        "the server immediately killed the simulation. Try adding some code before simulating.")
                } else if (event.data.includes("END SIMULATION")) {
                    console.log("END SIMULATION")
                } else if (event.data.includes("YOSYS HUNG")) {
                    alert("Your code took longer than expected to compile, which is an indicator that your design is too complex and must be optimized. " +
                        "Check your design with course staff. \n" +
                        "We do not allow compile times to exceed 30 seconds to allow for other students to continue running their simulations. ")
                    update_status("CODE_ERROR", "Status: Synthesis timeout")
                } else if (event.data.includes("TIMING VIOLATION")) {
                    console.log(event.data);
                }
                // else if (event.data.includes("SIM HUNG")) {
                // 	alert("Your simulation was killed because of a bug in your code.  Ensure that your flip flops are only changing regs as they're meant to, " + 
                // 		  "and that you are not changing regs in different always blocks.  If you're absolutely sure your code is correct, post it privately to instructors on Piazza.")
                // 	update_status("CODE_ERROR", "Status: Simulation hung on server")
                // }
                else {
                    console.error(err)
                    console.log(event.data)
                }
                if (!event.data.includes("TIMING VIOLATION"))
                    this.pending = setTimeout(function() { update_status("STATUS_READY", "Status: Ready") }, 1000);
            }
        }
    }
    ws.onopen = function() {
        if (ws.readyState == 1) {
            if (ws.demoMode) {
                ws.send(JSON.stringify({
                    'files': [{ name: 'demo.sv', code: "give us a demo please" }],
                    'settings': { 'support': [], 'testbench': "", 'simType': "mapped" }
                }));
                setTimeout(sendInputs, 500);
            }
            else {
                if (localStorage.switchsim == 'workspace') {
                    var files = getWorkspace(getFilesystem(), window.active_tab.getAttribute('workspace'));
                } else {
                    var files = getWorkspace(getFilesystem(), window.active_tab.getAttribute('workspace')).filter(e => e.name == window.active_tab.getAttribute('name'));
                }
                var settings = getWkspSettings(window.active_tab.getAttribute('workspace'));
                // workaround for users who already created a new workspace before I noticed the bug
                if (typeof settings === "undefined") {
                    settings = { "support": [], "testbench": "" };
                    setWkspSettings(window.active_tab.getAttribute('workspace'), settings);
                }
                settings.simType = document.documentElement.getAttribute('simulation-type');
                ws.send(JSON.stringify({ 'files': files.map(f => typeof(f) == "string" ? JSON.parse(f) : f), 'settings': settings }));
            }
        }
    }
    ws.onclose = function(evt) {
        if (ws.demoMode) {
            if (evt.code == 1006) {
                console.log(evt.code)
                update_status("SERVER_DOWN", "Status: Server is down")
            }
            this.pending = setTimeout(function() { update_status("STATUS_READY", "Status: Ready") }, 1000);
        }
        else {
            difftime = (new Date().getTime() / 1000) - time
            var minutes = Math.floor(difftime / 60);
            var seconds = difftime - minutes * 60;
            console.log("Simulation ended at " + minutes.toString() + " minutes and " + seconds.toString() + " seconds.")
            if (!errors) {
                this.pending = setTimeout(function() { update_status("STATUS_READY", "Status: Ready") }, 1000);
            }
        }
    }
    return false;
}


function load_template(e) {
    $.get({ url: "/assets/" + template_code, cache: false }, function(data) {
        window.localStorage.original_code = data
        editor.setValue(window.localStorage.original_code);
        editor.session.setMode("ace/mode/verilog")
    });
}

// :) opens in new tab, so dw you don't lose your work (although you shouldn't tbh)
function rickroll() { window.open("https://youtu.be/dQw4w9WgXcQ?t=85") }

function display_info(sect) {
    var p_elm = document.getElementById("desctext")
    var descbar = document.getElementById("description-navbar")

    if (descbar.style["height"] == "15vh" && sect == selected_section) {
        descbar.style["height"] = "0vh";
    } else if (descbar.style["height"] == "0vh") {
        descbar.style["height"] = "15vh";
    }

    selected_section = sect
    switch (sect) {
        case 0:
            p_elm.innerHTML = "This simulator for ECE 270 was created by Niraj Menon initially as a personal project \
                       but has since turned into an extremely useful tool for ECE 270 students wishing to avoid \
                       late nights in lab working on the physical board. Ever since then, we have put those dark days behind us. :) <br><br>\
                       The website runs on a node.js server, utilizing Verilog simulation and synthesis tools like CVC and Yosys."
            break;
        case 1:
            p_elm.innerHTML = "When you click Simulate or Demo, you're sending a message back to the server, which processes it. If there are errors, it reports them back to you, and quits.\
			If not, it uses <a href='http://www.tachyon-da.com/what-is-cvc/'>CVC</a> and <a href='http://www.clifford.at/yosys/'>Yosys</a> to synthesize and then simulate the code you sent, \
			and waits for either you to send inputs using the buttons, or the outputs to start changing, which the webpage will receive and parse to show it to you on the board. You can \
			manually assert the input reset signal to the module by simply pressing Ctrl+Alt+R."

            break;
        case 2:
            p_elm.innerHTML = "Enter your code in the editor below. Ensure that you include the top module and that its name is top. \
			Include any other modules referenced in your code, and then hit Simulate. Change the inputs to see the expected behavior of the board! \
			To include more modules, simply paste them one after the other into the textbox.\
			It's okay if you don't get it. <p id='nevergonnagiveyouup' onclick='javascript:rickroll()' style='display: inline; cursor: pointer; color: cornflowerblue; transition: all 0.3s'>Don't give up on yourself!</p>"
            document.querySelector('#nevergonnagiveyouup').style['color'] = 'cornflowerblue';
            setTimeout(() => { if (document.querySelector('#nevergonnagiveyouup')) document.querySelector('#nevergonnagiveyouup').style['color'] = ''; }, 1000)
            break;
        case 3:
            p_elm.innerHTML = "The simulator couldn't have been made possible without my fellow UTAs, GTAs, my overly critical friends in ECE, students and their invaluable feedback, numerous posts on StackOverflow, Reddit, \
            Mozilla Web Docs and, of course - Rick."
            break;
        case 4:
            p_elm.innerHTML = "We analyze what students do on the site, \
                       specifically how many visits are made to the site, password change attempts,\
                       and how many times students hit the Simulate and Demo buttons.\
                       If your code causes an internal server error, it will be saved for diagnosis\
                       and prevention of the error it caused, otherwise it will be deleted after \
                       the simulation is stopped."
            break;
        case 5:
            p_elm.innerHTML = `The code for past versions of the simulator, after undergoing revisions to ensure 
                               no sensitive information remains, is uploaded to <a href='https://github.com/norandomtechie/ece270-simulator'>Niraj's GitHub repository</a> 
                               at the end of every semester.  It can be downloaded and installed for use locally, or even if you simply want to look at the source code.`
            break;
    }
}

window.onbeforeunload = function() {
    window.localStorage.evalboardtheme = document.getElementById("evalthemeselector").value;
    window.localStorage.editor_width = $("#editor-workspace").width();
    localStorage.ace_options = JSON.stringify(editor.getOptions());
    if (localStorage.ice40DarkMode == "true")
        localStorage.ace_dark_theme = editor.getOption("theme");
    else if (localStorage.ice40DarkMode == "false")
        localStorage.ace_light_theme = editor.getOption("theme");
    if (ws)
        ws.close();
};

function closeOverlay() {
    document.getElementById("overlay").style.opacity = 1;
    time = new Date().getTime() / 1000.0
    $('#overlay').animate({ 'opacity': '0' }, 200, () => {
        document.getElementById("overlay").style.display = "none";
    })
    blurMainView(1)
}

function switchWorkspaceSim() {
    if ($('#switchsim')[0].innerHTML == 'Workspace Simulation') {
        $('#switchsim')[0].innerHTML = 'File Simulation'
        localStorage.switchsim = 'file'
    } else {
        $('#switchsim')[0].innerHTML = 'Workspace Simulation'
        localStorage.switchsim = 'workspace'
    }
}

function saveAllFilesToStorage() {
    var filesystem = JSON.parse(localStorage.filesystem)
    var labels = Array.from($('.tab-label'))
    labels.pop() // removes Add button from list, since it is not a code file
    tab_list = []
    labels.forEach(e => {
        var etl_workspace = !($(e).parent().attr('workspace') in editor_tab_list);
        var etl_code = ($(e).parent().attr('workspace') in editor_tab_list) && !($(e).parent().attr('name') in editor_tab_list[$(e).parent().attr('workspace')]);
        if (etl_workspace || etl_code) {
            console.log("saveAllFilesToStorage attempted but code was not found, exiting...");
            console.log(etl_workspace, etl_code);
            console.log(editor_tab_list);
            return;
        }
        data = {
            name: $(e).parent().attr('name'),
            code: editor_tab_list[$(e).parent().attr('workspace')][$(e).parent().attr('name')].getValue(),
            ctime: $(e).parent().attr('ctime'),
            mtime: $(e).parent().attr('mtime'),
            workspace: $(e).parent().attr('workspace'),
            state: $(e).parent().attr('state') || 'open'
        }
        var workspace = JSON.parse(filesystem[$(e).parent().attr('workspace')])
        if (!('filter' in workspace)) {
            workspace = [JSON.parse(filesystem[$(e).parent().attr('workspace')])]
        }
        // if not saved to storage, save it
        if (workspace.filter(el => el.name == data.name).length == 0) {
            new_arr = JSON.parse(JSON.stringify(workspace))
            new_arr.push(data)
            filesystem[$(e).parent().attr('workspace')] = JSON.stringify(new_arr)
        } else {
            var all_data = JSON.parse(JSON.stringify(workspace))
            var idx = all_data.indexOf(all_data.filter(el => el.name == data.name)[0])
            all_data[idx].name = data.name.replace('.v', '.sv') // ensure everyone has SV files from now on
            all_data[idx].code = data.code
            all_data[idx].ctime = data.ctime
            all_data[idx].mtime = data.mtime
            all_data[idx].state = data.state
            filesystem[$(e).parent().attr('workspace')] = JSON.stringify(all_data)
        }
        window.localStorage.filesystem = JSON.stringify(filesystem)
    })
    window.localStorage.active_tab = JSON.stringify([window.active_tab.getAttribute('name'), window.active_tab.getAttribute('workspace')])
}

function clearEditorErrors() {
    editor.getSession().clearAnnotations()
    for (var id in error_id) {
        editor.session.removeMarker(error_id[id])
    }
    error_id = []
}

function saveVerilog() {
    uriContent = "data:application/octet-stream," + encodeURIComponent(editor.getValue());
    document.getElementById("downlink").href = uriContent
    document.getElementById("downlink").click()
}

function stop_handler() {
    if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
        ws.onclose = function() {}
        ws.close()
        update_status("CODE_ERROR", "Status: Simulation stopped")
        this.pending = setTimeout(() => {
            update_status("STATUS_READY", "Status: Ready")
        }, 1100)
    }
}

function reset_handler() {
    if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
        ws.onclose = function() {}
        ws.send("END SIMULATION")
            // ws.close()
            // update_status("CODE_ERROR", "Status: Simulation reset")
        difftime = (new Date().getTime() / 1000) - time
        var minutes = Math.floor(difftime / 60);
        var seconds = difftime - minutes * 60;
        console.log("Simulation ended at " + minutes.toString() + " minutes and " + seconds.toString() + " seconds.")
        update_status("SYNTHESIS", "Status: Waiting for trace data..")
    }
    clearEditorErrors()
    errors = []
    setOutputs({
        "LFTRED": 0,
        "RGTRED": 0,
        "RGBLED": 0,
        "SS7": 0,
        "SS6": 0,
        "SS5": 0,
        "SS4": 0,
        "SS3": 0,
        "SS2": 0,
        "SS1": 0,
        "SS0": 0
    })
}

/* ********************************************************************************* */
// THANK YOU https://www.sitepoint.com/javascript-generate-lighter-darker-color/ !!!!!
function ColorLuminance(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#",
        c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}
/* ********************************************************************************* */

function update_status(color, message) {
    clearTimeout(pending)
    CURRENT_STATUS = [color, message]
    if (localStorage.ice40DarkMode == "true") {
        document.getElementById("status-navbar").style["background-color"] = darkModeTheme[color]
        document.getElementById("description-navbar").style["background-color"] = ColorLuminance(darkModeTheme[color], -0.2)
        document.getElementById("status-text").innerHTML = message
    } else {
        document.getElementById("status-navbar").style["background-color"] = lightModeTheme[color]
        document.getElementById("description-navbar").style["background-color"] = ColorLuminance(lightModeTheme[color], -0.05)
        document.getElementById("status-text").innerHTML = message
    }
}

function codescroll(event) {
    if (document.activeElement.className == "ace_text-input" && event.ctrlKey) {
        event.preventDefault()
        if (event.deltaY > 0) {
            document.getElementById("codemirror_box").style.fontSize = (parseFloat(document.getElementById("codemirror_box").style.fontSize.replace("px", "")) - 0.5).toString() + "px"
        } else {
            document.getElementById("codemirror_box").style.fontSize = (parseFloat(document.getElementById("codemirror_box").style.fontSize.replace("px", "")) + 0.5).toString() + "px"
        }
    }
}

function selectTabByEvent(event) {
    if (event.target.classList.contains('tab-close') || event.target.classList.contains('wksp-tab-close') || event.target.id == "editor-tab-add" || $(event.target).nodeName == "PATH")
        return
        else if ($(event.target).prop('tagName') != "LABEL" && $(event.target).classList.includes('editor-tab-selected')) {
        selectTabByElement(event.target)
    }
}

// Overlay functions

function openUART() {
    $("#overlay_3").css('display', 'flex')
    $("#overlay_3").animate({ 'opacity': '1' }, 200, () => {
        blurMainView(0)
    })
}

function closeUART() {
    $("#overlay_3").animate({ 'opacity': '0' }, 200, () => {
        blurMainView(1)
        $("#overlay_3").css('display', 'none')
    })
}

function openSettings() {
    $('#overlay_2').css('display', 'flex')
    $('#overlay_2').animate({ 'opacity': 1 }, 200, () => {
        blurMainView(0)
    })
}

function blurMainView(opt) {
    switch (opt) {
        case 0:
            $("#mainview").css('filter', 'blur(3px)')
            break;
        case 1:
            $("#mainview").css('filter', 'blur(0px)')
            break;
    }
}

function fadeWholeMainView(opt) {
    switch (opt) {
        case 0:
            $('#mainview').css('filter', 'brightness(0.65)');
            $('#mainview').css('background', 'var(--tutorial-fade)');
            break;
        case 1:
            $('#mainview').css('background', '');
            $('#mainview').css('filter', '');
            break;
    }
}

function toggleTutorial(opt) {
    switch (opt) {
        case 0:
            fadeWholeMainView(0);
            $('#tutorial').css('display', 'flex');
            $('#tutorial').animate({ 'opacity': '1' }, 250);
            break;
        case 1:
            $('#tutorial').animate({ 'opacity': '0' }, 250, () => {
                $('#tutorial').css('display', 'none');
                fadeWholeMainView(1);
            });
            break;
    }
}

var tutorial_button_functions = [
    () => {
        tutorialAction("next")
    },
    () => {
        tutorialAction("stop")
    },
    () => {
        tutorialAction("aska")
    }
]

function tutorialButtonAction(button) {
    tutorial_button_functions[button]();
}

function tutorialAction(action) {
    localStorage.tutorialTaken = 'true';
    
    if (!window.tutorialStep && !['stop', 'aska'].includes(action)) {
		// starting tutorial now
		window.tutorialStep = 0;

		tutorial_button_functions[0] = (() => { tutorialAction("prev") })
		$('.btn-tutorial')[0].innerHTML = "Back"
		$('.btn-tutorial')[0].title = "Need to revisit something?  Go back a page!"
		$('.btn-tutorial')[1].innerHTML = "Stop"
		$('.btn-tutorial')[1].title = "Tired of going through all this information?  Stop now and return when you can!"
		tutorial_button_functions[2] = (() => { tutorialAction("next") })
		$('.btn-tutorial')[2].innerHTML = "Next"
		$('.btn-tutorial')[2].title = "All good?  Keep going!"

		$('.tutorial_actions').css('flex-direction', 'row');
		$('.tutorial_actions').css('justify-content', 'space-evenly');
		$('.btn-tutorial').css('width', '10vw');
        $('.btn-tutorial').blur();  // allowing Left/Right arrow movement
    }

    if (window?.tutorialFlashInterval && window?.attElm) {
        window.attElm.style.opacity = '1';
        clearInterval(window.tutorialFlashInterval);
        delete window.tutorialFlashInterval;
    }
    
    switch (action) {
        case 'prev':
            window.tutorialStep--;
            break;
        case 'stop':
            toggleTutorial(1);
            break;
        case 'fnext':
            window.tutorialStep = 2; // or wherever the new features start
            break;
        case 'next':
            window.tutorialStep++;
            break;
        case 'aska':    // ask again later
            localStorage.tutorialTaken = 'false';
            toggleTutorial(1);
            break;
    }
    $('.btn-tutorial')[0].disabled = window.tutorialStep == 1 ? true : false;
    $('.btn-tutorial')[2].disabled = window.tutorialStep == (TUTORIAL_DESCS.length - 1) ? true : false;
    $('.btn-tutorial')[2].style.opacity = window.tutorialStep == (TUTORIAL_DESCS.length - 1) ? "0" : "1";
    $('.btn-tutorial')[1].innerHTML = window.tutorialStep == (TUTORIAL_DESCS.length - 1) ? "Finish" : $('.btn-tutorial')[1].innerHTML

    window.noEscapeTutorial = TUTORIAL_DESCS[window.tutorialStep]?.noEscape ? true : false;

    if (TUTORIAL_DESCS[window.tutorialStep]?.highlight) {
        window.attElm = document.querySelector(TUTORIAL_DESCS[window.tutorialStep].highlight);
        window.attElm.style.transition = 'opacity 0.25s';
        window.tutorialFlashInterval = setInterval(() => {
            window.attElm.style.opacity = window.attElm.style.opacity == '1' ? '0' : '1'
        }, 250);
        window.attElm.addEventListener('mousedown', () => {
            window.attElm.style.opacity = '1';
            clearInterval(window.tutorialFlashInterval);
            delete window.tutorialFlashInterval;
        });
    }

    if (action == "stop" && window?.tutorialFlashInterval) {
        window.attElm.style.opacity = '1';
        clearInterval(window.tutorialFlashInterval);
        delete window.tutorialFlashInterval;
    }
    
    if (window?.tutorialStep && TUTORIAL_DESCS[window.tutorialStep]) {
        $("#tutorial").css("top", TUTORIAL_DESCS[window.tutorialStep].top);
        $("#tutorial").css("left", TUTORIAL_DESCS[window.tutorialStep].left);
        $("#tutorial").css("width", TUTORIAL_DESCS[window.tutorialStep].width);
        $("#tutorial").css("height", TUTORIAL_DESCS[window.tutorialStep].height);
        $("#tutorial p").html(TUTORIAL_DESCS[window.tutorialStep].description);
        fadeWholeMainView(TUTORIAL_DESCS[window.tutorialStep].fade ? 0 : 1);
    }
}

function closeSettings() {
    if ($('#overlay_2').css('display') == 'none')
        return false;
    $('#overlay_2').animate({ 'opacity': 0 }, 200, () => {
        $('#overlay_2').css('display', 'none')
    })
    blurMainView(1)
}

function lightMode() {
    editor.setTheme(EDITOR_LIGHT_THEME)
    document.documentElement.setAttribute("data-theme", "light")
    if (term) term.setOption('theme', { background: '#ddd', foreground: '#111' });
    window.localStorage.ice40DarkMode = "false"
}

function darkMode() {
    editor.setTheme(EDITOR_DARK_THEME)
    document.documentElement.setAttribute("data-theme", "dark")
    if (term) term.setOption('theme', { background: '#111', foreground: '#ddd' });
    window.localStorage.ice40DarkMode = "true"
}

function toggleAutoTerminal() {
    if (window.localStorage.autoTerminalSwitch == "false" || !window.localStorage.autoTerminalSwitch) {
        document.documentElement.setAttribute("autoterminal-option", "true")
        window.localStorage.autoTerminalSwitch = "true"
    } else if (window.localStorage.autoTerminalSwitch == "true") {
        document.documentElement.setAttribute("autoterminal-option", "false")
        window.localStorage.autoTerminalSwitch = "false"
    }
}

function toggleDarkMode() {
    if (window.localStorage.ice40DarkMode == "false") {
        // then go to dark mode
        darkMode()
    } else if (window.localStorage.ice40DarkMode == "true") {
        lightMode()
    }
    update_status(CURRENT_STATUS[0], CURRENT_STATUS[1])

    clearEditorErrors()
    errors.forEach(elm => {
        line = parseInt(errors[elm].row)
        error_id.push(editor.session.addMarker(new Range(line, 0, line, 1),
            window.localStorage.ice40DarkMode == "false" ? "ace-line-error-dark" : "ace-line-error-light",
            "fullLine"));
    })
}

function toggleInstantSim() {
    if (window.localStorage.simulateOnSave == "false") {
        window.localStorage.simulateOnSave = "true"
        document.documentElement.setAttribute("simulate-on-save", "true")
    } else if (window.localStorage.simulateOnSave == "true") {
        window.localStorage.simulateOnSave = "false"
        document.documentElement.setAttribute("simulate-on-save", "false")
    }
}

function toggleSimType() {
    if (window.localStorage.simulationType == "source") {
        window.localStorage.simulationType = "mapped"
        document.documentElement.setAttribute("simulation-type", "mapped")
    } else if (window.localStorage.simulationType == "mapped") {
        window.localStorage.simulationType = "source"
        document.documentElement.setAttribute("simulation-type", "source")
    }
}

function toggleAutocomplete() {
    if (window.localStorage.codeAutocomplete == "false") {
        window.localStorage.codeAutocomplete = "true"
        document.documentElement.setAttribute("code-autocomplete", "true")
        editor.setOption("enableBasicAutocompletion", true)
        editor.setOption("enableSnippets", true)
        editor.setOption("enableLiveAutocompletion", true)
    } else if (window.localStorage.codeAutocomplete == "true") {
        window.localStorage.codeAutocomplete = "false"
        document.documentElement.setAttribute("code-autocomplete", "false")
        editor.setOption("enableBasicAutocompletion", false)
        editor.setOption("enableSnippets", false)
        editor.setOption("enableLiveAutocompletion", false)
    }
}

var editor_tab_list = {}

function openTabsFromStorage() {
    var filesystem = JSON.parse(localStorage.filesystem);
    var opened = [];

    Object.keys(filesystem).forEach(workspace => {
        if (Object.keys(filesystem[workspace]).length == 0) return
        if (workspace != localStorage.currentWorkspace) return
        getWorkspace(filesystem, workspace).forEach(file => {
            var f = typeof(file) == "string" ? JSON.parse(file) : file;
            if (f.state == 'closed') {
                return
            }
            if (opened.filter(f => f == f.name).length > 0) { // already added
                return
            }
            openFileFromStorage(f, workspace, false)
            opened.push(f)
        })
    })

    if ($('.editor-tab-workspace[name="' + localStorage.currentWorkspace + '"]').length == 0) {
        setCurrentWorkspace('default')
    }
    var tmp = localStorage.active_tab
    selectWorkspaceByElement($('.editor-tab-workspace[name="' + localStorage.currentWorkspace + '"]', false)[0]).then(res => {
        try {
            selectTabByElement($('[name="' + JSON.parse(tmp)[0] + '"][workspace="' + JSON.parse(tmp)[1] + '"]')[0])
        } catch (err) {
            console.log("undefined tab, redirecting to first one...")
            selectTabByElement($('.editor-tab[id!="editor-add-tab"]')[0])
        }
    }).catch(err => {
        console.error(err)
    })
}

function openFileFromStorage(f, ws, force) {
    if (!force && f.state == 'closed') return;
    if (f.name.endsWith('.v')) {
        f.name = f.name.replace(/\.v/g, '.sv');
    }
    f.workspace = ws;
    var sess = new EditSession(f.code);
    editor_tab_list[f.workspace][f.name] = sess;
    delete f.code;
    addTab(f);
}

// added spring 2021 for archival reasons
// must NOT be used to ease public distribution of what should 
// be your **private** code.
function zipStorage() {
    var fs = getFilesystem();
    var zip = new JSZip();
    for (var fldr in fs) {
        var zipfldr = zip.folder(fldr);
        var wksp = getWorkspace(fs, fldr);
        wksp.forEach(e => {
            zipfldr.file(e.name, e.code, { createFolders: true, date: new Date(e.mtime) });
        });
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
        var link = document.createElement("a");
        var username = 'demouser';
        link.href = URL.createObjectURL(content);
        link.download = username + "_simulator.zip";
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
}

function changeBoardTheme(theme) {
    if (typeof window.localStorage.evalboardcustomtheme != "undefined") {
        try {
            var cnva = JSON.parse(window.localStorage.evalboardcustomtheme)['cnva'];
            var ltrs = JSON.parse(window.localStorage.evalboardcustomtheme)['ltrs'];
            var caps = JSON.parse(window.localStorage.evalboardcustomtheme)['caps'];
            var fnwt = JSON.parse(window.localStorage.evalboardcustomtheme)['fnwt'];
            LIT_SS = JSON.parse(window.localStorage.evalboardcustomtheme)['lit_ss'] || "#f00";
            BLANK_SS = JSON.parse(window.localStorage.evalboardcustomtheme)['blank_ss'] || "#222";
            LIT_RED = JSON.parse(window.localStorage.evalboardcustomtheme)['lit_red'] || "#f00";
            BLANK_RED = JSON.parse(window.localStorage.evalboardcustomtheme)['blank_red'] || "#300";
            var lftred = document.getElementsByClassName("lftred");
            var rgtred = document.getElementsByClassName("rgtred");
            for (var i = 7; i >= 0; i = i - 1) {
                lftred[i].setAttribute("fill", BLANK_RED); // BLANK_RED = "#300"
                rgtred[i].setAttribute("fill", BLANK_RED); // BLANK_RED = "#300"
                for (var j = 7; j >= 0; j = j - 1) {
                    ss = document.getElementsByClassName("ss" + i.toString() + "_line");
                    ss[j].setAttribute("stroke", BLANK_SS); // BLANK_SS = "#222"
                }
            }
        } catch (err) {
            window.prompt(`An error occurred trying to set your custom evaluation board colors.  
			Set them up in the dev console again.  The format is in the box below.  
			Change the value of "cnva" for the background, "ltrs" for the letter color, "caps" for the 
			button color, and "fnwt" for the font weight.`.replace(/[ \t\n]{2,}/g, ' '),
                `window.localStorage.evalboardcustomtheme = JSON.stringify({"cnva": "#041f05", "ltrs": 
			"black", "caps": "#aaa", "fnwt": "bold", "lit_ss": "#f00", blank_ss: "#222", lit_red: "#f00", 
			blank_red: "#300"}); changeBoardTheme("null")`.replace(/[ \t\n]{2,}/g, ' '));
            console.log(err);
        }
    }
    if (!cnva) {
        switch (theme) {
            case "Original":
                cnva = "#041f05";
                ltrs = "black";
                caps = "#aaa";
                fnwt = "bold";
                break;
            case "Dark Original":
                cnva = "#041005";
                ltrs = "black";
                caps = "#aaa";
                fnwt = "bold";
                break;
            case "Modern":
                cnva = "#17183f";
                ltrs = "white";
                caps = "#333666";
                fnwt = "normal";
                break;
        }
    }
    document.getElementById("canvas_background").setAttribute("fill", cnva);
    Array.from(document.getElementsByClassName("inputbutton")).forEach(function(el) {
        el.setAttribute("fill", caps);
        el.setAttribute("font-weight", fnwt)
    });
    Array.from(document.getElementsByClassName("svg_text")).forEach(function(el) {
        el.setAttribute("fill", ltrs);
        el.setAttribute("font-weight", fnwt)
    });
    window.localStorage.evalboardtheme = theme;
}

function setGlobalWkspSettings(all) {
    localStorage['workspace_settings'] = JSON.stringify(all);
}

function getGlobalWkspSettings() {
    if (!('workspace_settings' in localStorage)) {
        localStorage['workspace_settings'] = '{}';
        return {};
    }
    return JSON.parse(localStorage['workspace_settings']);
}

function getWkspSettings(wksp, all = getGlobalWkspSettings()) {
    if (!(wksp in all)) {
        return undefined;
    } else {
        return all[wksp];
    }
}

function setWkspSettings(wksp, val, all=JSON.parse(localStorage['workspace_settings'])) {
	all[wksp] = val;
	localStorage['workspace_settings'] = JSON.stringify(all);
}

// first-time load, check in on support modules
$.get({
    url: "/support",
    contentType: 'application/json',
    success: function(response) {
        window.supportModules = response;
        try {
            var fs = getFilesystem();
        } catch(err) {
            var fs = {};
        }
        if (Object.keys(fs).length > 0) {
            for (var wksp in fs) {
                var wksp_saved = getWkspSettings(wksp) || { "support": [], "testbench": "" };
                wksp_saved["support"].forEach(s => {
                    if (!window.supportModules.includes(s)) {
                        wksp_saved["support"] = wksp_saved["support"].filter(f => f != s);
                    }
                });
                setWkspSettings(wksp, wksp_saved);
            }
        }
    }
});

function toggleWorkspaceSettings(event, tgl) {
    if (tgl) {
        // check the tab the settings gear icon was clicked for workspace name
        var wksp = event.currentTarget.parentNode.parentNode.querySelector('label').textContent;
        // if it doesn't exist, create an empty object so rest of the code doesn't fail
        var wksp_saved = getWkspSettings(wksp);
        if (wksp_saved == undefined) {
            var wksp_saved = { "support": [], "testbench": "" };
            setWkspSettings(wksp, wksp_saved);
        }
        $('#wksp_settings_title').text(`Workspace Settings for '${wksp}'`);
        blurMainView(0);
        $('#overlay_6').animate({ 'opacity': '1' }, 250, () => {
            $('#overlay_6').css('display', 'flex');
        });
        if ($('#moduleinitial').length > 0) {
            $('#wksp_module_enable').children().remove();
        }
        var existing = Array.from($('.wksp_module')).map(st => st.querySelector('label').innerHTML);
        window.supportModules.forEach(f => {
            if (!(existing.includes(f))) {
                document.querySelector('#wksp_module_enable').innerHTML += `<div class="wksp_module">
				<i class="fa fa-check-square module_check"></i>
				<label class="module_name">${f}</label></div>`;
            }
        });
        Array.from($('.wksp_module')).forEach(st => {
            if (wksp_saved["support"].includes(st.querySelector('label').innerHTML)) {
                st.querySelector('i').style.color = 'var(--display-4-color)';
            } else {
                st.querySelector('i').style.color = '';
            }
        });
        if (Array.from($('#select_testbench option')).map(e => e.textContent).includes(wksp_saved['testbench'])) {
            document.querySelector("#select_testbench").value = wksp_saved['testbench'];
        } else {
            // if the testbench was removed, don't show it and use the last selected option instead
            wksp_saved['testbench'] = document.querySelector("#select_testbench").value;
            // save it too so we don't have to keep setting the testbench every time wksp settings is opened
            setWkspSettings(wksp, wksp_saved);
        }
    } else {
        $('#overlay_6').animate({ 'opacity': '0' }, 250, () => {
            $('#overlay_6').css('display', 'none');
        });
        blurMainView(1);
    }
}

function selectWorkspaceByElement(elm, force) {
    // don't accidentally select the workspace-add button if this is somehow called
    if (elm.id == 'editor-tab-workspace-add') return;
        // tell everyone that workspace has changed
    window.active_workspace = $('.editor-tab-workspace').filter((i, e) => e.style.background).attr('name');
    // add settings icon for this workspace:
    document.querySelector('#div_workspace_gear')?.remove();
    document.querySelector('#workspace_gear')?.remove();
    elm.innerHTML += `<div id="div_workspace_gear"><i class="fa fa-cog" onclick="javascript:toggleWorkspaceSettings(event, true)" id="workspace_gear"></i></div>`
        // save last tab hopefully?
    if (window.active_tab && $(window.active_tab).attr('workspace') in editor_tab_list && editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')]) {
        editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].setValue(editor.session.getValue())
    }
    // 
    // remove current tabs
    $('.editor-tab[id!=editor-tab-add]').remove()
        // open workspace tabs
    return new Promise((resolve, reject) => {
        browserOpenWorkspace(elm.getAttribute('name'), force).then(res => {
            resolve(true);
        }).catch(err => {
            reject(err);
        });
    });
}

function selectTabByElement(elm) {
	// save last tab hopefully?
	if (window.active_tab && $(window.active_tab).attr('workspace') in editor_tab_list && editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')]) {
		// save tab undo/redo history
		var historyStack = [JSON.stringify(editor.getSession().getUndoManager().$undoStack), JSON.stringify(editor.getSession().getUndoManager().$redoStack)];
		window.undoManagers[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].historyStack = historyStack;
		// save tab cursor position
		window.undoManagers[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].cursorPos = editor.getCursorPosition();
		editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].setValue(editor.session.getValue());
	}
	// clears background attr from all tabs
	$('.editor-tab').removeClass('editor-tab-selected');
	elm.classList.add('editor-tab-selected');

	window.active_tab = elm;

	// set ace editor mode based on file extension
	if (elm.getAttribute('name').endsWith('.mem')) {
		editor.session.setMode("ace/mode/text");
	} else if (elm.getAttribute('name').endsWith('.json')) {
		editor.session.setMode("ace/mode/json");
	} else {
		editor.session.setMode("ace/mode/verilog");
	}
	
	// make sure undomanager for tab exists before setting it, otherwise create a new one
	// it is CRUCIAL that this happen before code is changed - otherwise the actual code swap will be saved in the UndoManager
	if (!($(elm).attr('workspace') in window.undoManagers)) {
		window.undoManagers[$(elm).attr('workspace')] = {};
	}
	if (!($(elm).attr('name') in window.undoManagers[$(elm).attr('workspace')])) {
		window.undoManagers[$(elm).attr('workspace')][$(elm).attr('name')] = {'historyStack': ["[]", "[]"], 'cursorPos': {'row': 0, 'column': 0}};
	}

	// if tab exists, find its code and load it
	if ($(elm).attr('workspace') in editor_tab_list && editor_tab_list[$(elm).attr('workspace')][$(elm).attr('name')]) {
		var code = (editor_tab_list[$(elm).attr('workspace')][$(elm).attr('name')]).getValue();
		var cursorPos = window.undoManagers[$(elm).attr('workspace')][$(elm).attr('name')].cursorPos;
		editor.getSession().setValue(code);
		editor.moveCursorToPosition(cursorPos);
		// otherwise load the template code
	} else {
		editor.getSession().setValue(window.localStorage.original_code, -1);
	}
	
	// once value is set, NOW bring back the undo/redo history
	var undo_mgr = editor.getSession().getUndoManager();
	undo_mgr.$undoStack = JSON.parse(window.undoManagers[$(elm).attr('workspace')][$(elm).attr('name')].historyStack[0]);
	undo_mgr.$redoStack = JSON.parse(window.undoManagers[$(elm).attr('workspace')][$(elm).attr('name')].historyStack[1]);
	editor.getSession().setUndoManager(undo_mgr);
	
	// set up errors for tab
	if (elm.getAttribute('errors') != null) {
		$(elm).css('border', '')
		clearEditorErrors()
		JSON.parse(elm.getAttribute("errors")).forEach(n => {
			var num = parseInt(n)
			error_id.push(editor.session.addMarker(new Range(num - 1, 0, num - 1, 1), localStorage.ice40DarkMode == "true" ? "ace-line-error-dark" : "ace-line-error-light", "fullLine"))
		})
		editor.getSession().setAnnotations(
			errors.filter(e => e.file == elm.getAttribute('name') && e.workspace == elm.getAttribute('workspace'))
		)
	}

	// finally, make sure the cursor is active (setValue removes focus)
	editor.focus();
}

function selectTabByEvent(event) {
	if (event.target.classList.contains('tab-close') || event.target.classList.contains('wksp-tab-close') || event.target.id == "editor-tab-add" || $(event.target).nodeName == "PATH")
		return
	else if ($(event.target).prop('tagName') != "LABEL" && !$(event.target).classList.includes('editor-tab-selected')) {
		selectTabByElement(event.target)
	}
}

function addTab(tabdata) {
    if ($('.editor-tab[name="' + tabdata.name + '"][workspace="' + tabdata.workspace + '"]').length > 0) {
        return
    }
    element = '<div class="editor-tab" ' +
        'name="' + tabdata.name + '" ' +
        'ctime="' + tabdata.ctime + '" ' +
        'mtime="' + tabdata.mtime + '" ' +
        'state="' + tabdata.state + '" ' +
        'draggable="true" ' +
        'ondragstart="startTabDrag(event)" ' +
        'workspace="' + tabdata.workspace + '">' +
        '<label class="tab-label unselectable" spellcheck="false" contenteditable="false">' +
        (tabdata.name.startsWith("undefined") ? "Set name..." : tabdata.name) +
        '</label>' +
        '<i class="fa fa-times tab-close"></i>' +
        '</div>'
    $('.editor-tab#editor-tab-add').before($(element))
    return $(element)
}

function startTabDrag(e) {
    e.dataTransfer.setData("data", [e.currentTarget.getAttribute('name'), e.currentTarget.getAttribute('workspace')]);
}

function allowTabDrag(e) {
    e.preventDefault()
}

function tabDrag(e) {
    e.preventDefault()
    var name, old_wksp;
    [name, old_wksp] = e.dataTransfer.getData("data").split(",")

    if (e.currentTarget.getAttribute('name') == old_wksp) return

    var nws = getWorkspace(getFilesystem(), e.currentTarget.getAttribute('name'))
    if (nws.filter(e => e.name == name).length > 0) {
        alert('Error: filename already exists.  Change the name before moving tabs.')
        return
    } else if ($('.editor-tab').length == 2) {
        var cfm = confirm('Warning: There is only one file in this workspace, and moving it out will delete this workspace.  Continue?')
        if (old_wksp == 'default') {
            alert("Error: you cannot delete the 'default' workspace.  Try again with another workspace.")
            return
        }
        if (!cfm) {
            return
        }
    }

    var file = getWorkspace(getFilesystem(), old_wksp).filter(e => e.name == name)[0];
    var ws = getWorkspace(getFilesystem(), old_wksp).filter(e => e.name != name);
    if (ws.length == 0) {
        $('.editor-tab-workspace[name="' + old_wksp + '"]').remove()
        $('#browser_' + old_wksp).remove()
        delete editor_tab_list[old_wksp]
        var fs = getFilesystem()
        delete fs[old_wksp]
        saveFilesystem(fs)
    } else {
        saveWorkspace(old_wksp, ws)
    }

    nws.push(file)
    saveWorkspace(e.currentTarget.getAttribute('name'), nws)

    selectWorkspaceByElement(e.currentTarget, false)
    browserLoadFilesystem()
}

function addWorkspace(name) {
    element = '<div class="editor-tab-workspace" ' +
        'name="' + name + '" ' +
        'ondragover="allowTabDrag(event)" ' +
        'ondrop="tabDrag(event)" ' +
        'state="open">' +
        '<label class="tab-label-workspace" style="margin-bottom: 0" spellcheck="false" contenteditable="false">' +
        name +
        '</label>' +
        '</div>'
    $('.editor-tab-workspace#editor-tab-workspace-add').before($(element))
    return $(element)
}

function tabExists(name, workspace) {
    return new Promise((resolve, reject) => {
        try {
            Array.from($('#editor-tab-header').children()).forEach(e => {
                if (e.getAttribute('name') == name && e.getAttribute('workspace') == workspace)
                    resolve(e)
            })
            resolve(false)
        } catch (err) {
            reject(err)
        }
    })
}

var term = null;

function initializeTerminalSafe() {
    // safety - if terminal is already initialized, just do resize, set theme and leave
    if (term) {
        term.resize(parseInt($("#editor-workspace").width() / 10.5), parseInt($("#editor-workspace").height() / 22.5))
    }
    if ($("#terminal").children().length == 0) {
        term = new Terminal();
        term.resize(parseInt($("#editor-workspace").width() / 10.5), parseInt($("#editor-workspace").height() / 22.5))
        term.open(document.getElementById('terminal'));
        if (!ws || ws.readyState != 1)
            term.write("Start a simulation to view any data written from the FPGA to this terminal.\r\n")
        term.onKey((key) => {
            if (key.domEvent.type == 'keypress' && key.domEvent.which != 32) return
            if (key.domEvent.ctrlKey && key.domEvent.which == 83) {
                if (localStorage.simulateOnSave == "true")
                    ice40hx8k_handler()
                return
            }
            txdata_fifo.push(key)
            sendInputs()
        });
    }
    if (window.localStorage.ice40DarkMode == "true")
        term.setOption('theme', { background: '#111', foreground: '#ddd' });
    else
        term.setOption('theme', { background: '#ddd', foreground: '#111' });
}

function switchView(sw, opt = 'nf') {
    switch (sw) {
        case 0:
            $("#view_code").addClass("btn-view-active")
            $("#view_terminal").removeClass("btn-view-active")
            $("#view_output").removeClass("btn-view-active")
            $("#codemirror_box").css('display', '');
            $("#resize-editor").css('display', '');
            $("#editor-tab-header,#editor-tab-workspace-header").animate({ 'opacity': '1' }, opt ? 10 : 1000);
            $("#outputview").css('display', 'none');
            $("#terminal").css('display', 'none');
            break;
        case 1:
            $("#view_code").removeClass("btn-view-active")
            $("#view_terminal").addClass("btn-view-active")
            $("#view_output").removeClass("btn-view-active")
            $("#codemirror_box").css('display', 'none');
            $("#resize-editor").css('display', 'none');
            $("#editor-tab-header,#editor-tab-workspace-header").animate({ 'opacity': '0' }, opt ? 10 : 1000);
            $("#outputview").css('display', 'none');
            $("#terminal").css('display', '');
            $('#terminal').width($("#editor-workspace").width());
            initializeTerminalSafe()
            break;
        case 2:
            $("#view_code").removeClass("btn-view-active")
            $("#view_terminal").removeClass("btn-view-active")
            $("#view_output").addClass("btn-view-active")
            $("#codemirror_box").css('display', 'none');
            $("#resize-editor").css('display', 'none');
            $("#editor-tab-header,#editor-tab-workspace-header").animate({ 'opacity': '0' }, opt ? 10 : 1000);
            $("#terminal").css('display', 'none');
            $("#outputview").css('display', '');
            $("#outputview").width($("#editor-workspace").width())
            break;
    }
    $("#outputview")[0].scrollTop = $("#outputview")[0].scrollHeight;
}

function resizeHandler() {
    if (term)
        term.resize(parseInt($("#editor-workspace").width() / 10.5), parseInt($("#editor-workspace").height() / 22.5))
    document.getElementById("terminal").style.width = document.getElementById("editor-workspace").style.width
    document.getElementById("outputview").style.width = document.getElementById("editor-workspace").style.width
}

function toggleLocalSimulation() {
    if (window.localStorage.localsimulation == "false") {
        window.localStorage.localsimulation = "true"
        document.documentElement.setAttribute("localsimulation-option", "true")
    } else if (window.localStorage.localsimulation == "true") {
        window.localStorage.localsimulation = "false"
        document.documentElement.setAttribute("localsimulation-option", "false")
    }
}

function downloadJSON() {
    // thanks https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.profile_json));
    element.setAttribute('download', "profile.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function toggleProfile() {
    if ($("#overlay_4").css('opacity') == "0") {
        blurMainView(0);
        $("#overlay_4").css('display', 'flex');
        $("#overlay_4").animate({ 'opacity': '1' }, 200);
        $.get({ url: "/profile", cache: false }, function(data) {
            window.profile_json = data
            $("#loading").animate({ 'opacity': '0' }, 200, () => {
                $("#loading").css('display', 'none');
                $("#profile_visits2").text(JSON.parse(window.profile_json).visits);
                $("#profile_sims2").text(JSON.parse(window.profile_json).lifesims);
                $("#profile_demoes2").text(JSON.parse(window.profile_json).demoes);
                $("#profile_errors2").text(JSON.parse(window.profile_json)?.errors || 0);
                $(".profile_text:last-child").css('opacity', 1);
                $(".profile_data").css('display', 'block');
                $(".profile_data").animate({ 'opacity': '1' }, 200);
            })
        });
    } else {
        $("#overlay_4,.profile_data").animate({ 'opacity': '0' }, 200, () => {
            $(".profile_text:last-child").css('opacity', 0);
            $("#overlay_4,.profile_data").css('display', 'none');
            $("#loading").css('opacity', '1');
            $("#loading").css('display', '');
            blurMainView(1);
        })
    }
}