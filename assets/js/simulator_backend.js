var shiftKey = false;
var STATUS_READY = "#e0e0e0"
var SIM_RUNNING = "#e0f0e0"
var CODE_ERROR = "#f0e0e0"
var SERVER_DOWN = "#eecccc"
var DEMO_RUNNING = "#dafae6"
var lightModeTheme = {
	"STATUS_READY": "#e0e0e0",
	"SIM_RUNNING": "#e0f0e0",
	"CODE_ERROR": "#f0e0e0",
	"SERVER_DOWN": "#eecccc",
	"DEMO_RUNNING": "#dafae6",
	"SYNTHESIS": "#fefe7a",
	"CONNECTING": "#f4f47a"
}
var darkModeTheme = {
	"STATUS_READY": "#444",
	"SIM_RUNNING": "#464",
	"CODE_ERROR": "#644",
	"SERVER_DOWN": "#533",
	"DEMO_RUNNING": "#353",
	"SYNTHESIS": "#687509",
	"CONNECTING": "#585509"
}

var EDITOR_DARK_THEME = "ace/theme/chaos" // localStorage.ace_dark_theme
var EDITOR_LIGHT_THEME = "ace/theme/chrome" // localStorage.ace_light_theme
var pending = null;
var lftred = "";
var rgtred = "";
var rgbled = "";
var template_code = "270sim_source_uart.sv"

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
}
else if (localStorage.simulateOnSave == "false") {
	document.documentElement.setAttribute("simulate-on-save", "false")
}
else if (!localStorage.simulateOnSave) {
	// Please use this extremely helpful shortcut
	localStorage.simulateOnSave = true
	document.documentElement.setAttribute("simulate-on-save", "true")
}

if (localStorage.codeAutocomplete == "true") {
	document.documentElement.setAttribute("code-autocomplete", "true")
	editor.setOption ("enableBasicAutocompletion", true)
	editor.setOption ("enableSnippets", true)
	editor.setOption ("enableLiveAutocompletion", true)
}
else if (localStorage.codeAutocomplete == "false") {
	document.documentElement.setAttribute("code-autocomplete", "false")
	editor.setOption ("enableBasicAutocompletion", false)
	editor.setOption ("enableSnippets", false)
	editor.setOption ("enableLiveAutocompletion", false)
}

button = document.getElementsByClassName("btn-info")[0]
button.isMouseOver = false

function change_password() {
	console.log('change_password')
	$.post({
		url: window.location.href + "user/passwd",
		contentType: 'application/json',
		data: JSON.stringify({ 'password': $("#passwd").prop("value") }),
		success: function (response) {
			if (response.status == "success")
				alert("Password successfully changed!")
			else
				alert("Error: " + response.reason)
		}
	})
}

// $(".btn-info").on("keydown keyup mouseover mousemove mouseenter", (event) => {
// 	if (event.ctrlKey && $(".btn-info").text() == "Reload Code")
// 		$(".btn-info").text("Load Template")
// })

// $(".btn-info").on("keyup mouseleave", () => {
// 	if (Object.keys (window.localStorage.filesystem).length > 1)
// 		$(".btn-info").text("Reload Code")
// 	else
// 		$(".btn-info").text("Load Template")
// })

// a-f, w-z, 0-9, ctrl, alt, shift
curmap = {}
bakmap = {}

$(document).bind("keydown", "ctrl+o", function (e) {
	if (e.ctrlKey && e.which == 79) {
		e.preventDefault();
		openWorkspaceManager('open')
	}
});

function populateKeystate(e) {
	e = e || event;
	if (curmap[e.key] && e.type == "keydown" || e.altKey)
		return false
    if (e.key == "Shift" && e.type == 'keyup') {
        window.holdoverShift = e
        setTimeout (() => {
            curmap[window.holdoverShift.key] = window.holdoverShift.type == "keydown" ? true : false
        }, 50)
    }
    else {
        curmap[e.key] = e.type == "keydown" ? true : false
    }
	btn0 = document.getElementById("key0").getAttribute("pressed")
	btn3 = document.getElementById("key3").getAttribute("pressed")
	btnW = document.getElementById("keyW").getAttribute("pressed")
	if (bakmap[e.key] != curmap[e.key])
		setTimeout(function () {
			if (!(document.activeElement.className.includes("ace")) &&
				!(document.activeElement.className.includes("tab-label")) &&
				!(document.getElementById("overlay").style.display == "flex") &&
				!(document.getElementById("overlay_2").style.display == "flex") &&
				!(document.getElementById("overlay_3").style.display == "flex") &&
				 (document.activeElement == document.body) 
			    ) 
			{
				var isNum = e.which >= 48 && e.which <= 57
				var isHex = (e.which >= 65 && e.which <= 70) || (e.which >= 97 && e.which <= 102)
				var isWXYZ = (e.which >= 87 && e.which <= 90) || (e.which >= 119 && e.which <= 122)
				var isNumpad = e.code != undefined && e.code.includes ("Numpad")
				if (e.key && e.key.match (/^[0-9a-fw-z]$/i) || ((isNum || isHex || isWXYZ || isNumpad) && (e.shiftKey || curmap ["Shift"]))) // all button options
					toggle_button(e)
				else if (document.getElementsByClassName("btn-info")[0].isMouseOver == true && e.ctrlKey)
					load_button.innerHTML = "Load Template"
			}
			else if (document.activeElement.id == "passwd" && e.which == 13 && e.type == "keydown")
				change_password()

			if (e.which == 27) {
				$('.overlay').css ('display', 'none')
				$('.overlay').css ('opacity', '0')
				blurMainView(1)

				if (localStorage.ice40DarkMode == "false") {
					while (document.getElementsByClassName("ace-line-error-dark").length != 0)
						document.getElementsByClassName("ace-line-error-dark")[0].classList.replace("ace-line-error-dark", "ace-line-error-light")
				}
				else {
					while (document.getElementsByClassName("ace-line-error-light").length != 0)
						document.getElementsByClassName("ace-line-error-light")[0].classList.replace("ace-line-error-light", "ace-line-error-dark")
				}
			}
			else if (e.which == 46 && $('#overlay_workspace').css ('display') == 'flex') {
				e.preventDefault()
				browserDeleteSelectedFiledirs()
			}
			bakmap = JSON.parse (JSON.stringify (curmap))
		}, 10)
}

onkeyup = onkeydown =
	function (e) {
		setTimeout(function () { populateKeystate(e) }, 1)
	};

function togglePassword() {
	if (document.getElementById("passwd").type == "password") {
		document.getElementById("passwd").type = "text"
		document.getElementById("toggle_eye").style["opacity"] = 0.5
	}
	else {
		document.getElementById("passwd").type = "password"
		document.getElementById("toggle_eye").style["opacity"] = 1
	}
}

function ctrl_alt_del(event, key) {
	var cad = [[document.getElementById("key0"),
	document.getElementById("text0")], [document.getElementById("key3"),
	document.getElementById("text3")], [document.getElementById("KeyW"),
	document.getElementById("textW")]];

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
		}
		else if (key_element.getAttribute("pressed") == "false") {
			key_element.setAttribute("x", x_loc + 10)
			key_element.setAttribute("y", y_loc + 10)
			key_element.setAttribute("width", cur_width - 20)
			key_element.setAttribute("height", cur_height - 20)
			key_element.setAttribute("pressed", true)
			text_element.setAttribute("font-size", 24)
		}
	}
	send_inputs()
}

function toggle_button(event, mousekey) {
	if (event.ctrlKey || (event.ctrlKey && event.shiftKey) || event.altKey || event.metaKey) {
		return false;
	}

	if (event.type.includes("mouse")) {
		key_element = document.getElementById(mousekey)
		text_element = document.getElementById(mousekey.replace ('key', 'text'))
	}
	else if (event.code.includes ("Numpad") || event.code.includes ("Digit")) {
		key_element = document.getElementById(event.code.replace (/Numpad|Digit/g, 'key'))
		text_element = document.getElementById(event.code.replace (/Numpad|Digit/g, 'text'))
	}
	else {
		key_element = document.getElementById("key" + event.key.toUpperCase())
		text_element = document.getElementById("text" + event.key.toUpperCase())
	}

	x_loc = parseInt(key_element.getAttribute("x"))
	y_loc = parseInt(key_element.getAttribute("y"))
	cur_width = parseInt(key_element.getAttribute("width"))
	cur_height = parseInt(key_element.getAttribute("height"))
	shiftKey = event.shiftKey || curmap ["Shift"]

	if ((key_element.getAttribute("pressed") == "true" && (!shiftKey || event.type == "mousedown" || event.type == "keydown"))) {
		key_element.setAttribute("x", x_loc - 10)
		key_element.setAttribute("y", y_loc - 10)
		key_element.setAttribute("width", cur_width + 20)
		key_element.setAttribute("height", cur_height + 20)
		key_element.setAttribute("pressed", false)
		text_element.setAttribute("font-size", 28)
		shiftKey = false
		send_inputs()
	}
	else if (key_element.getAttribute("pressed") == "false" && (event.type == "mousedown" || event.type == "keydown")) {
		key_element.setAttribute("x", x_loc + 10)
		key_element.setAttribute("y", y_loc + 10)
		key_element.setAttribute("width", cur_width - 20)
		key_element.setAttribute("height", cur_height - 20)
		key_element.setAttribute("pressed", true)
		text_element.setAttribute("font-size", 24)
		shiftKey = event.shiftKey
		send_inputs()
	}
}

var sentInput = '';

function send_inputs() {
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
		binary = Array.from (extract.key.charCodeAt (0).toString (2)).map (x => x == '0' ? 'f' : 't').join ('')
		binary = "f".repeat (8 - binary.length) + binary
		binary = "t" + binary
	}
	else {
		binary = "f" + binary
	}
	buttonmap = "t" + binary + buttonmap
	sentInput = buttonmap
	ws.send(buttonmap)
}

var saved_txclk = '-1';
var txdata_fifo = [];

function set_outputs(json_out) {
	/*  {LFTRED: x, RGTRED: x, RGBLED: x, SS7: x, SS6: x, SS5: x ... SS0: x}  */
	//  also includes {TXDATA: x, TXCLK: x, RXCLK: x}
	lftred = document.getElementsByClassName("lftred")
	rgtred = document.getElementsByClassName("rgtred")
	rgbled = document.getElementById("rgbled")

	for (var i = 7; i >= 0; i = i - 1) {
		ss = document.getElementsByClassName("ss" + i.toString() + "_line")
		for (var j = 7; j >= 0; j = j - 1) {
			if ((parseInt(json_out["SS" + i]) & Math.pow(2, (7 - j))) > 0)
				ss[j].setAttribute("stroke", "#f00")
			else
				ss[j].setAttribute("stroke", "#222")
		}

		if ((parseInt(json_out["LFTRED"]) & Math.pow(2, i)) > 0)
			lftred[i].setAttribute("fill", "#f00")
		else
			lftred[i].setAttribute("fill", "#300")

		if ((parseInt(json_out["RGTRED"]) & Math.pow(2, i)) > 0)
			rgtred[i].setAttribute("fill", "#f00")
		else
			rgtred[i].setAttribute("fill", "#300")
	}

	color = "#"
	color += json_out["REDLED"] > 0 ? "ff" : "00";
	color += json_out["GRNLED"] > 0 ? "ff" : "00";
	color += json_out["BLULED"] > 0 ? "ff" : "00";

	if (color == "#000")
		color = "#111"
	//     console.log (color)
	rgbled.setAttribute("fill", color)

	if (json_out ['RXCLK'] == '1')
		ws.send ('tf' + sentInput.slice (2))

	if (json_out ['TXCLK'] == '1' && saved_txclk == '0')
		term.write (String.fromCharCode (json_out ["TXDATA"]))
	saved_txclk = json_out ['TXCLK']
}

function ice40hx8k_handler() {
	time = new Date().getTime() / 1000

	// if (editor.session.getValue().includes("’")) {
	// 	// alert("Copying code from the notes without typing it out? Tsk tsk...\n" +
	// 	// 	"The code you copied intentionally has special characters that " +
	// 	// 	"cannot be parsed by Yosys or CVC. We highly recommend that you " +
	// 	// 	"type out the entire code segment you are trying to use.\n" +
	// 	// 	"If you really did type it out, and you're still seeing this message, " +
	// 	// 	"contact the head TA.")
	// 	// return
	// 	alert ("We found special characters in your code that indicate you copied it.  Considering that there is quite a lot of provided code, " + 
	// 		   "we will permit it for Lab 13.  These characters will be automatically removed from your code before it is sent for simulation.")
	// 	editor.setValue (editor.getValue().replace (/’/g, "'"))
	// }
	if (editor.session.getValue().match(/\/\/ ?module top|(\/\* ?\n?)module top/)) {
		alert("It seems like you have commented out or removed the top module. Your code will not compile!")
		return
	}

	// saveAllFilesToStorage()
	update_status("STATUS_READY", "Status: Ready")

	if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
		ws.onmessage = function () { }
		ws.onclose = function () { }
		ws.close()
		set_outputs({
			"LFTRED": 0, "RGTRED": 0, "RGBLED": 0, "SS7": 0, "SS6": 0,
			"SS5": 0, "SS4": 0, "SS3": 0, "SS2": 0, "SS1": 0, "SS0": 0
		})
	}
	ws = new WebSocket("ws://" + window.location.host + "/")
	ws.currentWorkspace = window.active_tab.getAttribute ('workspace')
	Array.from ($('.editor-tab')).forEach (e => e.removeAttribute ('errors'))

	update_status("CONNECTING", "Status: Connecting...")
	var messages = ""
	var synthesis_interval = ""
	ws.onmessage = function (event) {
		// editor.getSession().clearAnnotations ()
		if (event.data.includes("Processing Verilog code...")) {
			update_status("SYNTHESIS", "Status: Synthesizing...")
			messages = event.data + "\n"
			synthesis_interval = setInterval(function () {
				if (document.getElementById("status-text").innerHTML == "Status: Synthesizing...")
					update_status("SYNTHESIS", "Status: Synthesizing..")
				else if (document.getElementById("status-text").innerHTML == "Status: Synthesizing..")
					update_status("SYNTHESIS", "Status: Synthesizing.")
				else if (document.getElementById("status-text").innerHTML == "Status: Synthesizing.")
					update_status("SYNTHESIS", "Status: Synthesizing")
				else if (document.getElementById("status-text").innerHTML == "Status: Synthesizing")
					update_status("SYNTHESIS", "Status: Synthesizing...")
			}, 500)
		}

		else if (event.data.includes("Simulation successfully started!") || (event.data.includes("warning") && !event.data.includes("Error"))) {
			if (window.localStorage.autoTerminalSwitch == "true" && $('#terminal').css ('display') == 'none') {
				switchView(1)
			}
			else {
				initializeTerminalSafe()
				if ($('#terminal').css ('display') == 'none') {
					switchView(1, 'f')
					switchView(0, 'f')
				}
			}
			term.write ("\r")
			term.clear()
			term.write('UART Terminal connected to simulated ice40 FPGA UART.  Echoing data below...\r\n');
			$("#outputview").val ("Output produced:\r\n" + (event.data.split ("\n").slice (1).join ('\n')))
			clearInterval(synthesis_interval)
			send_inputs()
			clearEditorErrors()
			errors = []
			update_status("SIM_RUNNING", "Status: Simulation is running")
			messages += event.data
			// window.alert (messages)
			messages = ""
		}
		else if (event.data.includes("Error") || event.data.includes("failed")) {
			clearInterval(synthesis_interval)
			clearEditorErrors()
			errors = []
			messages = event.data.split("\n")
			console.log (messages)
			var endoflog = false
			for (var elm in messages) {
				if (messages[elm].match (/^[\w]+\.sv: Line/)) {
					var data = messages[elm].replace("Line ", "").replace(/\:/g, "").split(" ")
					var filename = data[0]
					var num = parseInt (data[1])
					var msg = data.slice (2).join (" ")
					errors.push({
						file: filename,
						workspace: ws.currentWorkspace,
						row: (num - 1).toString(),
						column: 0,
						text: msg,
						type: "error"
					});
					if (filename == window.active_tab.getAttribute ('name') && ws.currentWorkspace == window.active_tab.getAttribute ('workspace')) {
						error_id.push(editor.session.addMarker(new Range(num - 1, 0, num - 1, 1), localStorage.ice40DarkMode == "true" ? "ace-line-error-dark" : "ace-line-error-light", "fullLine"));
					}
					// if 'code.sv' is returned, an arbitrary error with no information was sent.  Attach it to the first file instead
					if (filename == 'code.sv') filename = getWorkspace (getFilesystem(), ws.currentWorkspace)[0].name

					// if tab is closed, open tab, then perform below
					if ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]').length == 0) {
						var wksp = getWorkspace (getFilesystem(), ws.currentWorkspace)
						var file = wksp.filter (f => f.name == filename)[0]
						openFileFromStorage (file, ws.currentWorkspace, true)
					}
					// color tab red if it is NOT the current tab since it has an error
					if ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0] != window.active_tab) {
						$('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]').css('border', 'var(--editor-tab-error)')
					}
					// check if tab is open, check if 'errors' attribute is set, then add line numbers
					if ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].getAttribute ('errors') == null) {
						$('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].setAttribute ('errors', JSON.stringify ([num]))
					}
					else {
						var error_lines = JSON.parse ($('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].getAttribute ('errors'))
						error_lines.push (num)
						$('[name="' + filename + '"][workspace="' + ws.currentWorkspace + '"]')[0].setAttribute ('errors', JSON.stringify (error_lines))
					}
				}
			}
			editor.getSession().setAnnotations(
				errors.filter (e => e.workspace == window.active_tab.getAttribute ("workspace") && e.file == window.active_tab.getAttribute ("name"))
			)
			$("#outputview").val (event.data)
			update_status("CODE_ERROR", "Status: Error in code")
			messages = ""
			compile_failed = true
			return false
		}
		else if (event.data.includes("Unauthorized WebSocket")) {
			update_status("CODE_ERROR", "Status: Unauthorized simulation")
			alert("Your simulator session has either expired, or not been started.  Log in by refreshing the page or navigating to the login portal at https://verilog.ecn.purdue.edu/portal.")
		}
		else {
			try {
				if ("LFTRED" in JSON.parse (event.data)) {
					set_outputs(JSON.parse(event.data))
				}
			}
			catch (err)
			{
				if (typeof event.data == "string" && event.data.includes("timing violation")) {
					alert(event.data)
					update_status("CODE_ERROR", "Status: FF Timing Violation")
				}
				else if (typeof event.data == "string" && event.data.includes("TIME LIMIT EXCEEDED")) {
					update_status("CODE_ERROR", "Status: Simulation timeout")
				}
				else if (typeof event.data == "string" && event.data.includes("MISSING TOP MODULE")) {
					update_status("CODE_ERROR", "Status: Missing top module")
					alert("The code received doesn't describe any hardware. Since there's nothing to synthesize and/or simulate, " +
						"the server immediately killed the simulation. Try adding some code before simulating.")
				}
				else if (event.data.includes("END SIMULATION")) {
					console.log ("END SIMULATION")
				}
				else if (event.data.includes("YOSYS HUNG")) {
					alert("Your code took longer than expected to compile, which is an indicator that your design is too complex and must be optimized. " +
						  "Check your design with a TA or Rick. \n" +
						  "We do not allow compile times to exceed 30 seconds to allow for other students to continue running their simulations. ")
					update_status("CODE_ERROR", "Status: Synthesis timeout")
				}
				// else if (event.data.includes("CVC HUNG")) {
				// 	alert("Your simulation was killed because of a bug in your code.  Ensure that your flip flops are only changing regs as they're meant to, " + 
				// 		  "and that you are not changing regs in different always blocks.  If you're absolutely sure your code is correct, post it privately to instructors on Piazza.")
				// 	update_status("CODE_ERROR", "Status: Simulation hung on server")
				// }
				else {
					console.error (err)
					console.log(event.data)
				}
				this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
			}
		}
	}
	ws.onopen = function () {
		if (ws.readyState == 1) {
			if (localStorage.switchsim == 'workspace') {
				ws.send (JSON.stringify (getWorkspace (getFilesystem(), window.active_tab.getAttribute ('workspace'))))
			}
			else {
				ws.send (JSON.stringify (getWorkspace (getFilesystem(), window.active_tab.getAttribute ('workspace')).filter (e => e.name == window.active_tab.getAttribute ('name'))))
			}
		}
	}
	ws.onclose = function (evt) {
		difftime = (new Date().getTime() / 1000) - time
		var minutes = Math.floor(difftime / 60);
		var seconds = difftime - minutes * 60;
		console.log("Simulation ended at " + minutes.toString() + " minutes and " + seconds.toString() + " seconds.")
		if (!errors) {
			this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
		}
	}
	return false
}


function load_template(e) {
	$.get({ url: "/assets/" + template_code, cache: false }, function (data) {
		window.localStorage.original_code = data
		editor.setValue(window.localStorage.original_code, -1);
		editor.session.setMode("ace/mode/verilog")
	});
}

function toggle_information(pos) {
	var descbar = document.getElementById("description-navbar")
	if (pos == "15vh") {
		var id = setInterval(reduce_padding, 10)
		function reduce_padding() {
			if (descbar.style["paddingBottom"] == "0vh")
				clearInterval(id);
			else
				descbar.style["paddingBottom"] = (parseInt(descbar.style["paddingBottom"].replace("vh", "")) - 1).toString() + "vh"
		}
	}
	else {
		var id = setInterval(incr_padding, 10)
		function incr_padding() {
			if (descbar.style["paddingBottom"] == "15vh")
				clearInterval(id);
			else
				descbar.style["paddingBottom"] = (parseInt(descbar.style["paddingBottom"].replace("vh", "")) + 1).toString() + "vh"
		}
	}
}


// :) opens in new tab, so dw you don't lose your work (although you shouldn't lol thank goodness for window.localstorage)
function rickroll() { window.open("https://youtu.be/dQw4w9WgXcQ?t=85") } 

function changeItUp() {
	document.getElementById("desctext").innerHTML = `R3JlYXQgY2F0Y2ghIEEgbG9jYWxpemVkIHZlcnNpb24gaXMgaG9zdGVkIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ub3JhbmRvbXRlY2hpZS9lY2
                                                    UyNzAtc2ltdWxhdG9yLiBUaGUgY29kZSB0aGVyZSBpcyBhIGJpdCBvdXQgb2YgZGF0ZSwgYnV0IGl0IHdhcyB0aGUgZmluYWwgdmVyc2lvbiBv
                                                    ZiB0aGUgc2ltdWxhdG9yIHVzZWQgb3ZlciB0aGUgc3VtbWVyLCBzbyBpdCBzaG91bGQgd29yay4gWW91IHdpbGwgbmVlZCBMaW51eCB0byB0cn
                                                    kgaXQgb3V0LCBob3dldmVyIC0gV2luZG93cyBhbmQgbWFjT1MgZG8gbm90IHN1cHBvcnQgdGhlIGluY3JlZGlibGUgc29mdHdhcmUgd2UgdXNl
                                                    ZC4=`
}

function display_info(sect) {
	var p_elm = document.getElementById("desctext")

	if (descbar.style["paddingBottom"] == "15vh" && sect == selected_section) {
		toggle_information("15vh")
	}
	else if (descbar.style["paddingBottom"] == "0vh") {
		toggle_information("0vh")
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
			It's okay if you don't get it. <p id='nevergonnagiveyouup' onclick='javascript:rickroll()' style='display: inline; text-decoration: none; cursor: pointer'>Don't give up!</p>"
			break;
		case 3:
			p_elm.innerHTML = "The simulator couldn't have been made possible without the guidance and support of my fellow UTAs, GTAs, my overly critical friends in ECE, numerous posts on StackOverflow, Reddit, Mozilla \
    Web Docs and, of course - Rick."
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
		default:
			alert("Nah don't mess with this pls")
	}
}

window.onbeforeunload = function () {
	window.localStorage.evalboardtheme = document.getElementById("evalthemeselector").value
	window.localStorage.editor_width = $("#editor-workspace").width()
	localStorage.ace_options = JSON.stringify (editor.getOptions())
	if (localStorage.ice40DarkMode == "true")
		localStorage.ace_dark_theme = editor.getOption("theme")
	else if (localStorage.ice40DarkMode == "false")
		localStorage.ace_light_theme = editor.getOption("theme")
	reset_handler()
};

function get_file_by_name (name, filelist) {
	return new Promise ((resolve, reject) => {
		try {
			filelist.forEach ((file) => {
				if (file.name == name)
					resolve (file)
			})
			resolve ({'name': 'filenotfound'})
		}
		catch (err) {
			reject (err)
		}
	})
}

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
	}
	else {
		$('#switchsim')[0].innerHTML = 'Workspace Simulation'
		localStorage.switchsim = 'workspace'
	}
}

function saveAllFilesToStorage() {
    var filesystem = JSON.parse (localStorage.filesystem)
	var labels = Array.from($('.tab-label'))
	labels.pop()	// removes Add button from list, since it is not a code file
	tab_list = []
	labels.forEach (e => {
		var etl_workspace = !($(e).parent().attr('workspace') in editor_tab_list);
		var etl_code = ($(e).parent().attr('workspace') in editor_tab_list) && !($(e).parent().attr('name') in editor_tab_list[$(e).parent().attr('workspace')]);
		if (etl_workspace || etl_code) {
			console.log ("saveAllFilesToStorage attempted but code was not found, exiting...")
			console.log (etl_workspace, etl_code)
			console.log (editor_tab_list)
			return
		}
		data = {
			name: $(e).parent().attr('name'),
			code: editor_tab_list[$(e).parent().attr('workspace')][$(e).parent().attr('name')].getValue(),
            ctime: $(e).parent().attr('ctime'),
            mtime: $(e).parent().attr('mtime'),
            workspace: $(e).parent().attr('workspace'),
            state: $(e).parent().attr('state') || 'open'
        }
		var workspace = JSON.parse (filesystem [$(e).parent().attr('workspace')])
		if (!('filter' in workspace)) {
			workspace = [JSON.parse (filesystem [$(e).parent().attr('workspace')])]
		}
		// if not saved to storage, save it
		if (workspace.filter (el => el.name == data.name).length == 0) {
			new_arr = JSON.parse (JSON.stringify (workspace))
			new_arr.push (data)
			filesystem [$(e).parent().attr('workspace')] = JSON.stringify (new_arr)
		}
		else {
			var all_data = JSON.parse (JSON.stringify (workspace))
			var idx = all_data.indexOf (all_data.filter (el => el.name == data.name)[0])
			all_data [idx].name = data.name.replace ('.v', '.sv') // ensure everyone has SV files from now on
            all_data [idx].code = data.code
            all_data [idx].ctime = data.ctime
			all_data [idx].mtime = data.mtime
			all_data [idx].state = data.state
			filesystem [$(e).parent().attr('workspace')] = JSON.stringify (all_data)
        }
        window.localStorage.filesystem = JSON.stringify (filesystem)
	})
	window.localStorage.active_tab = JSON.stringify ([window.active_tab.getAttribute ('name'), window.active_tab.getAttribute ('workspace')])
}

function clearEditorErrors() {
	editor.getSession().clearAnnotations()
	for (var id in error_id) {
		editor.session.removeMarker(error_id[id])
	}
	error_id = []
}

// function save_all_files_to_server() {
// 	labels = Array.from($('.tab-label'))
// 	labels.pop()	// removes Add button from list, since it is not a code file	
// 	labels.map((e) => {
// 		$.post({
// 			url: '/file/new',
// 			contentType: 'application/json',
// 			data: JSON.stringify({
// 				'name': $(e).parent().attr('name'),
// 				'code': editor_tab_list[$(e).parent().attr('session')].getValue(),
// 				'mtime': $(e).parent().attr('mtime')
// 			}),
// 			success: function (result) {
// 				if (result.status != 'success') {
// 					alert("There was an error saving '" +
// 						e.target.innerHTML +
// 						"'. Details: " + result.reason
// 					)
// 				}
// 			}
// 		})
// 	})
// }

function saveVerilog() {
	uriContent = "data:application/octet-stream," + encodeURIComponent(editor.getValue());
	document.getElementById("downlink").href = uriContent
	document.getElementById("downlink").click()
}

function stop_handler() {
	if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
		ws.onclose = function () { }
		ws.close()
		update_status("CODE_ERROR", "Status: Simulation stopped")
		this.pending = setTimeout(() => {
			update_status("STATUS_READY", "Status: Ready")
		}, 1100)
		// alert ("Simulation has been stopped.")
	}
}

function reset_handler() {
	if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
		ws.onclose = function () { }
		ws.close()
		update_status("CODE_ERROR", "Status: Simulation reset")
		difftime = (new Date().getTime() / 1000) - time
		var minutes = Math.floor(difftime / 60);
		var seconds = difftime - minutes * 60;
		console.log("Simulation ended at " + minutes.toString() + " minutes and " + seconds.toString() + " seconds.")
		this.pending = setTimeout(() => {
			update_status("STATUS_READY", "Status: Ready")
		}, 1100)
	}
	clearEditorErrors()
	errors = []
	set_outputs({
		"LFTRED": 0, "RGTRED": 0, "RGBLED": 0, "SS7": 0, "SS6": 0,
		"SS5": 0, "SS4": 0, "SS3": 0, "SS2": 0, "SS1": 0, "SS0": 0
	})
}

function demo_handler() {
	if (typeof ws != "undefined" && ws.readyState == ws.OPEN) {
		ws.onmessage = function () { }
		ws.onclose = function () { }
		ws.close()
		set_outputs({
			"LFTRED": 0, "RGTRED": 0, "RGBLED": 0, "SS7": 0, "SS6": 0,
			"SS5": 0, "SS4": 0, "SS3": 0, "SS2": 0, "SS1": 0, "SS0": 0
		})
	}

	ws = new WebSocket("ws://" + window.location.host + "/")
	update_status("CONNECTING", "Status: Connecting...")
	var synthesis_interval = ""
	ws.onmessage = function (event) {
		if (event.data == "Processing Verilog code...") {
			synth_status = [
				"Status: Synthesizing...",
				"Status: Synthesizing..",
				"Status: Synthesizing.",
				"Status: Synthesizing"
			]

			update_status("SYNTHESIS", synth_status[0])
			messages = event.data + "\n"
			synthesis_interval = setInterval(function () {
				synth_status.push(synth_status.shift())
				update_status("SYNTHESIS", synth_status[0])
			}, 500)
		}

		else if (event.data.startsWith ("Simulation successfully started!")) {
			$("#outputview").val ("Output produced:\r\n" + (event.data.split ("\n").slice (1).join ('\n')))
			clearInterval(synthesis_interval)
			messages += event.data
			messages = ""
			update_status("DEMO_RUNNING", "Status: Running demo simulation")
		}
		else if (event.data == "Error: no code found." || event.data.includes("failed") || event.data.includes("warning")) {
			alert("Something went wrong trying to run the demo simulation. Please contact course staff.")
			update_status("DEMO_RUNNING", "Status: Running demo simulation")
		}
		else if (event.data.includes("Unauthorized WebSocket")) {
			update_status("CODE_ERROR", "Status: Unauthorized simulation")
			alert("This window has been open for longer than 1.5 hours. Please refresh the page to start a new session.")
		}
		else {
			try {
				set_outputs(JSON.parse(event.data))
			}
			catch (err) {
				if (typeof event.data == "string" && event.data.includes("timing violation")) {
					alert(event.data)
					update_status("CODE_ERROR", "Status: FF Timing Violation")
				}
				else if (typeof event.data == "string" && event.data.includes("TIME LIMIT EXCEEDED")) {
					update_status("CODE_ERROR", "Status: Simulation timeout")
				}
				else {
					console.log(event.data)
				}
			}
		}
	}
	ws.onopen = function () {
		clearEditorErrors()
		errors = []
		if (ws.readyState == 1) {
			ws.send(JSON.stringify ([{name: 'demo.sv', code: "give us a demo please"}]))
			setTimeout (send_inputs, 500)
		}
	}
	ws.onclose = function (evt) {
		if (evt.code == 1006) {
			console.log(evt.code)
			update_status("SERVER_DOWN", "Status: Server is down")
		}
		this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
	}
	return false
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
	var rgb = "#", c, i;
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
	}
	else {
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
		}
		else {
			document.getElementById("codemirror_box").style.fontSize = (parseFloat(document.getElementById("codemirror_box").style.fontSize.replace("px", "")) + 0.5).toString() + "px"
		}
	}
}

function selectTabByEvent(event) {
	if (event.target.classList.contains('tab-close') || event.target.classList.contains('wksp-tab-close') || event.target.id == "editor-tab-add" || $(event.target).nodeName == "PATH")
		return
	else if ($(event.target).prop('tagName') != "LABEL" && $(event.target).css('background') != 'var(--etw-bg-selected)') {
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

function blurMainView (opt) {
	switch (opt) {
		case 0:
			$("#mainview").css ('filter', 'blur(3px)')
			break;
		case 1:
			$("#mainview").css ('filter', 'blur(0px)')
			break;
	}
}

function closeSettings() {
	if ($('#overlay_2').css('display') == 'none')
		return false
	$('#overlay_2').animate({ 'opacity': 0 }, 200, () => {
		$('#overlay_2').css('display', 'none')
	})
	blurMainView(1)
}

// Sorry guys.  One day...
// function saveCurrentTabToServer() {
// 	$.post({
// 		url: '/file/save',
// 		contentType: 'application/json',
// 		data: JSON.stringify({
// 			'name': $(window.active_tab).attr('name'),
// 			'code': editor_tab_list[$(window.active_tab).attr('session')].getValue(),
// 			'mtime': $(window.active_tab).attr('mtime')
// 		}),
// 		success: function (result) {
// 			if (result.status != 'success') {
// 				alert("There was an error saving '" +
// 					$(window.active_tab).attr('name') +
// 					"'. Details: " + result.reason
// 				)
// 			}
// 		}
// 	})
// }

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
	}
	else if (window.localStorage.autoTerminalSwitch == "true") {
		document.documentElement.setAttribute("autoterminal-option", "false")
		window.localStorage.autoTerminalSwitch = "false"
	}
}

function toggleDarkMode() {
	if (window.localStorage.ice40DarkMode == "false") {
		// then go to dark mode
		darkMode()
	}
	else if (window.localStorage.ice40DarkMode == "true") {
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
	}
	else if (window.localStorage.simulateOnSave == "true") {
		window.localStorage.simulateOnSave = "false"
		document.documentElement.setAttribute("simulate-on-save", "false")
	}
}

function toggleAutocomplete() {
	if (window.localStorage.codeAutocomplete == "false") {
		window.localStorage.codeAutocomplete = "true"
		document.documentElement.setAttribute("code-autocomplete", "true")
		editor.setOption ("enableBasicAutocompletion", true)
		editor.setOption ("enableSnippets", true)
		editor.setOption ("enableLiveAutocompletion", true)
	}
	else if (window.localStorage.codeAutocomplete == "true") {
		window.localStorage.codeAutocomplete = "false"
		document.documentElement.setAttribute("code-autocomplete", "false")
		editor.setOption ("enableBasicAutocompletion", false)
		editor.setOption ("enableSnippets", false)
		editor.setOption ("enableLiveAutocompletion", false)
	}
}

var editor_tab_list = {}

function openTabsFromStorage() {
    var filesystem = JSON.parse (localStorage.filesystem)
	var opened = []

    Object.keys (filesystem).forEach (workspace => {
		if (Object.keys (filesystem[workspace]).length == 0) return
		if (workspace != localStorage.currentWorkspace) return
        JSON.parse (filesystem [workspace]).forEach(f => {
			if (f.state == 'closed') {
				return
			}
			if (opened.filter (f => f == f.name).length > 0) { // already added
				return
			}
			openFileFromStorage(f, workspace, false)
			opened.push (f)
        })
	})

	if ($('.editor-tab-workspace[name="' + localStorage.currentWorkspace + '"]').length == 0) {
		setCurrentWorkspace ('default')
	}
	var tmp = localStorage.active_tab
	selectWorkspaceByElement($('.editor-tab-workspace[name="' + localStorage.currentWorkspace + '"]', false)[0]).then (res => {
		try {
			selectTabByElement($('[name="' + JSON.parse (tmp)[0] + '"][workspace="' + JSON.parse (tmp)[1] + '"]')[0])
		}
		catch (err) {
			console.log ("undefined tab, redirecting to first one...")
			selectTabByElement($('.editor-tab[id!="editor-add-tab"]')[0])
		}
	}).catch (err => {
		console.error (err)
	})
}

function openFileFromStorage(f, ws, force) {
	if (!force && f.state == 'closed') return
	if (f.name.endsWith ('.v')) {
		f.name = f.name.replace (/\.v/g, '.sv')
	}
	f.workspace = ws
	var sess = new EditSession(f.code)
	editor_tab_list	[f.workspace][f.name] = sess
	delete f.code
	addTab(f)
}

function changeBoardTheme(theme) {
	switch (theme) {
		case "Original":
			cnva = "#041f05"
			ltrs = "black"
			caps = "#aaa"
			fowt = "bold"
			break;
		case "Dark Original":
			cnva = "#041005"
			ltrs = "black"
			caps = "#aaa"
			fowt = "bold"
			break;
		case "Modern":
			cnva = "#17183f"
			ltrs = "white"
			caps = "#333666"
			fowt = "normal"
			break;
	}
	document.getElementById("canvas_background").setAttribute("fill", cnva)
	Array.from(document.getElementsByClassName("inputbutton")).forEach(function (el) { el.setAttribute("fill", caps); el.setAttribute("font-weight", fowt) })
	Array.from(document.getElementsByClassName("svg_text")).forEach(function (el) { el.setAttribute("fill", ltrs); el.setAttribute("font-weight", fowt) })
	window.localStorage.evalboardtheme = theme
}

function selectWorkspaceByElement(elm, force) {
	if (elm.id == 'editor-tab-workspace-add') return
	// save last tab hopefully?
	if (window.active_tab && $(window.active_tab).attr('workspace') in editor_tab_list && editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')]) {
		editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].setValue(editor.session.getValue())
	}
	// remove current tabs
	$('.editor-tab[id!=editor-tab-add]').remove()
	// open workspace tabs
	return new Promise ((resolve, reject) => {
		browserOpenWorkspace (elm.getAttribute ('name'), force).then (res => {
			resolve (true)
		}).catch (err => {
			reject (err)
		})
	})
}

function selectTabByElement(elm) {
	// save last tab hopefully?
	if (window.active_tab && $(window.active_tab).attr('workspace') in editor_tab_list && editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')]) {
		editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].setValue(editor.session.getValue())
	}
	
	$('.editor-tab').css ('background', '')
	$(elm).css ('background', 'var(--etw-bg-selected)')

	window.active_tab = elm
	
	if (elm.getAttribute('name').endsWith ('.mem')) {
		editor.session.setMode("ace/mode/text")
	}
	else if (elm.getAttribute('name').endsWith ('.json')) {
		editor.session.setMode("ace/mode/json")
	}
	else {
		editor.session.setMode("ace/mode/verilog")
	}
	
	if ($(elm).attr('workspace') in editor_tab_list && editor_tab_list[$(elm).attr('workspace')][$(elm).attr('name')]) {
		editor.setValue((editor_tab_list[$(elm).attr('workspace')][$(elm).attr('name')]).getValue(), -1)
	}
	else {
		editor.setValue(window.localStorage.original_code, -1)
	}

	// set up errors for tab
	if (elm.getAttribute ('errors') != null) {
		$(elm).css('border', '')
		clearEditorErrors()
		JSON.parse (elm.getAttribute ("errors")).forEach (n => {
			var num = parseInt (n)
			error_id.push (editor.session.addMarker(new Range(num - 1, 0, num - 1, 1), localStorage.ice40DarkMode == "true" ? "ace-line-error-dark" : "ace-line-error-light", "fullLine"))
		})
		editor.getSession().setAnnotations(
			errors.filter (e => e.file == elm.getAttribute ('name') && e.workspace == elm.getAttribute ('workspace'))
		)
	}
}

function selectTabByEvent(event) {
	if (event.target.classList.contains('tab-close') || event.target.classList.contains('wksp-tab-close') || event.target.id == "editor-tab-add" || $(event.target).nodeName == "PATH")
		return
	else if ($(event.target).prop('tagName') != "LABEL" && $(event.target).css('background') != 'var(--etw-bg-selected)') {
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

function startTabDrag (e) {
	e.dataTransfer.setData("data", [e.currentTarget.getAttribute ('name'), e.currentTarget.getAttribute ('workspace')]);
}
function allowTabDrag (e) {
	e.preventDefault()
}
function tabDrag (e) {
	e.preventDefault()
	var name, old_wksp;
	[name, old_wksp] = e.dataTransfer.getData ("data").split (",")

	if (e.currentTarget.getAttribute ('name') == old_wksp) return

	var nws = getWorkspace (getFilesystem(), e.currentTarget.getAttribute ('name'))
	if (nws.filter (e => e.name == name).length > 0) { 
		alert ('Error: filename already exists.  Change the name before moving tabs.') 
		return
	}
	else if ($('.editor-tab').length == 2) {
		var cfm = confirm ('Warning: There is only one file in this workspace, and moving it out will delete this workspace.  Continue?')
		if (old_wksp == 'default') {
			alert ("Error: you cannot delete the 'default' workspace.  Try again with another workspace.")	
			return
		}
		if (!cfm) {
			return
		}
	}

	var file = getWorkspace (getFilesystem(), old_wksp).filter (e => e.name == name)[0]
	var ws = getWorkspace (getFilesystem(), old_wksp).filter (e => e.name != name)
	if (ws.length == 0) {
		$('.editor-tab-workspace[name="' + old_wksp + '"]').remove()
		$('#browser_' + old_wksp).remove()
		delete editor_tab_list [old_wksp]
		var fs = getFilesystem()
		delete fs [old_wksp]
		saveFilesystem (fs)	
	}
	else {
		saveWorkspace (old_wksp, ws)
	}

	nws.push (file)
	saveWorkspace (e.currentTarget.getAttribute ('name'), nws)

	selectWorkspaceByElement (e.currentTarget, false)
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
	return new Promise ((resolve, reject) => {
		try {
			Array.from ($('#editor-tab-header').children()).forEach (e => {
				if (e.getAttribute ('name') == name && e.getAttribute ('workspace') == workspace)
					resolve (e)
			})
			resolve (false)
		}
		catch (err) {
			reject (err)
		}
	})
}

var term = null;

function initializeTerminalSafe() {
	// safety - if terminal is already initialized, just do resize, set theme and leave
	if (term) {
		term.resize (parseInt ($("#editor-workspace").width() / 10.5), parseInt ($("#editor-workspace").height() / 22.5))
	}
	if ($("#terminal").children().length == 0) {
		term = new Terminal();
		term.resize (parseInt ($("#editor-workspace").width() / 10.5), parseInt ($("#editor-workspace").height() / 22.5))
		term.open(document.getElementById('terminal'));
		if (!ws || ws.readyState != 1)
			term.write ("Start a simulation to view any data written from the FPGA to this terminal.\r\n")
		term.onKey ((key) => {
			if (key.domEvent.type == 'keypress' && key.domEvent.which != 32) return
			if (key.domEvent.ctrlKey && key.domEvent.which == 83) {
				if (localStorage.simulateOnSave == "true")
					ice40hx8k_handler()
					return
			}
			txdata_fifo.push (key)
			send_inputs ()
		});
	}
	if (window.localStorage.ice40DarkMode == "true")
			term.setOption('theme', { background: '#111', foreground: '#ddd' });
		else
			term.setOption('theme', { background: '#ddd', foreground: '#111' });
}

function switchView (sw, opt='nf') {
	switch (sw) {
		case 0:
			$("#view_code").addClass ("btn-view-active")
			$("#view_terminal").removeClass ("btn-view-active")
			$("#view_output").removeClass ("btn-view-active")
			$("#codemirror_box").css ('display', '');
			$("#resize-editor").css ('display', '');
			$("#editor-tab-header,#editor-tab-workspace-header").animate ({'opacity': '1'}, opt ? 10 : 1000);
			$("#outputview").css ('display', 'none');
			$("#terminal").css ('display', 'none');
			break;
		case 1:
			$("#view_code").removeClass ("btn-view-active")
			$("#view_terminal").addClass ("btn-view-active")
			$("#view_output").removeClass ("btn-view-active")
			$("#codemirror_box").css ('display', 'none');
			$("#resize-editor").css ('display', 'none');
			$("#editor-tab-header,#editor-tab-workspace-header").animate ({'opacity': '0'}, opt ? 10 : 1000);
			$("#outputview").css ('display', 'none');
			$("#terminal").css ('display', '');
			$('#terminal').width ($("#editor-workspace").width());
			initializeTerminalSafe()
			break;
		case 2:
			$("#view_code").removeClass ("btn-view-active")
			$("#view_terminal").removeClass ("btn-view-active")
			$("#view_output").addClass ("btn-view-active")
			$("#codemirror_box").css ('display', 'none');
			$("#resize-editor").css ('display', 'none');
			$("#editor-tab-header,#editor-tab-workspace-header").animate ({'opacity': '0'}, opt ? 10 : 1000);
			$("#terminal").css ('display', 'none');
			$("#outputview").width($("#editor-workspace").width())
			$("#outputview").css ('display', '');
			break;
	}
	$("#outputview")[0].scrollTop = $("#outputview")[0].scrollHeight
}

function resizeHandler() {
	if (term)
		term.resize (parseInt ($("#editor-workspace").width() / 10.5), parseInt ($("#editor-workspace").height() / 22.5))
	document.getElementById ("terminal").style.width = document.getElementById ("editor-workspace").style.width
	document.getElementById ("outputview").style.width = document.getElementById ("editor-workspace").style.width
}

function toggleLocalSimulation() {
	if (window.localStorage.localsimulation == "false") {
		window.localStorage.localsimulation = "true"
		document.documentElement.setAttribute("localsimulation-option", "true")
	}
	else if (window.localStorage.localsimulation == "true") {
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
	if ($("#overlay_4").css ('opacity') == "0") {
		blurMainView(0)
		$("#overlay_4").css ('display', 'flex')
		$("#overlay_4").animate ({'opacity': '1'}, 200)
		$.get({ url: "/profile", cache: false }, function (data) {
			window.profile_json = data
			$("#loading").animate ({'opacity': '0'}, 200, () => {
				$("#loading").css ('display', 'none')
				$("#profile_visit").text ($("#profile_visit").text().replace ("VISIT", JSON.parse (window.profile_json).visits))
				$("#profile_sim").text ($("#profile_sim").text().replace ("SIM", JSON.parse (window.profile_json).lifesims))
				$("#profile_dem").text ($("#profile_dem").text().replace ("DEM", JSON.parse (window.profile_json).demoes))
				$("#profile_err").text ($("#profile_err").text().replace ("ERR", JSON.parse (window.profile_json).errors))
				$(".profile_data").css ('display', 'block')
				$(".profile_data").animate ({'opacity': '1'}, 200)

				var graphData = {}
				JSON.parse (window.profile_json).error_data.forEach (e => {
					if (e.time.split (" ")[0] in graphData) {
						graphData [e.time.split (" ")[0]] = parseInt (graphData [e.time.split (" ")[0]]) + 1
					}
						else {
						graphData [e.time.split (" ")[0]] = 1
					}
				})
				var plotData = [
					{
					  x: Object.keys (graphData),
					  y: Object.values (graphData),
					  type: 'bar'
					}
				];
				var layout = {
					plot_bgcolor: $(".inner_overlay").css ('background-color'),
					paper_bgcolor: $(".inner_overlay").css ('background-color'),
					font: {color: $(".display-4").css ('color')}
				};
				Plotly.newPlot('error_graph', plotData, layout, {responsive: true});
			})
		});
	}
	else {
		$("#overlay_4,.profile_data").animate ({'opacity': '0'}, 200, () => {
			$("#overlay_4,.profile_data").css ('display', 'none')
			$("#loading").css ('opacity', '1')
			$("#loading").css ('display', '')
		})
	}
}

function open_hdlwave() {
	window.open ('https://verilog.ecn.purdue.edu/hdlwave/?encoded=' + btoa (window.editor.getValue()), '_blank')
}