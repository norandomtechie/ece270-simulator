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
    and finally simulated with the help of external tools like CVC
    and Yosys. Any errors in the code will cause the WebSocket to send
    them back and immediately close the connection.
*/

const fs = require('fs-extra');
const os = require('os');
const cp = require('child_process');
const crypto = require('crypto');
const path = require('path');
const rimraf = require('rimraf');

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
                code = message
                if (code.includes("give us a demo please")) {
                    ws.verilogCode = fs.readFileSync(__dirname + '/sim_modules/fpgademo.v', 'utf8', function (err, data) {
                        if (err) throw err;
                    });
                }
                else if (code == "") {
                    ws.send("Error: no code found.")
                    ws.close()
                    return
                }
                else if (code.match("module") && !code.match(/(module top ?[^\)]+)/)) {
                    ws.send("Compilation failed with the following error:\nLine 1: There appears to be Verilog, but the top module couldn't be found. Please make sure that you're starting your code within the template!")
                    ws.close()
                    return
                }
                else if (code.match("run/")) {
                    ws.verilogCode = fs.readFileSync(code + '.v').toString()
                }
                else {
                    ws.verilogCode = code
                }

                var hash = crypto.createHash('sha256')

                hash.update(ws.verilogCode + (new Date().getTime()).toString())
                ws.unique_client = hash.digest('hex')
                ws.simulator_object = null

                fs.mkdirSync(path.resolve('/tmp/tmpcode', ws.unique_client), (err) => {
                    if (err) { throw err; }
                })
                fs.writeFileSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'code.v'), ws.verilogCode, 'utf8', function (err) {
                    if (err) { throw err; }
                })

                // Triggering "Synthesizing..." on webpage
                ws.send("Processing Verilog code...")

                var error = [], modded_error = [], error_line = []
                
                try {
                    const VERILATOR = "verilator"
                    const VFLAGS    = "--lint-only -Wno-width"
                    const FILE      = path.resolve('/tmp/tmpcode', ws.unique_client, 'code.v')
                    var err_regex = new RegExp ("%Error(?:\-[A-Z0-9]+)?: " + FILE + ":([0-9]+):[0-9]+: (.+)", "g")
                    var err_regex_single = new RegExp ("%Error(?:\-[A-Z0-9]+)?: " + FILE + ":([0-9]+):[0-9]+: (.+)")

                    cp.execSync ([VERILATOR, VFLAGS, FILE].join (" "), { cwd: __dirname })
                }
                catch (e) {
                    if (e) {
                        var errors = []
                        e.message.match (err_regex).forEach (elm => {
                            if (errors.length - 1 >= 0 && (errors[errors.length - 1].line == elm.match (err_regex_single)[1]))
                                errors[errors.length - 1].error = errors[errors.length - 1].error + "\n" + elm.match (err_regex_single)[2]
                            else {
                                errors.push ({
                                    line: elm.match (err_regex_single)[1],
                                    error: elm.match (err_regex_single)[2]
                                })
                            }
                        })
                        error_line = errors
                    }
                    else {
                        error_line = []
                    }
                }
                
                error_line.forEach (err => {
                    modded_error.push ("Line " + err.line + ": Verilator - " + err.error)
                })

                if (modded_error.length > 0) {
                    if (!fs.existsSync("error_log/" + username)) {
                        fs.mkdirSync(path.resolve("error_log/", username), (err) => {
                            if (err) { throw err; }
                        })
                    }
                    fs.moveSync("/tmp/tmpcode/" + ws.unique_client, "error_log/" + username + "/" + getTime().replaceAll(" ", "_") + "_" + ws.unique_client)
                    ws.send("Yosys did not run." + "\nCompilation failed with the following error:\n" + modded_error.join('\n'))
                    ws.close()
                    return
                }


                try {
                    yosys_out = cp.execSync('yosys -p ' + 
                                            '"read_verilog -sv ' + __dirname + '/sim_modules/support.v;' + 
                                            ' read_verilog -sv /tmp/tmpcode/' + ws.unique_client + '/code.v; ' + 
                                            'synth_ice40 -top top; ' +
                                            'write_verilog /tmp/tmpcode/' + ws.unique_client + '/struct_code.v" ' + 
                                            '-l /tmp/tmpcode/' + ws.unique_client + '/yosyslog', {timeout: 30000, cwd: __dirname})
                    fs.unlinkSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'yosyslog'))
                    ws.initYosys = true
                }
                catch (ex) {
                    if (ex.errno == 'ETIMEDOUT') {
                        // Can't kill Yosys by PID since it changes after execSync for some weird reason
                        // So we gotta use ps and find it
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
                                process.kill (pid)
                            }
                        })
                        ws.send ("YOSYS HUNG: " + ex.output.toString())
                        ws.close()
                        return
                    }

                    yosys_out = fs.readFileSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'yosyslog'))
                    fs.unlinkSync(path.resolve('/tmp/tmpcode', ws.unique_client, 'yosyslog'))
                    ws.initYosys = false

                    function indexOfReg(arr, search) {
                        for (var elm in arr) {
                            try {
                                if (typeof arr[elm] == 'string' && arr[elm].match(search)) {
                                    d = new Object();
                                    d.message = arr[elm]
                                    d.lineno = arr.indexOf(arr[elm])
                                    return d
                                }
                            }
                            catch (ex) {
                                debugLog('indexOfReg failed')
                                debugLog(arr)
                                d = new Object();
                                d.message = "[ERROR] Internal server error. Please try again later."
                                d.lineno = 1
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
                        debugLog("Yosys error caught: ")
                        console.log(related_error)
                        skippable_error_regex = /is not part of the design|syntax error, unexpected \$end/i
                        if (related_error && !related_error.message.match(skippable_error_regex)) {
                            // Lazy catch-all for if there was an error but no other details were captured.
                            if (related_error.message.includes('server error')) {
                                error.push("**/tmp/tmpcode/randomfilereplacement007/code.v(1) [SERVER_ERROR] Your code has errors unrecognized by the server. Make sure to check for missing semicolons, wrong flip flop declarations and so on.")
                            }
                            // If students try to pull an output low when it is already connected to a high.
                            if (related_error.message.includes("Mismatch in directionality for cell port")) {
                                codeline = related_error.message.replace(/ERROR: Mismatch in directionality for cell port [^ ]+ /, '')
                                error.push("**/tmp/tmpcode/randomfilereplacement007/code.v(1) [SYNTHESIS_ERROR] You are trying to drive a signal with two different sources. More information is in: " + codeline)
                            }
                            // Wrong flip flop reset logic
                            else if (related_error.message.includes("Multiple edge sensitive events")) {
                                codeline = logarray[logarray.indexOf(related_error.message) - 1]
                                codeline = parseInt(codeline.match(/code\.v:([0-9]+)/)[1])
                                error.push("**/tmp/tmpcode/randomfilereplacement007/code.v(" + codeline + ") [SYNTHESIS_ERROR] This flip flop does not have correct reset logic.")
                            }
                            // For all 'if (reset) perform invalid logic' statements
                            else if (related_error.message.match(/yields non-constant value/i)) {
                                signal = logarray[related_error.lineno].match(/\\([\w]+) yields non-constant value/i)[1]
                                msg = "**/tmp/tmpcode/randomfilereplacement007/code.v(" + related_error.lineno + ")"
                                msg += "Two asynchronous resets not allowed in flip flop. '" + signal + "' does not appear to be a valid reset for this FF."
                                error.push(msg)
                            }
                            // Edge triggering signals for the flip flop cannot be mapped to real flip-flop models.
                            else if (related_error.message.match(/Found non-synthesizable event list!/i)) {
                                codeline = logarray[logarray.indexOf(related_error.message)]
                                codeline = parseInt(codeline.match(/code\.v:([0-9]+)/)[1])
                                error.push("**/tmp/tmpcode/randomfilereplacement007/code.v(" + codeline + ") [SYNTHESIS_ERROR] The port list for this flip flop cannot be mapped to real hardware.")
                            }
                            else {
                                try {
                                    general_error = /\/tmp\/tmpcode\/[a-z0-9]+\/code\.v\:([0-9]+)\: (.+)/
                                    lineno = related_error.message.match(general_error)[1]
                                    message = related_error.message.match(general_error)[2]
                                    error.push("**/tmp/tmpcode/randomfilereplacement007/code.v(" + lineno + ") " + message)
                                }
                                catch (ex) {
                                    error.push("**/tmp/tmpcode/randomfilereplacement007/code.v(1) No line number information: " + related_error.message)
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

                linebyline = ws.verilogCode.split('\n')
                linebyline.filter(function (v, i, a) {
                    // Test for flip flops with both asynchronous reset and set, which are not valid flip flops in hardware.
                    while (blif_unmapped_ffs.length > 0) {
                        missing_flip_flop = blif_unmapped_ffs[0]
                        clock = missing_flip_flop.match("C\=[^ ]+")
                        console.log("clock: " + clock)
                        reset = missing_flip_flop.match("R\=[^ ]+")
                        console.log("reset: " + reset)
                        always_regex = new RegExp("always ?@ ?\\((?:pos|neg)edge [^ ,]+, ?(?:pos|neg)edge [^ ,]+, ?(?:pos|neg)edge [^\\)]+\\)")
                        ws.verilogCode.split('\n').filter(function (v, i, a) {
                            if (v.match(always_regex)) {
                                // console.log (v)
                                message = "[CUSTOM_ERROR] Flip flops cannot have both an asynchronous set and reset. Use only either one."
                                error.push('**/tmp/tmpcode/randomfilereplacement007/code.v(' + (i + 1).toString() + ") " + message)
                            }
                        })

                        blif_unmapped_ffs = blif_unmapped_ffs.slice(1)
                    }
                    // if (v.match (/always ?@ ?\((?:pos|neg)edge [^ ,]+ ?, ?(?:pos|neg)edge [^ ,]+ ?, ?(?:pos|neg)edge [^ \),]+ ?\)/))
                    // {
                    //     message = "[CUSTOM_ERROR] Flip flops cannot have both an asynchronous set and reset. Use only either one."
                    //     error.push ('**/tmp/tmpcode/randomfilereplacement007/code.v(' + (i + 1).toString() + ") " + message)
                    // }

                    reg_regex = !v.match(/reg +[^=]+\={2}/i) && !v.match(/reg +\=+/i) && v.match(/reg +[^=]+=[^;]+;/gi) && !v.match(/reg ?\[2\:0\] ?startup ?\= ?0\;/gi) && !v.match(/\<\=/gi)
                    if (!code.includes("give us a demo please") && reg_regex) {
                        message = "[CUSTOM_ERROR] You should not initialize a reg outside an always block!"
                        error.push('**/tmp/tmpcode/randomfilereplacement007/code.v(' + (i + 1).toString() + ") " + message)
                    }
                })

                if (error.length != '0') {
                    modded_error = []
                    if (!fs.existsSync("error_log/" + username)) {
                        fs.mkdirSync(path.resolve("error_log/", username), (err) => {
                            if (err) { throw err; }
                        })
                    }
                    fs.moveSync("/tmp/tmpcode/" + ws.unique_client, "error_log/" + username + "/" + getTime().replaceAll(" ", "_") + "_" + ws.unique_client)
                    error.forEach(function (element) {
                        modded_err_rgx = /\*?\*?\/tmp\/tmpcode\/[a-z0-9]+\/code\.v:?\(? ?([0-9]+)\)?/
                        try {
                            num = parseInt(element.match(modded_err_rgx)[1])
                            if (element.includes(':'))
                                modded_err_msg = element.replace(modded_err_rgx, 'Line ' + num.toString())
                            else
                                modded_err_msg = element.replace(modded_err_rgx, 'Line ' + num.toString() + ": ")
                            modded_err_msg = modded_err_msg.replace(/\/tmp\/tmpcode\/[^\/]+\/code.v:[0-9]+: /, '')
                            modded_error.push(modded_err_msg)
                        }
                        catch (ex) {
                            debugLog("Cannot parse this error: " + element)
                            debugLog("CVC log was: ")
                            debugLog(ws.comStatus)
                            num = 1
                        }
                    }
                    )
                    if (modded_error.length != '0') {
                        ws.send("CVC log:\n" + ws.comStatus + "Yosys log:\n" + yosys_out + "\nCompilation failed with the following error:\n" + modded_error.join('\n'))
                        ws.close()
                    }
                }
                else {
                    // Introduced Yosys-produced gate-level synthesis approach
                    ws.currentState = "SIMULATE"
                    ws.rxdata = [];  ws.recvInput = ''; 
                    ws.rxclk = 'x';  ws.txclk = 'x';
                    ws.rxready = 'x';
                    var env = Object.create(process.env);

                    debugLog("Starting " + ws.unique_client)

                    var args = ('+interp sim_modules/tb_ice40.sv sim_modules/reset.v ' +
                        'sim_modules/cells_sim_timing.v ' +
                        'sim_modules/cells_map_timing.v ' +
                        '/tmp/tmpcode/' + ws.unique_client + '/struct_code.v -sv_lib sim_modules/svdpi.so').split(" ")

                    env.SVDPI_TO_PIPE = '1';
                    env.SVDPI_FROM_PIPE = '0';

                    ws.simulator_object = cp.spawn('cvc64', args, { env: env, cwd: __dirname });

                    ws.send("Simulation successfully started!\nCVC log:\n" + ws.comStatus + "Yosys log:\n" + yosys_out)
                    ws.cvcTimeout = false
                    ws.error_caught = false

                    ws.simulator_object.stdout.on('data', (indata) => {
                        var data = indata.toString('utf8').trim()
                        var msgdata = data.replaceAll('\0', '')
                        try {
                            var parsed = JSON.parse(msgdata)
                            ws.send(JSON.stringify (parsed))
                        }
                        catch (ex) {
                            if (data.includes("10 minutes exceeded")) {
                                ws.cvcTimeout = true
                                ws.send("TIME LIMIT EXCEEDED")
                            }
                            else if (data.match(/timing violation in tb_struct_ice40\.ice40\.([\w]+)/)) {
                                module_name = data.match(/timing violation in tb_struct_ice40\.ice40\.([\w]+)/)[1]
                                violation_type = data.match(/\$([a-z]+)\(D\:/)[1]
                                struct_code = fs.readFileSync('/tmp/tmpcode/' + ws.unique_client + '/struct_code.v').toString()
                                flip_flop_regex = new RegExp(/SB_D[FFRES]* _54_ \(\n *\.C\(([^\)]+)\) *,\n *\.D\(([^\)]+)\) *,\n *\.Q\(([^\)]+)\) *,\n *\.R\(([^\)]+)\) *\n *\);/)
                                try {
                                    params = struct_code.match(flip_flop_regex).slice(1, 5)
                                    ws.send("A flip flop (FF) in your code encountered a " + violation_type + " timing violation. " +
                                        "The FF had the following signals: " +
                                        "\nClock: " + params[0].replaceAll('\\', '') +
                                        "\nData: " + params[1].replaceAll('\\', '') +
                                        "\nOutput: " + params[2].replaceAll('\\', '') +
                                        "\nReset: " + params[3].replaceAll('\\', '') + "\n"
                                    )
                                }
                                catch (ex) {
                                    debugLog(data)
                                    ws.send("There was a timing violation, but some details could not be retrieved due to a Regex parsing error. Please contact course staff with a copy of your code.")
                                }
                                ws.close()
                            }
                            else {
                                if (data.match(/Unresolved modules or udps:[^t]+top/)) {
                                    ws.send("MISSING TOP MODULE")
                                    ws.error_caught = true
                                }
                                else if (data.match (/Copyright \(c\) 1991/)) { // ignore the CVC regular copyright output
                                    ws.send ("SIMULATION CLOSED")
                                }
                                else {
                                    if (ws.readyState != 1) {
                                        ws.simulator_object.kill('SIGINT')
                                        debugLog ('Killed CVC on stdout')
                                        debugLog (ws.readyState)
                                    }
                                    if (!data.includes ('{"LFTRED"') && !data.includes ('Time limit of 5 minutes')) {
                                        debugLog('CVC gave unexpected output for ' + ws.unique_client + ' (' + username +  '): ')
                                        debugLog(data)
                                        ws.error_caught = true
                                    }
                                }
                            }
                        }
                    });

                    ws.simulator_object.on('exit', (code, signal) => {
                        if (!ws.cvcTimeout && !ws.error_caught && ws.readyState == 1) {
                            debugLog("FATAL: CVC has quit.")
                            debugLog('Code ' + code)
                            debugLog('Signal ' + signal)
                            if (signal == 'SIGINT') {
                                ws.send("SIGINTED")
                            }
                            else if (signal == 'SIGKILL') {
                                ws.send ('CVC HUNG')
                            }
                        }
                        ws.send("END SIMULATION")
                        ws.close()
                    });
                }

                break;

            case "SIMULATE":
                try {
                    ws.recvInput = message
                    ws.simulator_object.stdin.write(ws.recvInput)
                }
                catch (ex) {
                    debugLog('Tried writing a message: ' + ws.recvInput + ' to closed CVC process, ignoring...')
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
                cmd = "ps -eo pcpu,pid,args | grep " + ws.unique_client
                psy = cp.execSync (cmd).toString().split ("\n")
                psy.forEach ((ps) => {
                    extract = ps.match (/([0-9]+\.[0-9]) ([0-9]+) (.+)/)
                    if (extract && extract.length != 4)
                        console.log (extract)
                    else if (extract && extract.includes ("cvc +interp"))
                        process.kill (extract[2], 'SIGINT')
                })
            }
            catch (ex) {
                console.log (getTime())
                console.error (ex)
            }
        }
    )
}

module.exports = connection
