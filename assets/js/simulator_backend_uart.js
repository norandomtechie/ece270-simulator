var shiftKey = false;
var STATUS_READY = "#e0e0e0"
var SIM_RUNNING = "#e0f0e0"
var CODE_ERROR = "#f0e0e0"
var SERVER_DOWN = "#eecccc"
var DEMO_RUNNING = "#dafae6"
var AUTOSAVE_TIME = 120000
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
var template_code = "270sim_source_uart.v"

var ws;
var errors = [];
var error_id = [];
var time;
var conn_interval = ""
var sample;
var selected_section = -1;
var descbar = document.getElementById("description-navbar")
descbar.style["paddingBottom"] = "0vh"
autosaver = setInterval(function () { autosave_call(false) }, AUTOSAVE_TIME);
var opacityChange;
$("#autosave_interval").val(AUTOSAVE_TIME)

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

$(".btn-info").on("keydown keyup mouseover mousemove mouseenter", (event) => {
	if (event.ctrlKey && $(".btn-info").text() == "Reload Code")
		$(".btn-info").text("Load Template")
})

$(".btn-info").on("keyup mouseleave", () => {
	if (window.localStorage.tab_data)
		$(".btn-info").text("Reload Code")
	else
		$(".btn-info").text("Load Template")
})

// a-f, w-z, 0-9, ctrl, alt, shift
curmap = {}
bakmap = {}

$(document).bind("keydown", "ctrl+o", function (e) {
	if (e.ctrlKey && e.which == 79) {
		e.preventDefault();
		openVerilog()
	}
});

function populateKeystate(e) {
	e = e || event;
	if (curmap[e.keyCode] && e.type == "keydown" || e.altKey)
		return false
	curmap[e.keyCode] = e.type == "keydown" ? true : false
	btn0 = document.getElementById("key0").getAttribute("pressed")
	btn3 = document.getElementById("key3").getAttribute("pressed")
	btnW = document.getElementById("KeyW").getAttribute("pressed")
	if (bakmap[e.keyCode] != curmap[e.keyCode])
		setTimeout(function () {
			if (!(document.activeElement.className.includes("ace")) &&
				!(document.activeElement.className.includes("tab-label")) &&
				!(document.getElementById("overlay").style.display == "flex") &&
				!(document.getElementById("overlay_2").style.display == "flex") &&
				!(document.getElementById("overlay_3").style.display == "flex") &&
				!(document.getElementById("overlay_4").style.display == "flex") &&
				 (document.activeElement == document.body) 
			    ) 
			{
				if (e.which >= 48 && e.which <= 57) // row-wise numbers
					toggle_button(e, e.which - 48)
				else if (parseInt (e.key) >= 0 && parseInt (e.key) <= 9)  // numpad
					toggle_button(e, e.which)
				else if ((e.which >= 65 && e.which <= 70) || (e.which >= 87 && e.which <= 90))
					toggle_button(e, e.code)
				else if (document.getElementsByClassName("btn-info")[0].isMouseOver == true && e.ctrlKey)
					load_button.innerHTML = "Load Template"
			}
			else if (document.activeElement.id == "autosave_interval" && e.which == 13)
				autosave_interval()
			else if (document.activeElement.id == "passwd" && e.which == 13 && e.type == "keydown")
				change_password()

			if (e.which == 27) {
				if (document.getElementById("overlay").style.display == "flex")
					closeOverlay()
				else if (document.getElementById("overlay_2").style.display == "flex")
					closeSettings()
				else if (document.getElementById("overlay_3").style.display == "flex")
					closeUART()
				else if (document.getElementById("overlay_4").style.display == "flex")
					toggleProfile()
			}
			else if (e.which == 27 && document.getElementById("overlay").style.display == "flex")
				closeOverlay()
			else if (e.which == 27 && document.getElementById("overlay_2").style.display == "flex") {
				closeSettings()
				if (localStorage.ice40DarkMode == "false") {
					while (document.getElementsByClassName("ace-line-error-dark").length != 0)
						document.getElementsByClassName("ace-line-error-dark")[0].classList.replace("ace-line-error-dark", "ace-line-error-light")
				}
				else {
					while (document.getElementsByClassName("ace-line-error-light").length != 0)
						document.getElementsByClassName("ace-line-error-light")[0].classList.replace("ace-line-error-light", "ace-line-error-dark")
				}
			}
			else if (e.ctrlKey && e.which == 79 && document.getElementById("overlay_2").style.display != "flex") {
				e.preventDefault()
				openVerilog()
			}
			else if (e.which == 46 && $('#overlay').css ('display') == 'flex') {
				e.preventDefault()
				clearItem()
			}
			bakmap = { ...curmap }
		}, 10)
}

// $(document).bind('keydown', 'ctrl+s', function (e) {
// 	if (e.ctrlKey && e.which == 83) {
// 		e.preventDefault();
// 		autosave_call(true)
// 		if (localStorage.simulateOnSave == "true")
// 			ice40hx8k_handler()
// 	}
// });

$(document).bind('keydown', 'ctrl+o', function (e) {
	if (e.ctrlKey && e.which == 79) {
		e.preventDefault();
		openVerilog()
	}
});

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

function toggle_button(event, key) {
	if (event.ctrlKey && event.shiftKey)
		return false;

	if (event.keyCode >= 48 && event.keyCode <= 57) {
		key_element = document.getElementById("key" + key)
		text_element = document.getElementById("text" + key)
	}
	else if (parseInt (event.key) >= 0 && parseInt (event.key) <= 9) {
		key_element = document.getElementById("key" + event.key)
		text_element = document.getElementById("text" + event.key)
	}
	else if (event.keyCode >= 65 && event.keyCode <= 90) {
		key_element = document.getElementById(key)
		text_element = document.getElementById("text" + key[key.length - 1])
	}
	else if (event.type.includes("mouse")) {
		if (key < 10) {
			key_element = document.getElementById("key" + key)
			text_element = document.getElementById("text" + key)
		}
		else {
			keymap = { 10: "A", 11: "B", 12: "C", 13: "D", 14: "E", 15: "F", 16: "W", 17: "X", 18: "Y", 19: "Z" }
			key_element = document.getElementById("Key" + keymap[key])
			text_element = document.getElementById("text" + keymap[key])
		}
	}

	x_loc = parseInt(key_element.getAttribute("x"))
	y_loc = parseInt(key_element.getAttribute("y"))
	cur_width = parseInt(key_element.getAttribute("width"))
	cur_height = parseInt(key_element.getAttribute("height"))
	// shiftKey = event.shiftKey

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

	var uart_present_in_header = editor.session.getValue().split ("\n")
	for (var i = 0; i < uart_present_in_header.length; i++) {
		if (uart_present_in_header[i].match ("^module top") && uart_present_in_header[i].match (/txdata|txclk|txready|rxdata|rxclk|rxready/)) {
			uart_present_in_header = true;
			break;
		}
		else if (uart_present_in_header[i].match ("module top") && !uart_present_in_header[i].match (/txdata|txclk|txready|rxdata|rxclk|rxready/)) {
			if (uart_present_in_header[i + 1].match (/txdata|txclk|txready|rxdata|rxclk|rxready/) && uart_present_in_header[i + 1].search (/\)/)) {
				uart_present_in_header = true;
				break;
			}
			else {
				uart_present_in_header = false;
				break;
			}
		}
		else if (i == (uart_present_in_header.length - 1)) {
			uart_present_in_header = false;
			break;
		}
	}

	if (!uart_present_in_header) {
		alert ("Starting this semester, UART ports are now required by default.  Load a new template by pressing the + button to add a new tab, " + 
				"then merge the header into your code in the previous tab.")
		return
	}

	if (editor.session.getValue().includes("’")) {
		// alert("Copying code from the notes without typing it out? Tsk tsk...\n" +
		// 	"The code you copied intentionally has special characters that " +
		// 	"cannot be parsed by Yosys or CVC. We highly recommend that you " +
		// 	"type out the entire code segment you are trying to use.\n" +
		// 	"If you really did type it out, and you're still seeing this message, " +
		// 	"contact the head TA.")
		// return
		alert ("We found special characters in your code that indicate you copied it.  Considering that there is quite a lot of provided code, " + 
			   "we will permit it for Lab 13.  These characters will be automatically removed from your code before it is sent for simulation.")
		editor.setValue (editor.getValue().replace (/’/g, "'"))
	}
	if (editor.session.getValue().match(/\/\/ ?module top|(\/\* ?\n?)module top/)) {
		alert("It seems like you have commented out or removed the top module. Your code will not compile!")
		return
	}

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
	ws = new WebSocket((window.location.protocol == "http:" ? "ws://" : "wss://") + window.location.hostname + ((window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") ? ":4500/" : "/"))
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
			editor.getSession().clearAnnotations()
			for (var id in error_id) {
				editor.session.removeMarker(error_id[id])
			}
			update_status("SIM_RUNNING", "Status: Simulation is running")
			messages += event.data
			// window.alert (messages)
			messages = ""
			errors = null
			error_id = []
		}
		else if (event.data.includes("Error") || event.data.includes("failed")) {
			clearInterval(synthesis_interval)
			for (var id in error_id)
				editor.session.removeMarker(error_id[id])
			messages = event.data.split("\n")
			errors = []
			endoflog = false
			for (var elm in messages) {
				if (messages[elm].startsWith("Line")) {
					var data = messages[elm].replace("Line ", "").replace(":", "").split(" ")
					var num = data[0]
					var msg = data.slice(1, data.length).join(" ")
					errors.push({
						row: (num - 1).toString(),
						column: 0,
						text: msg,
						type: "error"
					});
					error_id.push(editor.session.addMarker(new Range(num - 1, 0, num - 1, 1), localStorage.ice40DarkMode == "true" ? "ace-line-error-dark" : "ace-line-error-light", "fullLine"));
				}
			}
			$("#outputview").val (event.data)
			editor.getSession().setAnnotations(errors)
			update_status("CODE_ERROR", "Status: Error in code")
			messages = ""
			compile_failed = true
			return false
		}
		else if (event.data.includes("Unauthorized WebSocket")) {
			update_status("CODE_ERROR", "Status: Unauthorized simulation")
			alert("This window has been open for longer than 1.5 hours. Please log out and log back in to start a new session.")
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
					this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
				}
				else if (typeof event.data == "string" && event.data.includes("TIME LIMIT EXCEEDED")) {
					update_status("CODE_ERROR", "Status: Simulation timeout")
					this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
				}
				else if (typeof event.data == "string" && event.data.includes("MISSING TOP MODULE")) {
					update_status("CODE_ERROR", "Status: Missing top module")
					alert("The code received doesn't describe any hardware. Since there's nothing to synthesize and/or simulate, " +
						"the server immediately killed the simulation. Try adding some code before simulating.")
						this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
				}
				else if (event.data.includes("END SIMULATION")) {
					console.log ("END SIMULATION")
					this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
				}
				else if (event.data.includes("YOSYS HUNG")) {
					alert("Your code took longer than expected to compile, which is an indicator that your design is too complex and must be optimized. " +
						  "Check your design with a TA or Rick. \n" +
						  "We do not allow compile times to exceed 30 seconds to allow for other students to continue running their simulations. ")
					update_status("CODE_ERROR", "Status: Synthesis timeout")
					this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
				}
				else if (event.data.includes("CVC HUNG")) {
					alert("Your simulation was killed because of a bug in your code.  Ensure that your flip flops are only changing regs as they're meant to, " + 
						  "and that you are not changing regs in different always blocks.  If you're absolutely sure your code is correct, post it privately to instructors on Piazza.")
					update_status("CODE_ERROR", "Status: Simulation hung on server")
					this.pending = setTimeout(function () { update_status("STATUS_READY", "Status: Ready") }, 1000);
				}
				else {
					console.error (err)
					console.log(event.data)
				}
			}
		}
	}
	ws.onopen = function () {
		if (ws.readyState == 1) {
			ws.send(editor.getValue())
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
			p_elm.innerHTML = "Starting this semester, we will be analyzing what students do on the site, \
                       specifically how many visits are made to the site, password change attempts,\
                       and how many times students hit the Simulate and Demo buttons.\
                       If your code causes an internal server error, it will be saved for diagnosis\
                       and prevention of the error it caused, otherwise it will be deleted after \
                       the simulation is stopped."
			break;
		case 5:
			p_elm.innerHTML = "Since this is meant for University use, the source code for the server will not be made available. However, I do have plans for making an <a id='outwego' onclick='changeItUp()' style='text-decoration: none; cursor: pointer;'>open-source</a>, web-based, multi-target Verilog simulator."
			break;
		default:
			alert("Nah don't mess with this pls")
	}
}

window.onbeforeunload = function () {
	save_all_files_to_storage()
	window.localStorage.evalboardtheme = document.getElementById("evalthemeselector").value
	window.localStorage.editor_width = $("#editor-workspace").width()
	localStorage.ace_options = JSON.stringify (editor.getOptions())
	if (localStorage.ice40DarkMode == "true")
		localStorage.ace_dark_theme = editor.getOption("theme")
	else if (localStorage.ice40DarkMode == "false")
		localStorage.ace_light_theme = editor.getOption("theme")
	clearInterval(autosaver)
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

function save_all_files_to_storage() {
	labels = Array.from($('.tab-label'))
	labels.pop()	// removes Add button from list, since it is not a code file
	tab_list = []
	labels.forEach (e => {
		data = {
			name: $(e).parent().attr('name'),
			session: $(e).parent().attr('session'),
			code: editor_tab_list[$(e).parent().attr('session')].getValue(),
			mtime: $(e).parent().attr('mtime'),
			state: $(e).parent().attr('state') || 'open'
		}
		// if not saved to storage, save it
		if (JSON.parse (window.localStorage.tab_data).filter (el => el.name == data.name).length == 0) {
			new_arr = JSON.parse (window.localStorage.tab_data)
			new_arr.push (data)
			window.localStorage.tab_data = JSON.stringify (new_arr)
		}
		else {
			all_data = JSON.parse (window.localStorage.tab_data)
			all_data [all_data.indexOf (all_data.filter (el => el.name == data.name)[0])].code = data.code
			all_data [all_data.indexOf (all_data.filter (el => el.name == data.name)[0])].mtime = data.mtime
			all_data [all_data.indexOf (all_data.filter (el => el.name == data.name)[0])].state = data.state
			window.localStorage.tab_data = JSON.stringify (all_data)
		}			
	})
	// tab_list.forEach ((file, i) => {
	// 	// find tabs not in storage
	// 	if (file.name.includes ("undefined"))
	// 		return
	// 	get_file_by_name (file.name, JSON.parse (window.localStorage.tab_data))
	// 	.then ((result) => {
	// 		new_tab_data = JSON.parse (window.localStorage.tab_data)
	// 		// x = new_tab_data.map (e => e.name == result.name && !e.name.includes ("undefined"))
	// 		// modify stored file if already in storage
	// 		if (result.name == file.name) {
	// 			// file.code = result.code
	// 			file.session = i
	// 			file.mtime = result.mtime
	// 		}
	// 		// else add new file to storage
	// 		else if (result.name == "filenotfound") {
	// 			file.session = i
	// 		}
	// 		new_tab_data.push (file)
	// 		// save new array, and filter out duplicates
	// 		filtered_data = []
	// 		for (var elm in new_tab_data) {
	// 			if (filtered_data.filter (e => e.name == new_tab_data [elm].name).length == 0) {
	// 				filtered_data.push (new_tab_data [elm])
	// 			}
	// 		}
	// 		window.localStorage.tab_data = JSON.stringify ([...filtered_data])
	// 	})
	// })
	window.localStorage.active_tab = window.active_tab.getAttribute ('name')
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

function autosave_call(opt) {
	save_all_files_to_storage()
	$("#savedstat").html('Autosaved all files to local storage!')
	$("#savedstat").css('opacity', '1')
	setTimeout(() => { $("#savedstat").animate({ 'opacity': 0 }, 250) }, 3750)
}

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
	editor.getSession().clearAnnotations()
	for (var id in error_id) {
		editor.session.removeMarker(error_id[id])
	}
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

	ws = new WebSocket((window.location.protocol == "http:" ? "ws://" : "wss://") + window.location.hostname + ((window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") ? ":4500/" : "/"))
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

		else if (event.data == "Simulation successfully started!") {
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
			catch {
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
		editor.getSession().clearAnnotations()
		for (var id in error_id) {
			editor.session.removeMarker(error_id[id])
		}
		if (ws.readyState == 1) {
			ws.send("give us a demo please")
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

// Overlay functions

function loadVerilog(event) {
	selector = document.getElementsByName("project_list")[0]
	selectedIndex = selector.selectedIndex
	if (selectedIndex >= 0) {
		name = selector.item(selectedIndex).textContent.split(" - ")[0]
		ctime = selector.item(selectedIndex).textContent.split(" - ")[1]
		// does tab not exist?
		if (!($('.editor-tab').map((i, e) => $(e).attr('name')).get().includes(name))) {
			add_tab({
				'name': name,
				'session': Object.keys(editor_tab_list).length,
				'ctime': ctime,
				'mtime': new Date(),
				'state': 'open'
			})
			var sess = new EditSession(selector.item(selectedIndex).value)
			editor_tab_list[Object.keys(editor_tab_list).length] = sess
		}
		select_tab_by_element($('[name="' + name + '"]')[0])
		editor.setValue(selector.item(selectedIndex).value, -1)
	}
	editor.session.setMode("ace/mode/verilog")
	closeOverlay()
	return false
}
function clearStorage() {
	selector = document.getElementsByName("project_list")[0]
	selector.options.length = 0
	window.localStorage.tab_data = "[]"
	populateSelector()
}
function clearItem() {
	selector = document.getElementsByName("project_list")[0]
	result = confirm("Are you sure you want to delete " + name + " from storage? THIS ACTION IS NOT REVERSIBLE.")
	reversed = [...selector.selectedOptions].reverse()
	if (result) {
		for (var elm in reversed) {
			if (typeof reversed[elm] == "function")
				break
			option = reversed[elm]
			name = option.textContent.split(" - ")[0]
			clearItemFromStorage(name)
			selector.remove(Array.from (selector).indexOf (reversed[elm]))
		}
		populateSelector() 
	}
	selector.selectedIndex = 0
	return false
}
function clearItemFromStorage(name) {
	window.localStorage.tab_data = JSON.stringify (JSON.parse (window.localStorage.tab_data).filter (e => e.name != name))
}
function populateSelector() {
	$("[name=project_list]")[0].options.length = 0;
	list = JSON.parse(window.localStorage.tab_data)
	list.forEach(e => {
		var el = document.createElement("option");
		el.textContent = e.name + ' - ' + 'Modified ' + new Date (e.mtime).toUTCString();
		el.value = e.code;
		$("[name=project_list]")[0].appendChild(el);
	})
	$(function () { $("option").bind("dblclick", loadVerilog); });

	return false
}

function openVerilog() {
	document.getElementById("overlay").style.display = "flex";
	$('#overlay').animate({ 'opacity': '1' }, 200, async () => {
		blurMainView(0)
	})
	populateSelector()
}

async function closeOverlay() {
	document.getElementById("overlay").style.opacity = 1;
	time = new Date().getTime() / 1000.0
	$('#overlay').animate({ 'opacity': '0' }, 200, () => {
		document.getElementById("overlay").style.display = "none";
	})
	blurMainView(1)
}

function openUART() {
	$("#overlay_3").css('display', 'flex')
	$("#overlay_3").animate({ 'opacity': '1' }, 200, async () => {
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
	$('#overlay_2').animate({ 'opacity': 1 }, 200, async () => {
		blurMainView(0)
	})
}

async function blurMainView (opt) {
	function timeout(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	switch (opt) {
		case 0:
			for (i = 0; $("#mainview").css ('filter') != 'blur(2px)'; i += 2) {
				await timeout (1)
				$("#mainview").css ('filter', 'blur(' + (i / 10).toString() + 'px)')
			}
			break;
		case 1:
			for (i = 20; $("#mainview").css ('filter') != 'blur(0px)'; i -= 2) {
				await timeout (1)
				$("#mainview").css ('filter', 'blur(' + (i / 10).toString() + 'px)')
			}
			break;
	}
}

async function closeSettings() {
	if ($('#overlay_2').css('display') == 'none')
		return false
	$('#overlay_2').animate({ 'opacity': 0 }, 200, () => {
		$('#overlay_2').css('display', 'none')
	})
	blurMainView(1)
}

// Sorry guys.  One day...
// function save_current_tab_to_server() {
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

function autosave_interval() {
	clearInterval(autosaver)
	AUTOSAVE_TIME = parseInt(document.getElementById("autosave_interval").valueOf().value)
	if (AUTOSAVE_TIME < 15000) {
		AUTOSAVE_TIME = 15000
		$("#autosave_interval").val(15000)
	}
	else if (AUTOSAVE_TIME > 120000) {
		AUTOSAVE_TIME = 120000
		$("#autosave_interval").val(120000)
	}
	autosaver = setInterval(function () { autosave_call(false) }, AUTOSAVE_TIME);
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

	error_id.map(id => editor.session.removeMarker(error_id[id]))
	error_id = []
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

function open_tabs_from_storage() {
	list = JSON.parse(window.localStorage.tab_data)
	list.forEach(e => {
		if (e.state == 'closed')
			return
		else if (e.state != 'open')
			e.state = 'open'
		var sess = new EditSession(e.code)
		editor_tab_list[Object.keys(editor_tab_list).length] = sess
		delete e.code
		e.session = Object.keys(editor_tab_list).length - 1
		add_tab(e)
	})
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

function select_tab_by_element(elm) {
	// save last tab hopefully?
	if ($(window.active_tab).attr('session') && editor_tab_list[$(window.active_tab).attr('session')]) {
		editor_tab_list[$(window.active_tab).attr('session')].setValue(editor.session.getValue())
	}
	$('[class=editor-tab][name!="' + elm.getAttribute('name') + '"]').css('filter', 'unset')
	window.active_tab = elm
	$('[name="' + elm.getAttribute('name') + '"]').css('filter', 'var(--editor-tab-selected)')
	if ($(elm).attr('session') && editor_tab_list[$(elm).attr('session')]) {
		editor.setValue((editor_tab_list[$(elm).attr('session')]).getValue(), -1)
	}
	else {
		editor.setValue(window.localStorage.original_code, -1)
	}
}

function select_tab_by_event(event) {
	if (event.target.id == "editor-tab-add" || $(event.target).nodeName == "PATH" || event.target.classList.contains('tab-close'))
		return
	else if ($(event.target).prop('tagName') != "LABEL" && $(event.target).css('filter') != 'var(--editor-tab-selected)') {
		select_tab_by_element(event.target)
	}
}

function add_tab(tabdata) {
	element = '<div class="editor-tab" ' +
		'name="' + tabdata.name + '" ' +
		'session="' + tabdata.session + '" ' +
		'ctime="' + tabdata.ctime + '" ' +
		'mtime="' + tabdata.mtime + '" ' +
		'state="' + tabdata.state + '">' +
		'<label class="tab-label" spellcheck="false" contenteditable="false">' +
		(tabdata.name.startsWith("undefined") ? "Set name..." : tabdata.name) +
		'</label>' +
		'<i class="fa fa-times tab-close"></i>' +
		'</div>'
	$('#editor-tab-add').before($(element))
}

function tab_exists(name) {
	return new Promise ((resolve, reject) => {
		try {
			Array.from ($('#editor-tab-header').children()).forEach (e => {
				if (e.getAttribute ('name') == name)
					resolve (true)
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
			$("#editor-tab-header").animate ({'opacity': '1'}, opt ? 10 : 1000);
			$("#outputview").css ('display', 'none');
			$("#terminal").css ('display', 'none');
			break;
		case 1:
			$("#view_code").removeClass ("btn-view-active")
			$("#view_terminal").addClass ("btn-view-active")
			$("#view_output").removeClass ("btn-view-active")
			$("#codemirror_box").css ('display', 'none');
			$("#resize-editor").css ('display', 'none');
			$("#editor-tab-header").animate ({'opacity': '0'}, opt ? 10 : 1000);
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
			$("#editor-tab-header").animate ({'opacity': '0'}, opt ? 10 : 1000);
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

window.onload = function () {
	var last_page_x = window.localStorage.editor_width || 2000;
	$('#editor-workspace').width (window.localStorage.editor_width || '65%')
	$('#outputview').width (window.localStorage.editor_width || '65%')

	window.addEventListener("mousewheel", codescroll, { passive: false })
	load_button.innerHTML = load_btn_text

	if (!window.localStorage.evalboardtheme) {
		document.getElementById("evalthemeselector").value = "Modern"
		window.localStorage.evalboardtheme = "Modern"
	}
	else {
		changeBoardTheme(window.localStorage.evalboardtheme)
		document.getElementById("evalthemeselector").value = window.localStorage.evalboardtheme
	}

	if (window.localStorage.ice40DarkMode == "true") {
		// we need to move the button too, so we set dark mode manually
		window.localStorage.ice40DarkMode = "false"
		darkMode()
		update_status(CURRENT_STATUS[0], CURRENT_STATUS[1])
	}
	else if (!window.localStorage.ice40DarkMode) {
		// users will by default see light mode, so we'll set dark mode 
		// options when they load the page
		window.localStorage.ice40DarkMode = "false"
	}
	if (window.localStorage.ice40DarkMode == "false") {
		lightMode()
	}

	$('#localport').on ('keydown', e => {
		console.log (e)
	})

	$('body').on('keydown', '.tab-label', e => {
		if (e.which == 13) {
			document.activeElement.blur()
			e.target.setAttribute ('contenteditable', 'false')
			e.target.style.filter = ""
			// what if they decide to make no changes and hit Enter anyway? We don't want any new changes then
			if (e.target.innerHTML == e.target.previous_text)
				return
			else if (JSON.parse (localStorage.tab_data).filter (el => el.name == e.target.previous_text).length > 0) {
				all = JSON.parse (localStorage.tab_data)
				item = all.filter (el => el.name == e.target.previous_text)[0]
				all = all.map (el => {
					if (el.name == e.target.previous_text)
						el.name = e.target.innerHTML
					return el
				})
				window.localStorage.tab_data = JSON.stringify (all)
			}
			e.target.innerHTML.replace(/ +/, '')
			if (!(e.target.innerHTML.endsWith('.v')))
				e.target.innerHTML += '.v'
			
			tab_exists (e.target.innerHTML).then (result => {
				if (result) {
					alert ("Tab names must be unique.")
					getBackName = e.target.innerHTML.slice (0, e.target.innerHTML.length - 2)
					getBackName += ($('#editor-tab-header').children().length - 1).toString() + ".v"
					e.target.innerHTML = getBackName
				}
				$(e.target).parent().attr('name', e.target.innerHTML)
				save_all_files_to_storage()
			})
		}
	}).on('keydown', '.ace_text-input', e => {
		autocompleteOff  = $($('.ace_content')[1]).css ('line-height') == "0px"
		findBoxInvisible = !$('.ace_search').css ('display') || $('.ace_search').css ('display') == 'none'
		// Keep track of whether multi-cursor is being used 
		if (e.ctrlKey && e.altKey && (e.which == 38 || e.which == 40 || document.activeElement.classList.contains ("ace_text-input")))
			window.multiselect = true
		// If user tries to escape, DO NOT BLUR FOCUS
		else if (window.multiselect && e.which == 27) {
			window.multiselect = false
		}
		// If user has already escaped multicursor, and, 
		// if user is not using predictive text, and,
		// if user is not using the find box,
		// they can now blur focus
		else if (!window.multiselect && e.which == 27 && findBoxInvisible && autocompleteOff) {
			document.activeElement.blur()
		}
		if (e.ctrlKey && e.which == 83 && e.type == 'keydown') {
			e.preventDefault()
			//save file to storage
			if (!($(window.active_tab).attr('name').endsWith(".v")))
				alert ("To organize your code better, enter a filename in the tab.  Remember " + 
					   "that you will not be able to open this in another computer, however, so " + 
					   "make sure to actually save your code somewhere else.")
			else
				save_all_files_to_storage()
			if (localStorage.simulateOnSave == "true")
				ice40hx8k_handler()
		}
		else if (e.ctrlKey && e.which == 192 && e.type == "keydown") {
			// ctrl + ` support to scroll tabs
			e.preventDefault()
			len = $('#editor-tab-header').children().length
			old_idx = $('#editor-tab-header').children().index (window.active_tab)
			new_idx = old_idx == len - 2 ? 0 : old_idx + 1
			select_tab_by_element ($('#editor-tab-header').children()[new_idx])
		}
		else if (e.ctrlKey && e.shiftKey && e.which == 84 && e.type == "keydown") {
			// ctrl + shift + t support to add a tab
			e.preventDefault()
			add_tab_handler (e)
		}
		else if (e.ctrlKey && e.altKey && e.which == 87 && e.type == "keydown") {
			// ctrl + alt + w support to add a tab
			e.preventDefault()
			e.target = window.active_tab
			close_tab_handler (e)
		}
		else if ($(window.active_tab).attr('session') && editor_tab_list[$(window.active_tab).attr('session')]) {
			editor_tab_list[$(window.active_tab).attr('session')].setValue(editor.session.getValue())
		}
	}).on('mouseenter', '.editor-tab', e => {
		if (e.target.style.filter != 'var(--editor-tab-selected)')
			e.target.style.filter = "var(--editor-tab-hover)"
	}).on('click', '.tab-label', e => {
		if (e.ctrlKey || e.shiftKey) {
			e.target.previous_text = e.target.innerHTML
			e.target.setAttribute ('contenteditable', 'true')
		}
		else {
			select_tab_by_element ($(e.target).parent()[0])
		}
	}).on('mouseleave', '.editor-tab', e => {
		if (e.target.style.filter == 'var(--editor-tab-hover)')
			e.target.style.filter = ""
	}).on('blur', '.tab-label', e => {
		if (e.target.innerHTML.replace(/ +/, "") == "") {
			alert("Please specify a name for this code file.")
			e.target.innerHTML = "new" + ($('#editor-tab-header').children().length - 1).toString() + ".v"
		}
		$(e.target).css('background-color', 'var(--editor-tab-bg)')
	}).on('click', '.editor-tab', e => {
		if (e.target.classList.contains('editor-tab'))
			select_tab_by_event(e)
	}).on('click', '.tab-close', close_tab_handler
	).on ('click', '#editor-tab-add', add_tab_handler
	).on ('mousedown', '#resize-editor', e => {
		e.preventDefault();
		if (term)
			term.resize (parseInt ($("#editor-workspace").width() / 10.5), parseInt ($("#editor-workspace").height() / 22.5))
		$(e.target).addClass ('dragging')
		last_page_x = e.pageX
		return false;
	})

	function close_tab_handler (e) {
		if ($('.editor-tab').length > 2) {
			var deleted = null;
			if ($(e.target).prop('tagName') == 'path') {
				deleted = $(e.target).parent().parent()
			}
			else if ($(e.target).prop('tagName') == 'DIV') {
				deleted = $(e.target)
			}
			else {
				deleted = $(e.target).parent()
			}
			delete editor_tab_list[deleted.attr('session')]
			for (var elm in JSON.parse (localStorage.tab_data)) {
				if (deleted.attr ('name') == JSON.parse (localStorage.tab_data)[elm].name) {
					load = JSON.parse (localStorage.tab_data)
					load[elm].state = 'closed'
					localStorage.tab_data = JSON.stringify (load)
				}
			}
			deleted.remove()
			new_last = $('.editor-tab').get().slice($('.editor-tab').length - 2, $('.editor-tab').length - 1)[0]
			select_tab_by_element(new_last)
		}
		else
			alert("There must always be one tab open. Add a new tab first, then close this one.")
	}

	function add_tab_handler (e) {
		// adding new session
		var sess = new EditSession(window.localStorage.original_code)
		var tab = 0
		for (tab = Object.keys(editor_tab_list).length; tab.toString() in editor_tab_list; tab++);
		editor_tab_list[tab] = sess
		add_tab({
			name: "undefined" + tab.toString(),
			session: tab.toString(),
			ctime: new Date(),
			mtime: new Date(),
			state: 'open',
		})
		new_tab = $('.editor-tab').get().slice($('.editor-tab').length - 2)[0]
		select_tab_by_element(new_tab)
		load_template()
	}

	$(document).mousemove (e => {
		if ($('#resize-editor')[0].classList.contains ("dragging")) {
			if (e.pageX < last_page_x) {
				// left
				$("#editor-workspace").width($("#editor-workspace").width() - (last_page_x - e.pageX))
				$("#outputview").width($("#editor-workspace").width() - (last_page_x - e.pageX))
			}
			else {
				// right
				$("#editor-workspace").width($("#editor-workspace").width() + (e.pageX - last_page_x))
				$("#outputview").width($("#editor-workspace").width() + (e.pageX - last_page_x))
			}
			last_page_x = e.pageX
		}
	})

	$(document).mouseup (e => {
		$('#resize-editor').removeClass ('dragging')
		return false;
	})


	// When the simulator starts for the first time, load template and set up tabs:
	promised_code = new Promise((resolve, reject) => {
		try {
			$.get({ url: "/assets/" + template_code, cache: false }, function (data) {
				window.localStorage.original_code = data
				resolve()
			});
		}
		catch (err) {
			reject(err)
		}
	})

	Promise.resolve(promised_code).then(() => {
		if (!window.localStorage.tab_data) {
			var sess = new EditSession(window.localStorage.original_code)
			new_file = {
				'name': "template.v",
				'session': '0',
				'code': window.localStorage.original_code,
				'ctime': new Date(),
				'mtime': new Date(),
				'state': 'open'
			}
			editor_tab_list['0'] = sess
			window.localStorage.tab_data = JSON.stringify([new_file])
			editor_tab_list[Object.keys(editor_tab_list).length] = sess
			add_tab(new_file)
			editor.session.setValue (window.localStorage.original_code)
			new_tab = $('.editor-tab').get().slice($('.editor-tab').length - 2)[0]
			select_tab_by_element(new_tab)
		}
		else {
			open_tabs_from_storage()
			try {
				select_tab_by_element($('[name="' + localStorage.active_tab + '"]')[0])
			}
			catch (err) {
				console.log ("Pointed to undefined tab, reverting to first tab...")
				select_tab_by_element($('#editor-tab-header').children()[0])
			}
		}
	})
		.catch(err => {
			console.error(err)
		})
	
	// If you used the old version of the simulator, this takes out all the old codesave structures
	// It was pretty much a mess tbh
	Object.keys (localStorage).forEach (e => {
		if (e.includes ("lastSavedCode"))
			localStorage.removeItem (e)
	})

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) 
		alert ("This site is not currently optimized for mobile devices. You can tap around, but full functionality may not be available, specifically interaction with the FPGA.")
	if (!window.localStorage.tab_data)
	{
		alert ("If you have never visited this page before, welcome! Glad to have you try this page out for the first time!\nIf you've used the simulator before, however, you might be browsing incognito. Take care to save your code to your computer, because the webpage will not be able to save it when your incognito session closes.")
	}
	if (window.localStorage.uartmode) {
		alert ("The simulator's UART option has now been permanently turned on in light of the unnecessary need to switch between two modes of simulation.  The UART panel will only include the Auto-Switch option, and the template code will now always include the UART ports.")
		document.documentElement.setAttribute("uart-option", "true")
		$('#uart_view').css ('display', 'flex')
		template_code = "270sim_source_uart.v"
		delete window.localStorage.uartmode
	}
	if (window.localStorage.autoTerminalSwitch == "false" || !window.localStorage.autoTerminalSwitch) {
		document.documentElement.setAttribute("autoterminal-option", "false")
		window.localStorage.autoTerminalSwitch = "false"
	}
	else if (window.localStorage.autoTerminalSwitch == "true") {
		document.documentElement.setAttribute("autoterminal-option", "true")
		window.localStorage.autoTerminalSwitch = "true"
	}

	if (window.localStorage.localsimulation == "false" || !window.localStorage.localsimulation) {
		document.documentElement.setAttribute("localsimulation-option", "false")
		window.localStorage.localsimulation = "false"
	}
	else if (window.localStorage.localsimulation == "true") {
		document.documentElement.setAttribute("localsimulation-option", "true")
		window.localStorage.localsimulation = "true"
	}

	if (!window.localStorage.ace_options) {
		window.localStorage.ace_options = JSON.stringify (editor.getOptions())
	}
	else {
		editor.setOptions(JSON.parse (window.localStorage.ace_options))
		editor.setOption ("theme", localStorage.ice40DarkMode == "true" ? localStorage.ace_dark_theme : localStorage.ace_light_theme)
	}

	setTimeout (() => {
		$('#overlay_top').animate ({'opacity': '0'}, 500, () => {
			$('#overlay_top').css ('display', 'none')
			editor.renderer.setShowGutter(true);
			editor.renderer.scrollBarV.element.style ['display'] = ""
			editor.renderer.scrollBarH.element.style ['display'] = ""
		})
	}, 250)

	// lil welcome message for the JS programmers in devtools
	console.log("%c\n\n\nFellow DigiJocks and DigiJockettes, thanks for checking out the code!\n\n\n" +
		"The main JS functions lie in assets/js/simulator_backend.js.\n\n\n",
		"background: #eeeeee; color: black; font-size: medium")
	
	if (!localStorage.announcement_count || parseInt (localStorage.announcement_count) < 1) {
		alert ("Welcome back!  Thanks for your continued interest in accessing the simulator!  This page may change radically " +
			   "throughout the summer, so I'll try my best to document changes in the changelog on the help page.  Try them out if you're interested ("
			   +"although there is no guarantee that they will work.)")
		localStorage.announcement_count = 1
	}
}
