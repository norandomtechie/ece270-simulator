/* 
    simulate.js
    Author: Niraj Menon
    File creation date: 1/5/2020
    Code first written: 31/7/2019

    Description: 
    Contains handler and supporting code for authorized incoming
    WebSocket connection.

    The handler checks if the incoming data is either Verilog code or 
    button inputs from the simulator. It remembers if Verilog code was 
    first sent by maintaining state information for each WebSocket 
    connection from every user.

    The Verilog code is syntaxically checked, compiled, synthesized, 
    and finally simulated with the help of external tools like CVC/Icarus
    and Yosys. Any errors in the code will cause the WebSocket to send
    them back and immediately close the connection.
*/

const fs = require('fs-extra');
const os = require('os');
const cp = require('child_process');
const crypto = require('crypto');
const path = require('path');
const rimraf = require('rimraf'),
      hostname = os.hostname();

/* 
    https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty
*/

function deleteFile(dir, file) {
    return new Promise(function (resolve, reject) {
        try {
            var filePath = path.join(dir, file);
            fs.lstat(filePath, function (err, stats) {
                if (err) {
                    return reject(err);
                }
                if (stats.isDirectory()) {
                    resolve(deleteDirectory(filePath));
                } else {
                        fs.unlink(filePath, function (err) {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    }
            });
        }
        catch (err) {
            reject (err)
        }
    });
}

function deleteDirectory(dir) {
    return new Promise(function (resolve, reject) {
        fs.access(dir, function (err) {
            if (err) {
                return reject(err);
            }
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return reject(err);
                }
                Promise.all(files.map(function (file) {
                    return deleteFile(dir, file);
                })).then(function () {
                    fs.rmdir(dir, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }).catch(reject);
            });
        });
    });
}

function deleteFolderRecursive (path) {
    rimraf (path, (err) => {
        if (err) console.log (err)
    })
};

/*****************************************************/

function debugLog(message) {
    console.log(getTime() + ": " + message)
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function getTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var min = (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())
    var sec = (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds())
    var time = today.getHours() + ":" + min + ":" + sec;
    return (date + ' ' + time);
}

function connection(ws, request) {
    ws.currentState = "INIT";
    username = "demouser"

    ws.on('message', function incoming(message) {
        switch (ws.currentState) {
            case "INIT":
                var payload = JSON.parse (message);
                var workspace = payload.files;
                ws.simType = payload.settings.simType;
                ws.codelist = [];
                var hash = crypto.createHash('sha256');

                workspace.forEach (file => { hash.update(file.code) });
                
                hash.update ((new Date().getTime()).toString());
                hash.update (username);
                ws.unique_client = hash.digest('hex');
                ws.simulator_object = null;
                ws.filenames = [];
                
                fs.mkdirSync(path.resolve('/tmp/tmpcode', ws.unique_client), (err) => {
                    if (err) { throw err; }
                });
                workspace.forEach (file => {
                    if (file.code.includes("give us a demo please")) {
                        file.code = fs.readFileSync(`${__dirname}/sim_modules/fpgademo.v`, 'utf8', function (err, data) {
                            if (err) throw err;
                        });
                    }
                    if (file.code.includes("give us a uart demo please")) {
                        file.code = fs.readFileSync(`${__dirname}/sim_modules/uart_fpgademo.v`, 'utf8', function (err, data) {
                            if (err) throw err;
                        });
                    }
                    fs.writeFileSync(path.resolve('/tmp/tmpcode', ws.unique_client, file.name), file.code, 'utf8', function (err) {
                        if (err) { throw err; }
                    });
                    ws.filenames.push (file.name);
                    ws.codelist.push (file.code);
                });

                // Triggering "Synthesizing..." on webpage
                ws.send("Processing Verilog code...")

                var supports = payload.settings.support.map (e => 'support/' + e);
                var error = [], modded_error = [], error_line = [];
                var FILES;
                try {
                    const VERILATOR = "verilator"
                    const VFLAGS    = "--lint-only --top-module top"
                          SUPPORTS  = supports.reduce ((p,n) => p + " " + n, "") + " "
                          FILES     = `${__dirname}/sim_modules/cells_sim_timing.v ${__dirname}/sim_modules/cells_map_timing.v `
                          FILES     += ws.filenames.filter (f => f.endsWith ('.sv')).map (f => path.resolve ('/tmp/tmpcode', ws.unique_client, f)).join (' ')
                    const WARNINGS  = ['%Warning-WIDTH', '%Warning-SELRANGE']
                    var err_regex = new RegExp ("(?:%Error|" + WARNINGS.join ('|') + ")(?:\-[A-Z0-9]+)?: " + '/tmp/tmpcode/[a-z0-9]+/([^:]+)' + ":([0-9]+):[0-9]+: (.+)", "g")
                    var err_regex_single = new RegExp ("(?:%Error|" + WARNINGS.join ('|') + ")(?:\-[A-Z0-9]+)?: " + '/tmp/tmpcode/[a-z0-9]+/([^:]+)' + ":([0-9]+):[0-9]+: (.+)")
                    var ignore_err_rgx = /(This may be because there\'s no search path specified with)/
                    
                    cp.execSync ([VERILATOR, VFLAGS, SUPPORTS, FILES].join (" "), { cwd: __dirname })
                }
                catch (e) {
                    if (e) {
                        var errors = []
                        ws.verilatorLog = e.message
                        if (e.message.match (err_regex)) {
                            e.message.match (err_regex).forEach (elm => {
                                var json_ignore = elm.includes ('Cannot find file containing module') && ws.filenames.filter (f => f.endsWith ('.json')).length > 0
                                var ignore_errors = ignore_err_rgx.test (elm)
                                if (errors.length - 1 >= 0 && (errors[errors.length - 1].line == elm.match (err_regex_single)[2]) && !json_ignore && !ignore_errors)
                                    errors[errors.length - 1].error = errors[errors.length - 1].error + "\n" + elm.match (err_regex_single)[3]
                                else if (!json_ignore && !ignore_errors) {
                                    errors.push ({
                                        name: elm.match (err_regex_single)[1],
                                        line: elm.match (err_regex_single)[2],
                                        error: elm.match (err_regex_single)[3]
                                    })
                                }
                            })
                        }
                        error_line = errors
                    }
                    else {
                        error_line = []
                    }
                }

                error_line.forEach (err => {
                    modded_error.push (err.name + ": Line " + err.line + ": Verilator - " + err.error)
                })

                if (modded_error.length > 0) {
                    if (!fs.existsSync("error_log/" + username)) {
                        fs.mkdirSync(path.resolve("error_log/", username), (err) => {
                            if (err) { throw err; }
                        })
                    }
                    fs.moveSync("/tmp/tmpcode/" + ws.unique_client, "error_log/" + username + "/" + getTime().replaceAll(" ", "_") + "_" + ws.unique_client)
                    ws.send(ws.verilatorLog + "\nYosys did not run." + "\nCompilation failed with the following error:\n" + modded_error.join('\n'))
                    ws.close()
                    return
                }

                // 5/23/2021
                // run Yosys only if we're doing mapped simulations
                if (ws.simType == 'mapped') {
                    // remove yosys files from list
                    FILES = FILES.replace (`${__dirname}/sim_modules/cells_sim_timing.v ${__dirname}/sim_modules/cells_map_timing.v `, '')
                    JSONS = ws.filenames.filter (f => f.endsWith ('.json'));
                    SUPPORTS = supports.map (e => `${__dirname}/${e}`).reduce ((p,n) => `${p} ${n}`, "") + " ";
                    
                    try {
                        yosys_out = cp.execSync('yosys -p ' + 
                        (JSONS.length > 0 ? ('"read_json ' + JSONS.join (' ') + '; ') : '" ') +
                        `read_verilog -sv ${SUPPORTS} ${FILES}; ` +
                                                'synth_ice40 -top top; ' +
                                                'write_verilog /tmp/tmpcode/' + ws.unique_client + '/struct_code.v; ' + 
                                                'write_json /tmp/tmpcode/' + ws.unique_client + '/struct.json;" ' + 
                                                '-l /tmp/tmpcode/' + ws.unique_client + '/yosyslog', {timeout: 60000, cwd: path.resolve ('/tmp/tmpcode', ws.unique_client)})
                                                ws.yosysJSON = fs.readFileSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'struct.json')).toString()
                                                fs.unlinkSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'yosyslog'))
                        ws.initYosys = true
                    }
                    catch (ex) {
                        if (ex.errno == 'ETIMEDOUT') {
                            // Can't kill Yosys by PID since it changes after execSync for some weird reason
                            // So we got to use ps and find it by its unique client ID
                            psy = cp.execSync ("ps -eo pcpu,pid,args | sort -k1 -r -n | grep yosys").toString().split ("\n")
                            psy = psy.map (el => {
                                if (el.slice (0, 1) == ' ')
                                    return el.slice (1)
                                else
                                    return el
                            }).filter (el => el != '')
                            psy.forEach (proc => {
                                if (proc == '')
                                    return
                                pcpu = parseFloat (proc.slice (0, proc.indexOf (" "))); proc = proc.slice (proc.indexOf (" ") + 1)
                                pid = parseInt (proc.slice (0, proc.indexOf (" "))); args = proc.slice (proc.indexOf (" ") + 1)
                                if (parseFloat (pcpu) > 90 && args.includes ("yosys") && args.includes (ws.unique_client)) {
                                    try {
                                        process.kill (pid);
                                    }
                                    catch (err) {
                                        console.error ("Unable to kill Yosys PID " + pid || 'pid undefined');
                                        console.error (err);
                                    }
                                }
                            });
                            ws.send ("YOSYS HUNG: " + ex.output.toString())
                            ws.close()
                            return;
                        }
    
                        yosys_out = fs.readFileSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'yosyslog')); 
                        ws.yosysJSON = 'No JSON was produced because Yosys ran into an error.'; 
                        fs.unlinkSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'yosyslog')); 
                        ws.initYosys = false; 
    
                        function indexOfReg(arr, search) {
                            for (var elm in arr) {
                                try {
                                    if (typeof arr[elm] == 'string' && arr[elm].match(search)) {
                                        d = new Object();
                                        d.message = arr[elm]; 
                                        d.lineno = arr.indexOf(arr[elm]); 
                                        return d; 
                                    }
                                }
                                catch (ex) {
                                    debugLog('indexOfReg failed');
                                    debugLog(arr);
                                    d = new Object();
                                    d.message = "[ERROR] Internal server error. Please try again later."; 
                                    d.lineno = 1; 
                                    return d;
                                }
                            }
                        }
                        // debugLog (yosys_out.toString())
                        logarray = yosys_out.toString().split("\n")
                        error_msg = indexOfReg(logarray, (/Error/i))
    
                        if (error_msg && error_msg.message.includes("server error")) {
                            debugLog("FATAL: Yosys encountered an unknown error unrelated to code.")
                        }
                        else  // Is a mapping error
                        {
                            related_error = indexOfReg(logarray, (/Error/i))
                            skippable_error_regex = /syntax error, unexpected \$end/i
                            if (related_error && !related_error.message.match(skippable_error_regex)) {
                                // Lazy catch-all for if there was an error but no other details were captured.
                                if (related_error.message.includes('server error')) {
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + ws.filenames.filter (f => f.endsWith ('.sv'))[0] + "(1) [SERVER_ERROR] Your code has errors unrecognized by the server. Make sure to check for missing semicolons, wrong flip flop declarations and so on.")
                                }
                                // If students try to pull an output low when it is already connected to a high.
                                if (related_error.message.includes("Mismatch in directionality for cell port")) {
                                    var codeline = related_error.message.replace(/ERROR: Mismatch in directionality for cell port [^ ]+ /, '')
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + ws.filenames.filter (f => f.endsWith ('.sv'))[0] + "(1) [SYNTHESIS_ERROR] You are trying to drive a signal with two different sources. More information is in: " + codeline)
                                }
                                // Wrong flip flop reset logic
                                else if (related_error.message.includes("Multiple edge sensitive events")) {
                                    var codeline = logarray[logarray.indexOf(related_error.message) - 1]
                                    var filename = codeline.match(/([\w]+\.sv):([0-9]+)/)[1]
                                    codeline = parseInt(codeline.match(/([\w]+\.sv):([0-9]+)/)[2])
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + filename + "(" + codeline + ") [SYNTHESIS_ERROR] This flip flop does not have correct reset logic.")
                                }
                                // For all 'if (reset) perform invalid logic' statements
                                else if (related_error.message.match(/yields non-constant value/i)) {
                                    var signal = logarray[related_error.lineno].match(/\\([\w]+) yields non-constant value/i)[1]
                                    msg = "**/tmp/tmpcode/hiddentmpcodefolderpath/" + ws.filenames.filter (f => f.endsWith ('.sv'))[0] + "(" + related_error.lineno + ")"
                                    msg += "Two asynchronous resets not allowed in flip flop. '" + signal + "' does not appear to be a valid reset for this FF."
                                    error.push(msg)
                                }
                                // Edge triggering signals for the flip flop cannot be mapped to real flip-flop models.
                                else if (related_error.message.match(/Found non-synthesizable event list!/i)) {
                                    var codeline = logarray[logarray.indexOf(related_error.message)]
                                    var filename = codeline.match(/([\w]+\.sv):([0-9]+)/)[1]
                                    codeline = parseInt(codeline.match(/([\w]+\.sv):([0-9]+)/)[2])
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + filename + "(" + codeline + ") [SYNTHESIS_ERROR] The port list for this flip flop cannot be mapped to real hardware.")
                                }
                                // missing module errors (safest if checked here since JSON would have been parsed)
                                else if (related_error.message.match(/referenced in module [^ ]+ in cell [^ ]+ is not part of the design/i)) {
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + ws.filenames.filter (f => f.endsWith ('.sv'))[0] + "(1) [SYNTHESIS_ERROR] " + related_error.message.replace ('ERROR: ', ''))
                                }
                                else if (related_error.message.match(/ERROR: Module `top' not found!/i)) {
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + ws.filenames.filter (f => f.endsWith ('.sv'))[0] + "(1) [MISSING_MODULE] The top module appears to be missing.  ")
                                }
                                else if (related_error.message.match(/ERROR: Identifier `[^']+' doesn't map to any signal/i)) {
                                    [ign, message, filename, lineno] = related_error.message.match (/ERROR: (Identifier `[^']+' doesn't map to any signal) at \/tmp\/tmpcode\/[a-z0-9]+\/([^\.]+\.sv):([0-9]+)/)
                                    error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + filename + "(" + lineno + ") " + message)
                                }
                                else {
                                    general_error = /\/tmp\/tmpcode\/[a-z0-9]+\/([^\.]+\.sv)\:([0-9]+)\: ?(.+)/
                                    try {
                                        filename = related_error.message.match(general_error)[1]
                                        lineno = related_error.message.match(general_error)[2] || "1"
                                        message = related_error.message.match(general_error)[3]
                                        error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/" + filename + "(" + lineno + ") " + message)
                                    }
                                    catch (ex) {
                                        var message = related_error.message
                                        if (related_error.message.includes ("cmd error aborting 'source ")) {   // known to appear when outputs are multiply driven
                                            error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/"+ ws.filenames.filter (f => f.endsWith ('.sv'))[0] +"(1)No line number information - " + message + "\nPossible duplicate connections to outputs.")
                                        }
                                        else {
                                            error.push("**/tmp/tmpcode/hiddentmpcodefolderpath/"+ ws.filenames.filter (f => f.endsWith ('.sv'))[0] +"(1)No line number information - " + message)
                                        }
                                    }
                                }
                            }
                        }
                    }
    
                    // Custom error checks based on Regex
                    blif_unmapped_ffs = []
                    try {
                        if (error.length == 0) {
                            blif = fs.readFileSync('/tmp/tmpcode/' + ws.unique_client + '/temp.blif').toString().split('\n')
                            valid_flip_flops = ['_DFFE',
                                '_DFFSR',
                                '_DFFR',
                                '_DFFSS',
                                '_DFFS',
                                '_DFFESR',
                                '_DFFER',
                                '_DFFESS',
                                '_DFFES',
                                '_DFFN',
                                '_DFFNE',
                                '_DFFNSR',
                                '_DFFNR',
                                '_DFFNSS',
                                '_DFFNS',
                                '_DFFNESR',
                                '_DFFNER',
                                '_DFFNESS',
                                '_DFFNES']
    
                            blif.filter(function (v, i, a) {
                                if (v.match("_DFF") && !valid_flip_flops.includes(v.match("_DFF[^ ]+")[0])) {
                                    blif_unmapped_ffs.push(a[i])
                                }
                            })
                        }
                    }
                    catch (ex) {
                        // ignore.
                    }
    
                    // Line-by-line checks (no inline logic initializations, etc.)
                    ws.codelist.forEach ((e, fi) => {
                        linebyline = e.split('\n')
                        linebyline.filter(function (v, i, a) {
                            // Test for flip flops with both asynchronous reset and set, which are not valid flip flops in hardware.
                            while (blif_unmapped_ffs.length > 0) {
                                missing_flip_flop = blif_unmapped_ffs[0]
                                clock = missing_flip_flop.match("C\=[^ ]+")
                                console.log("clock: " + clock)
                                reset = missing_flip_flop.match("R\=[^ ]+")
                                console.log("reset: " + reset)
                                always_regex = new RegExp("always(\_ff)? ?@ ?\\((?:pos|neg)edge [^ ,]+, ?(?:pos|neg)edge [^ ,]+, ?(?:pos|neg)edge [^\\)]+\\)?")
                                ws.verilogCode.split('\n').filter(function (v, i, a) {
                                    if (v.match(always_regex)) {
                                        // console.log (v)
                                        message = "[CUSTOM_ERROR] Flip flops cannot have both an asynchronous set and reset. Use only either one."
                                        error.push('**/tmp/tmpcode/hiddentmpcodefolderpath/' + ws.filenames[fi] + '(' + (i + 1).toString() + "): " + message)
                                    }
                                })
        
                                blif_unmapped_ffs = blif_unmapped_ffs.slice(1)
                            }
                            ta_override = e.match (/give me a magic override against the inline logic assignment/gi)
                            startup_reg = !v.match(/(?:reg|logic) ?\[2\:0\] ?startup ?\= ?0\;/gi)
                            not_equating = !v.match(/(?:reg|logic) +[^=]+\={2}/i)
                            is_reg_or_logic = v.match(/(?:logic|reg) +[^=]+= *.+/gi)
                            // added 10/24/2020
                            not_typedef = !v.match(/typedef enum (?:logic|reg)? (?:[\[\]0-9\:]+) \{?/gi)
                            reg_regex = !ta_override && not_equating && !v.match(/(?:reg|logic) +\=+/i) && not_typedef && is_reg_or_logic && startup_reg && !v.match(/\<\=/gi)
                            if (reg_regex) {
                                message = "[CUSTOM_ERROR] You should not initialize a reg/logic outside an always block!"
                                error.push('**/tmp/tmpcode/hiddentmpcodefolderpath/' + ws.filenames[fi] + '(' + (i + 1).toString() + "): " + message)
                            }
                        })
                    })
                }


                if (ws.simType == 'mapped' && error.length != '0') {
                    modded_error = []
                    if (!fs.existsSync("error_log/" + username)) {
                        fs.mkdirSync(path.resolve("error_log/", username), (err) => {
                            if (err) { throw err; }
                        })
                    }
                    fs.moveSync("/tmp/tmpcode/" + ws.unique_client, "error_log/" + username + "/" + getTime().replaceAll(" ", "_") + "_" + ws.unique_client)
                    error.forEach(function (element) {
                        modded_err_rgx = /\*?\*?\/tmp\/tmpcode\/[a-z0-9]+\/([\w]+\.sv):?\(? ?([0-9]+)\)?/
                        colon_check = /\.sv\([0-9]+\)\:/
                        try {
                            var name = element.match(modded_err_rgx)[1]
                            var num = parseInt(element.match(modded_err_rgx)[2])
                            if (colon_check.test (element))
                                modded_err_msg = element.replace(modded_err_rgx, name + ': Line ' + num.toString())
                            else
                                modded_err_msg = element.replace(modded_err_rgx, name + ': Line ' + num.toString() + ": ")
                            modded_err_msg = modded_err_msg.replace(/\/tmp\/tmpcode\/[^\/]+\/([\w]+\.sv):[0-9]+: /, '')
                            modded_error.push(modded_err_msg)
                        }
                        catch (ex) {
                            debugLog("Cannot parse this error: " + element)
                            num = 1
                        }
                    })

                    if (modded_error.length != '0') {
                        ws.send("Verilator log:\n" + (ws.verilatorLog || 'Verilator produced no logs.') + 
                                "\nYosys-produced JSON:\n" + ws.yosysJSON + 
                                "\nYosys log:\n" + yosys_out + 
                                "\nCompilation failed with the following error:\n" + modded_error.join('\n'))
                        ws.close()
                    }
                }
                else {
                    // Introduced Yosys-produced gate-level synthesis approach
                    ws.currentState = "SIMULATE";
                    ws.rxdata = [];  ws.recvInput = ''; 
                    ws.rxclk = 'x';  ws.txclk = 'x';
                    ws.rxready = 'x';
                    var env = Object.create(process.env);
                    debugLog("Starting " + ws.unique_client + ' on IcarusVerilog'); 
                    // additional compile step - ugh
                    var IVL = 'iverilog ';
                    var VARGS = `-o /tmp/tmpcode/${ws.unique_client}/simcomm.vvp -g2012 -gspecify `;
                    if (ws.simType == 'source') {
                        var FILES = `${__dirname}/sim_modules/simcomm.sv /tmp/tmpcode/${ws.unique_client}/*.sv ` ;
                        var CELLS = ``;     // no need to use cell files for source simulations
                    }
                    else {
                        var FILES = `${__dirname}/sim_modules/simcomm.sv /tmp/tmpcode/${ws.unique_client}/struct_code.v ` ;
                        var CELLS = `${__dirname}/sim_modules/cells_sim_timing.v ${__dirname}/sim_modules/cells_map_timing.v `;
                    }
                    
                    // run compile step
                    try {
                        var output = cp.execSync(IVL + VARGS + FILES + CELLS, { cwd: `/tmp/tmpcode/${ws.unique_client}` });
                    }
                    catch (err) {
                        console.error (err)
                        ws.send('Error occurred in Icarus compile step: ' + err.stderr.toString()); 
                        ws.close();
                        return;
                    }

                    // now for the actual simulation
                    var sargs = `-M. -m ${__dirname}/sim_modules/simcomm /tmp/tmpcode/${ws.unique_client}/simcomm.vvp`.split(" ");
                    env.RECV_PIPE = '1';
                    env.SEND_PIPE = '0';
                    try {
                        // pipe stderr to stdout just in case we don't catch something
                        ws.simulator_object = cp.spawn('vvp', sargs, { cwd: `/tmp/tmpcode/${ws.unique_client}`, env: env, stdio: [ 'pipe', 'pipe', process.stdout ] });
                    }
                    catch (err) {
                        console.error (err)
                        console.error (err.stderr.toString())
                        ws.send('Error occurred in Icarus simulation: ' + err.stderr.toString()); 
                        ws.close();
                        return;
                    }
                    
                    ws.send("Simulation successfully started!\nVerilator log:\n" + (ws.verilatorLog || 'Verilator produced no logs.') + 
                            "\nYosys-produced JSON:\n" + ws.yosysJSON + "\nYosys log:\n" + (yosys_out || 'Yosys did not run - might be a source simulation.'))
                    ws.simTimeout = false; 
                    ws.error_caught = false; 

                    ws.simulator_object.stdout.on('data', (indata) => {
                        var data = indata.toString('utf8').trim()
                        var msgdata = data.replaceAll('\0', '')
                        try {
                            // normal simulation output will look like a JSON object: {'output_name': output_value...}
                            // if parsing of the object fails, it must be an error message
                            var parsed = JSON.parse(msgdata)
                            ws.send(JSON.stringify (parsed))
                        }
                        catch (ex) {
                            if (msgdata.includes("10 minutes exceeded")) {
                                ws.simTimeout = true; 
                                ws.send("TIME LIMIT EXCEEDED"); 
                                ws.simulator_object.kill('SIGTERM'); 
                            }
                            else if (msgdata.includes("iming violation")) {
                                ws.send("TIMING VIOLATION");
                            }
                            else if (msgdata.includes("VCD info: dumpfile")) {
                                // ignore.
                            }
                            else if (ws.readyState == 1) {
                                if (msgdata.includes(" Continue ") || msgdata.includes("Flushing output streams")) {
                                    // Meh.  Skip.
                                    // It's either literally continuing, or it's stopping.
                                    // ws.simulator_object.kill('SIGTERM'); 
                                }
                                else if (!msgdata.includes ('{"LFTRED"') && !msgdata.includes ('10 minutes exceeded')) {
                                    debugLog('IcarusVerilog gave unexpected output for ' + ws.unique_client + ' (' + username +  '): '); 
                                    debugLog(msgdata); 
                                    ws.error_caught = true; 
                                }
                            }
                        }
                    });
                    
                    ws.simulator_object.on('exit', (code, signal) => {
                        if (fs.existsSync(`/tmp/tmpcode/${ws.unique_client}/trace.vcd`)) {
                            fs.readFile(`/tmp/tmpcode/${ws.unique_client}/trace.vcd`, (err, data) => {
                                if (err) ws.send(JSON.stringify({'vcd': 'Error in reading VCD data.  Please try again.'}));
                                else ws.send(JSON.stringify({'vcd': data.toString()}));
                                ws.close()
                            });
                        }
                        else if (!ws.simTimeout && !ws.error_caught && ws.readyState == 1) {
                            debugLog("FATAL: Simulation has quit.")
                            debugLog('Code ' + code)
                            debugLog('Signal ' + signal)
                            if (signal == 'SIGINT')
                                ws.send("SIGINTED")
                            else if (signal == 'SIGKILL') 
                                ws.send ('SIM HUNG')
                            ws.send("END SIMULATION")
                            ws.close()
                        }
                    });
                }
            break;

            case "SIMULATE":
                try {
                    ws.recvInput = message;
                    if (ws.recvInput == "END SIMULATION") {
                        ws.simulator_object.kill("SIGTERM");
                    }
                    else {
                        ws.simulator_object.stdin.write(ws.recvInput); 
                    }
                }
                catch (ex) {
                    // debugLog('Tried writing a message: ' + ws.recvInput + ' to closed CVC process, ignoring...')
                }
                break;
        }
    });
    ws.on('close',
        function close() {
            try {
                if (ws.simulator_object) {
                    deleteFolderRecursive(path.resolve('/tmp/tmpcode', ws.unique_client))
                    debugLog("Stopped " + ws.unique_client)
                    ws.simulator_object.kill('SIGINT')
                }
                // try to find CVC process and kill it with a SIGTERM
                cmd = "ps -eo pcpu,pid,args | grep " + ws.unique_client
                psy = cp.execSync (cmd).toString().split ("\n")
                psy.forEach ((ps) => {
                    extract = ps.match (/([0-9]+\.[0-9]) ([0-9]+) (.+)/)
                    if (extract && extract.length != 4)
                        console.log ('Malformed ps output: ' + extract)
                    else if (extract && extract.includes ("vvp -M"))
                        process.kill (extract[2], 'SIGTERM')
                })
            }
            catch (ex) {
                debugLog(ex.toString());
            }
        }
    )
}

module.exports = connection
