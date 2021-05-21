// first, check if tab_data still exists in storage.
var browser = $('#file_browser')

function openWorkspaceManager (opt) {
    blurMainView(0)
    $('#overlay_workspace').css ('display', 'flex')
	$('#overlay_workspace').css ('opacity', '1')
	if (opt == 'create') {
		browserToggleNewDirfile(0)
	}
}

function closeWorkspaceManager () {
    blurMainView(1)
    $('#overlay_workspace').animate ({'opacity': '0'}, () => {
        $('#overlay_workspace').css ('display', 'none')
    })
}

function folderToggleListener(evt) {
    if (evt.currentTarget.querySelector ('input').checked) {
        evt.currentTarget.querySelector ('div > svg').classList.remove ('fa-folder')
        evt.currentTarget.querySelector ('div > svg').classList.add ('fa-folder-open')
        closeWorkspace (evt.currentTarget.querySelector ('p').innerHTML)
    }
    else {
        evt.currentTarget.querySelector ('div > svg').classList.remove ('fa-folder-open')
        evt.currentTarget.querySelector ('div > svg').classList.add ('fa-folder')
        openWorkspace (evt.currentTarget.querySelector ('p').innerHTML)
    }
}

function browserAddFolder (name) {
	if (!(name in JSON.parse (localStorage.filesystem))) {
		var filesystem = JSON.parse (localStorage.filesystem)
		filesystem [name] = "[]"
		localStorage.filesystem = JSON.stringify (filesystem)
	}

	if ($('.editor-tab-workspace[name="' + name + '"]').length == 0) {
		addWorkspace (name)
	}

    var folder = document.createElement ('div')
	folder.classList.add ('browser_row')
	folder.id = 'browser_' + name
    folder.innerHTML = 
        '<input type="checkbox" style="display: none">' +
        '<div style="width: 100%; height: 3vh; display: flex; flex-direction: row">' +
        '<i class="fa fa-folder" id="' + name + '_stat" style="margin-right: 10px; color: var(--display-4-color)"></i>' +
        '<p class="display-4 text-muted unselectable" style="font-size: 16px">' + name + '</p>' +
        '</div>'
    folder.addEventListener ('click', evt => { 
        if (!evt.target.classList.contains ('browser_row_file'))  {
            evt.currentTarget.classList.toggle ('browser_row_selected') 
        }
    })
    folder.addEventListener ('dblclick', evt => { evt.stopPropagation(); browserOpenWorkspace (evt.currentTarget.querySelector ('div > p').innerHTML, false) })
    browser.append (folder)
    return folder
}

function browserEventAddFile() {
    var name = $('#createfilename').val()
	var folder = $('#selworkspace').val()
	
	if (!name.endsWith ('.sv') && !name.endsWith ('.mem') && !name.endsWith ('.json')) {
		alert ("Error: every file name must end with .sv, .mem or .json to ensure differences between code or memory init value files.  Please specify one of these extensions in the name.")
		return
	}
	else if (getWorkspace (getFilesystem(), folder).filter (e => e.name == name).length > 0) {
		alert ("Error: file appears to exist.  Please enter another name.")
		return
	}
	[ctime, mtime] = getCurrentTimestamps()
	var tmp = getWorkspace (getFilesystem(), folder)
	tmp.push ({
		'name': name,
		'code': localStorage.original_code,
		'mtime': mtime,
		'ctime': ctime,
		'state': 'open'
	})
	saveWorkspace (folder, tmp)
	browserAddFile ($('#browser_' + folder)[0], name, ctime, mtime)
	browserOpenFile (folder, name, true)
	browserToggleNewDirfile(1)
}

function fileExists (folder, file) {
	var filesystem = JSON.parse (localStorage.filesystem)
	if (typeof (filesystem [folder]) == "object") return false
	return (JSON.parse (filesystem [folder]).filter (e => e.name == file).length > 0)
}

function folderExists (folder) {
	return (folder in JSON.parse (localStorage.filesystem))
}

function getCurrentTimestamps() {
	var fctime = new Date ()
	var fmtime = new Date ()
	
	var ctime = fctime.getFullYear() + '-' + (fctime.getMonth() + 1) 
	ctime += '-' + fctime.getDate()
	ctime += ' ' + fctime.getHours()
	ctime += ':' + (parseInt (fctime.getMinutes()) < 10 ? ("0" + fctime.getMinutes()) : fctime.getMinutes())
	ctime += ':' + (parseInt (fctime.getSeconds()) < 10 ? ("0" + fctime.getSeconds()) : fctime.getSeconds())

	var mtime = fmtime.getFullYear() + '-' + (fmtime.getMonth() + 1)
	mtime += '-' + fmtime.getDate()
	mtime += ' ' + fmtime.getHours()
	mtime += ':' + (parseInt (fmtime.getMinutes()) < 10 ? ("0" + fmtime.getMinutes()) : fmtime.getMinutes())
	mtime += ':' + (parseInt (fmtime.getSeconds()) < 10 ? ("0" + fmtime.getSeconds()) : fmtime.getSeconds())
	return [ctime, mtime]
}

function browserAddFile (folder, name, ctime, mtime) {
    var file = document.createElement ('div');
    file.classList.add ('browser_row_file');
    file.innerHTML = '<i class="fa fa-file" style="margin-left: 10px; color: var(--display-4-color)"></i>';
    [name, ctime, mtime].forEach (attr => {
        var column = document.createElement ('div')
        column.classList.add ('browser_row_col', 'unselectable')
        column.innerHTML = attr
        file.append (column)
	})
    file.children [file.childElementCount - 1].style.borderRight = '0'
    file.addEventListener ('click', evt => { 
		evt.stopPropagation();
		window.finishedLoading = true
        if (!evt.target.classList.contains ('browser_row'))  {
            evt.currentTarget.classList.toggle ('browser_row_selected') 
        }
    })
    file.addEventListener ('dblclick', evt => { 
		evt.stopPropagation();
        browserOpenFile (evt.currentTarget.parentNode.querySelector ('div > p').innerHTML, 
                         evt.currentTarget.querySelector ('.browser_row_col').innerHTML, true) 
    })
    folder.append (file);
    return file
}

function browserOpenSelectedFiledirs() {
	Array.from ($('.browser_row_file.browser_row_selected')).forEach (fdiv => {
		selectWorkspaceByElement ($('.editor-tab-workspace[name="' + fdiv.parentNode.querySelector ('p').innerHTML + '"]')[0], false)
		browserOpenFile (fdiv.parentNode.querySelector ('p').innerHTML, fdiv.querySelector ('div').innerHTML, true)
	})
	Array.from ($('.browser_row.browser_row_selected')).map (e => e.querySelector ('p').innerHTML).forEach (wksp => {
		browserOpenWorkspace (wksp, true)
	})
}

function browserOpenWorkspace (folder, force) {
	$('.editor-tab-workspace').css ('background', '')
	$('.editor-tab-workspace[name="' + folder + '"]:not(#editor-tab-workspace-add)').css ('background', 'var(--etw-bg-selected)')
	return new Promise ((resolve, reject) => {
		var workspace = getWorkspace (getFilesystem(), folder)
		setCurrentWorkspace (folder)
		Promise.all (browserOpenFile (folder, workspace.map (e => e.name), force)).then (arr => {
			Array.from ($('.editor-tab[workspace!="' + folder + '"]')).forEach (e => {
				if (e.id == 'editor-tab-add') return
				var deleted = $(e);
				var workspace = deleted.attr ('workspace')
				var load = getWorkspace (getFilesystem(), workspace)
				if (deleted.attr('workspace') in editor_tab_list) {
					delete editor_tab_list[deleted.attr('workspace')][deleted.attr('name')]
				}
				load.forEach ((f, i) => {
					if (deleted.attr ('name') == f.name) {
						f.state = 'closed'
					}
				})
				saveWorkspace (workspace, load)
				deleted.remove()
			})
			resolve (true)
		}).catch (err => {
			reject (err)
		})
	})
}

function browserToggleNewDirfile(opt) {
    switch (opt) {
        case 0: // to open
            $('#overlay_new_dirfile').css ('display', 'flex')
            setTimeout (() => { $('#overlay_new_dirfile').css ('opacity', '1') }, 100)
            break;
        case 1: // to close
            $('#overlay_new_dirfile').css ('opacity', '0')
            setTimeout (() => { $('#overlay_new_dirfile').css ('display', 'none') }, 350)
            break;   
    }
}

function getFilesystem() {
	return JSON.parse (localStorage.filesystem)
}
function saveFilesystem(fs) {
	localStorage.filesystem = JSON.stringify (fs)
}

// expects a filesystem object and a folder string name
function getWorkspace(filesystem, folder) {
	return JSON.parse (filesystem [folder])
}
// expects a string (name) and an array (ws)
function saveWorkspace(name, ws) {
	var fs = getFilesystem()
	fs [name] = JSON.stringify (ws)
	saveFilesystem (fs)
}

function browserDeleteSelectedFiledirs() {
	var del_wksps = Array.from ($('.browser_row.browser_row_selected')).map (e => $(e)[0].querySelector ('p').innerHTML)
	var wksps = Array.from ($('.browser_row_file.browser_row_selected')).map (e => $(e).parent()[0].querySelector ('p').innerHTML)
	var names = Array.from ($('.browser_row_file.browser_row_selected')).map (e => e.querySelector ('.browser_row_col').innerHTML)
	var num_of_default_elms = $('#browser_default > .browser_row_file').length == $('#browser_default > .browser_row_selected').length
	var all_default_files_sel = Array.from ($('#browser_default > .browser_row_file'))
										.map (e => names.includes (e.querySelector ('.browser_row_col').innerHTML))
										.reduce ((p, n) => { return p && n }, num_of_default_elms)

	if (del_wksps.includes ('default') || all_default_files_sel) {
		alert ("It seems as though you are attempting to delete all the files in the 'default' workspace, which is not permitted.  At least one file must be present at all times in this workspace.  Please deselect at least one file and try again.")
		return
	}

	var check = window.confirm ("You are about to IRREVERSIBLY delete the files you selected!  They will not be recoverable if you continue.  Are you sure?")
	if (!check) return
	
	wksps.forEach ((e, i) => {
		browserDeleteFile (e, names[i])
		delete editor_tab_list[e][names[i]]
		var wksp_row = $(Array.from ($('.browser_row p')).filter (r => r.innerHTML == e)[0]).parent().parent()
		Array.from (wksp_row.find ('.browser_row_file')).filter (f => f.querySelector ('.browser_row_col').innerHTML == names[i])[0].remove()
	})
	del_wksps.forEach ((e) => {
		if (e == 'default') {
			alert ("You cannot delete the default workspace so that we can ensure at least one tab is open.")
			return
		}

		var names = Array.from ($('#browser_' + e + ' > .browser_row_file')).map (e => e.querySelector ('.browser_row_col').innerHTML)
		names.forEach (n => {
			browserDeleteFile (e, n)
			delete editor_tab_list[e][n]
			var wksp_row = $(Array.from ($('.browser_row p')).filter (r => r.innerHTML == e)[0]).parent().parent()
			Array.from (wksp_row.find ('.browser_row_file')).filter (f => f.querySelector ('.browser_row_col').innerHTML == n)[0].remove()
		})
		$(Array.from ($('.browser_row p')).filter (r => r.innerHTML == e)[0]).parent().parent().remove()
		Array.from ($('#selworkspace').find ('option')).filter (op => op.innerHTML == e).length > 0 ? Array.from ($('#selworkspace').find ('option')).filter (op => op.innerHTML == e)[0].remove() : 0
		// remove workspace from storage
		var fs = getFilesystem()
		delete fs[e]

		$('.editor-tab-workspace[name="' + e + '"]').remove()
		delete editor_tab_list[e]
		saveFilesystem (fs)

		if (localStorage.currentWorkspace == e) {
			selectWorkspaceByElement ($('.editor-tab-workspace[id!="editor-tab-workspace-add"]').last()[0])
		}
	})
	browserLoadFilesystem()
}

function browserDeleteFile (folder, file) {
    var filesystem = JSON.parse (localStorage.filesystem)
    var workspace = JSON.parse (filesystem [folder])
	workspace = workspace.filter (e => e.name != file)
	if (workspace.length == 0) {
		delete filesystem [folder]
	}
	else {
		filesystem [folder] = JSON.stringify (workspace)
	}
	saveFilesystem (filesystem)

	tabExists (file, folder).then (tab => {
		var deleted = $(tab);
		deleted.remove()
		if ($('.editor-tab').length == 1) {
			console.log ("Tabs were all closed, opening first file in second-last workspace...")
			selectWorkspaceByElement ($('.editor-tab-workspace[id!="editor-tab-workspace-add"]').last()[0])
		}
		else {
			new_last = $('.editor-tab').get().slice($('.editor-tab').length - 2, $('.editor-tab').length - 1)[0]
			selectTabByElement(new_last)
		}
	})
	return false
}

function browserOpenFile (folder, file, force) {
    var filesystem = JSON.parse (localStorage.filesystem)
    var workspace = JSON.parse (filesystem [folder])
    function perFile (folder, file, force) {
		return new Promise ((resolve, reject) => {
			tabExists (file, folder).then (res => {
				if (!force && workspace.filter (f => f.name == file)[0].state == 'closed') return
				// does tab exist? return
				if (typeof res == "object") {
					return
				}
				ctime = workspace.filter (f => f.name == file)[0].ctime
				code = workspace.filter (f => f.name == file)[0].code
				addTab({
					'name': file,
					'ctime': ctime,
					'mtime': new Date(),
					'state': 'open',
					'workspace': folder
				})
				var sess = new EditSession(code)
				editor_tab_list [folder][file] = sess
				selectTabByElement($('[name="' + file + '"][workspace="' + folder + '"]')[0])
				editor.setValue(code, -1)
				resolve (true)
			}).catch (err => {
				reject (err)
			})
		})
    }
	editor.session.setMode("ace/mode/verilog")
    if (typeof file == "object") {
        return file.map (f => perFile (folder, f, force) )
    }
    else if (typeof file == "string") {
        return perFile (folder, file, force)
    }
	return false
}

function browserLoadFilesystem () {
    // clear current listing
	$('#file_browser').children().remove()
	$('#selworkspace').children().remove()
    // generate workspace listing
	var filesystem = JSON.parse (localStorage.filesystem)

    Object.keys (filesystem).forEach (workspace => {
		$('#selworkspace').append ($('<option>').val (workspace).text (workspace))
		var folder = browserAddFolder (workspace);
		editor_tab_list[workspace] = {}

		if (Object.keys (filesystem[workspace]).length == 0) return
        JSON.parse (filesystem[workspace]).forEach (file => {
			var sess = new EditSession(file.code)
			editor_tab_list [workspace][file.name] = sess

            var fctime = new Date (file.ctime)
            var fmtime = new Date (file.mtime)
            
            var ctime = fctime.getFullYear() + '-' + (fctime.getMonth() + 1) 
            ctime += '-' + fctime.getDate()
            ctime += ' ' + fctime.getHours()
            ctime += ':' + (parseInt (fctime.getMinutes()) < 10 ? ("0" + fctime.getMinutes()) : fctime.getMinutes())
            ctime += ':' + (parseInt (fctime.getSeconds()) < 10 ? ("0" + fctime.getSeconds()) : fctime.getSeconds())
    
            var mtime = fmtime.getFullYear() + '-' + (fmtime.getMonth() + 1)
            mtime += '-' + fmtime.getDate()
            mtime += ' ' + fmtime.getHours()
            mtime += ':' + (parseInt (fmtime.getMinutes()) < 10 ? ("0" + fmtime.getMinutes()) : fmtime.getMinutes())
			mtime += ':' + (parseInt (fmtime.getSeconds()) < 10 ? ("0" + fmtime.getSeconds()) : fmtime.getSeconds())

			browserAddFile (folder, file.name, ctime, mtime)
        })
	})

	function newWkspHandler (e) {
		var new_wksp = (window.prompt ("Enter new workspace name: ") || '').replace (/[^\w]+/g, '')
		if ((new_wksp in getFilesystem()) || (new_wksp == '')) {
			alert ("Error: please enter a valid/non-existent name.")
			return
		}
		var folder = browserAddFolder (new_wksp)
		var wksp = $(folder).find ('p')[0].innerHTML
		$('#selworkspace').find ('option:last').before ($('<option>').val (wksp).text (wksp))
		$('#selworkspace').val (wksp)

		var sess = new EditSession(localStorage.original_code);
		var [ctime, mtime] = getCurrentTimestamps()
		editor_tab_list [wksp] = {};
		editor_tab_list [wksp]["template.sv"] = sess;
		browserAddFile (folder, "template.sv", ctime, mtime);

		browserOpenWorkspace (wksp, false);
		selectWorkspaceByElement ($('[name="' + wksp + '"]')[0]);
		var elm = addTab({
			name: 'template.sv',
			ctime: ctime,
			mtime: mtime,
			workspace: wksp,
			state: 'open',
		})
		selectTabByElement (elm[0])
	}
	$('#selworkspace').append (
		$('<option>').val ("createnew").text ("Create new...").on ('mousedown', newWkspHandler)
	)
	$('#selworkspace').change (e => {
		e.stopPropagation()
		console.log ($('#selworkspace').val())
		if ($('#selworkspace').val() == 'createnew') {
			newWkspHandler()
		}
	})
}

function closeTabHandler (e) {
	e.stopPropagation()
	if ($('.editor-tab').length > 2) {
		if (e.currentTarget.classList.contains ('tab-close')) {
			var deleted = $(e.currentTarget).parent();
		}
		else {
			var deleted = $(e.target);
		}
		var filesystem = JSON.parse (localStorage.filesystem)
		console.log (deleted)
		var workspace = deleted.attr ('workspace')
		if (deleted.attr('workspace') in editor_tab_list) {
			delete editor_tab_list[deleted.attr('workspace')][deleted.attr('name')]
		}
		var load = JSON.parse (filesystem [workspace])
		load.forEach (x => {
			if (deleted.attr ('name') == x.name) {
				x.state = 'closed'
			}
		})
		saveWorkspace (workspace, load)
		deleted.remove()
		// selectTabByElement($('.editor-tab').get().slice($('.editor-tab').length - 2, $('.editor-tab').length - 1)[0])
	}
	else
		alert("There must always be one tab open. Add a new tab first, then close this one.")
}

function setCurrentWorkspace(ws) {
	localStorage.currentWorkspace = ws
}

function addTabHandler (e) {
	e.stopPropagation()
	// adding new session
	var pmt = 'report_error';
	console.log (e.target)
	console.log ((e.target.id == 'editor-tab-workspace-add') || (e.target.id == 'wksp-tab-add'))
	if ((e.target.id == 'editor-tab-workspace-add') || (e.target.id == 'wksp-tab-add')) {
		pmt = window.prompt ("Enter new workspace name: ").replace (/ /g, '')
		if (pmt == '' || !pmt || (pmt in getFilesystem())) {
			alert ("Invalid/existing name.  Please enter a single name with no spaces.")
			return
		}
		var fldr = browserAddFolder (pmt);
		var elm = $('[name="' + pmt + '"]')[0];
		[ctime, mtime] = getCurrentTimestamps();
		browserAddFile (fldr, "template.sv", ctime, mtime);
		setCurrentWorkspace (pmt);
		selectWorkspaceByElement (elm);
		$('#selworkspace').find ('option:last').before ($('<option>').val (pmt).text (pmt))
		$('#selworkspace').val (pmt)
	}
	var sess = new EditSession(window.localStorage.original_code)
	try {
		var newname = "newfile" + getWorkspace(getFilesystem(), localStorage.currentWorkspace).length.toString() + ".sv"
	}
	catch (err) {
		var newname = "newfile0.sv"
	}
	var ctime, mtime;
	[ctime, mtime] = getCurrentTimestamps()

	if ((e.target.id == 'editor-tab-workspace-add' || e.target.id == 'wksp-tab-add')) {	// if new workspace was being added, use new name
		editor_tab_list [pmt] = {}
		editor_tab_list [pmt]["template.sv"] = sess
	}
	else {
		editor_tab_list [localStorage.currentWorkspace][newname] = sess
		browserAddFile ($('#browser_' + localStorage.currentWorkspace)[0], newname, ctime, mtime)
	}

	addTab({
		name: (e.target.id == 'editor-tab-workspace-add' || e.target.id == 'wksp-tab-add') ? 'template.sv' : newname,
		ctime: ctime,
		mtime: mtime,
		workspace: (e.target.id == 'editor-tab-workspace-add' || e.target.id == 'wksp-tab-add') ? pmt : (window.localStorage.currentWorkspace || 'default'),
		state: 'open',
	})
	selectTabByElement($('.editor-tab').get().slice($('.editor-tab').length - 2)[0])
	saveAllFilesToStorage()
	load_template()
}

function switchTabHandler (e) {
	e.stopPropagation()
	if (e.target.id == 'tab-add' || e.target.id == 'wksp-tab-add' || e.target.id == 'editor-tab-add' || e.target.id == 'editor-tab-workspace-add') {
		return
	}
	else if ((e.ctrlKey || e.shiftKey) && (e.target.classList.contains ('tab-label') || e.target.classList.contains ('tab-label-workspace'))) {
		if ($(e.target).parent()[0].getAttribute ('name') == 'default') {
			alert ("Error: not allowed to rename the default workspace.")
			return
		}
		e.target.previous_text = e.target.innerHTML
		e.target.classList.remove ('unselectable')
		e.target.setAttribute ('contenteditable', 'true')
		e.target.focus()
	}
	else if (e.target.classList.contains ('tab-label')) {
		selectTabByElement ($(e.target).parent()[0])
	}
	else if (e.target.classList.contains ('tab-label-workspace')) {
		selectWorkspaceByElement ($(e.target).parent()[0])
	}
	else if (e.target.classList.contains ('editor-tab')) {
		selectTabByElement ($(e.target)[0])
	}
	else if (e.target.classList.contains ('editor-tab-workspace')) {
		selectWorkspaceByElement ($(e.target)[0])
	}
}

function openHDLwave() {
	var popup = window.open('https://verilog.ecn.purdue.edu/hdlwave/', '_blank');		
}

window.onload = function () {
	var last_page_x = window.localStorage.editor_width || 2000;
	$('#editor-workspace').width (window.localStorage.editor_width || '65%')
	$('#outputview').width (window.localStorage.editor_width || '65%')

	window.addEventListener("mousewheel", codescroll, { passive: false })
	// load_button.innerHTML = load_btn_text

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

	async function eventRenameWorkspace (e) {
		if (e.type == 'keydown' && e.key == 'Escape') {
			e.currentTarget.blur()
		}
		else if (e.type =='focusout' || (e.type == 'keydown' && e.key == 'Enter')) {
			e.currentTarget.setAttribute ('contenteditable', 'false')
			e.target.innerHTML = e.target.innerHTML.replace(/[^a-z0-9\_\-]/g, '')
			e.currentTarget.blur()
			var tab = $(e.currentTarget).parent()
			if (e.currentTarget.innerHTML == tab.attr ('name')) {
				return
			}
			else if (!(e.currentTarget.innerHTML in getFilesystem())) {
				// if workspace doesn't exist, move workspace in storage, rename id
				var fs = getFilesystem()
				var wksp = getWorkspace (fs, tab.attr ('name'))
				delete fs [tab.attr ('name')]
				fs [e.currentTarget.innerHTML] = JSON.stringify (wksp)
				saveFilesystem (fs)

				var tmp = editor_tab_list [tab.attr ('name')]
				delete editor_tab_list [tab.attr ('name')]
				editor_tab_list [e.currentTarget.innerHTML] = tmp

				document.querySelector ('#browser_' + tab.attr ('name') + ' > div > p').innerHTML = e.currentTarget.innerHTML
				document.querySelector ('#browser_' + tab.attr ('name')).id = 'browser_' + e.currentTarget.innerHTML
				Array.from ($('[workspace="' + tab.attr ('name') + '"]')).forEach (tb => {
					tb.setAttribute ('workspace', e.currentTarget.innerHTML)
				})
				
				tab.attr ('name', e.currentTarget.innerHTML)
				if (window.active_tab.getAttribute ('workspace') == e.currentTarget.innerHTML) {
					setCurrentWorkspace (e.currentTarget.innerHTML)
				}
				return 
			}
			else {
				alert ("This workspace already exists.  Pick a new name.")
			}
		}
	}

	async function eventRenameTab (e) {
		if (e.type == 'keydown' && (e.key == 'Escape' || e.key == 'Enter')) {
			e.preventDefault()
			e.currentTarget.blur()
		}
		else if (e.type =='focusout') {
			e.preventDefault()
			e.target.classList.add ('unselectable')
			e.target.setAttribute ('contenteditable', 'false')
			e.target.style.filter = ""
			e.target.innerHTML = e.target.innerHTML.replace(/ */g, '')
			var filesystem = JSON.parse (localStorage.filesystem)
			var workspace = $(e.target).parent().attr ('workspace')
			var ws_json = JSON.parse (filesystem [workspace])
            
			// what if they decide to make no changes and hit Enter anyway? We don't want any new changes then
			if (e.target.innerHTML == $(e.target).parent().attr ('name'))
				return
			else if (ws_json.filter (el => el.name == $(e.target).parent().attr ('name')).length > 0) {
				console.log (e.target.innerHTML)
				console.log ($(e.target).parent().attr ('name'))
				var result = await tabExists (e.target.innerHTML, workspace)
				result = result || await tabExists (e.target.innerHTML + '.sv', workspace)
				result = result || await tabExists (e.target.innerHTML + '.json', workspace)
				result = result || await tabExists (e.target.innerHTML + '.mem', workspace)
				var fs = getFilesystem()
				var workspaceCheck = getWorkspace (fs, workspace).filter (x => x.name == e.target.innerHTML).length > 0
				workspaceCheck = workspaceCheck || getWorkspace (fs, workspace).filter (x => x.name == e.target.innerHTML + '.sv').length > 0
				workspaceCheck = workspaceCheck || getWorkspace (fs, workspace).filter (x => x.name == e.target.innerHTML + '.json').length > 0
				workspaceCheck = workspaceCheck || getWorkspace (fs, workspace).filter (x => x.name == e.target.innerHTML + '.mem').length > 0
				if (workspaceCheck) {
					alert ("You have entered a tab name that already exists, but is hidden from view.  Open it from the Workspace Manager and delete if required.")
					getBackName = e.target.innerHTML.slice (0, e.target.innerHTML.includes ('.') ? e.target.innerHTML.lastIndexOf ('.') : e.target.innerHTML.length)   // remove extensions
					// and add number, then sv
					getBackName += (ws_json.length - 1).toString() + ".sv"
					e.target.innerHTML = getBackName
				}
				else if (result) {
					alert ("Tab names must be unique.")
					getBackName = e.target.innerHTML.slice (0, e.target.innerHTML.includes ('.') ? e.target.innerHTML.lastIndexOf ('.') : e.target.innerHTML.length)   // remove extensions
					// and add number, then sv
					getBackName += (ws_json.length - 1).toString() + ".sv"
					e.target.innerHTML = getBackName
				}
				all = JSON.parse (filesystem [workspace])
                item = all.filter (el => el.name == $(e.target).parent().attr ('name'))[0]
				all = all.map (el => {
                    if (el.name == $(e.target).parent().attr ('name')) {
                        e.target.innerHTML = e.target.innerHTML.replace(/[^a-z0-9\_\-\.]/g, '')
                        if (!(e.target.innerHTML.endsWith('.sv')) && !(e.target.innerHTML.endsWith('.mem')) && !(e.target.innerHTML.endsWith('.json'))) {
							// assume default
							e.target.innerHTML += '.sv'
							editor.session.setMode("ace/mode/verilog")
						}
						if (window.active_tab == $(e.target).parent()[0] && e.target.innerHTML.endsWith('.mem')) {
							editor.session.setMode("ace/mode/text")
						}
						else if (window.active_tab == $(e.target).parent()[0] && e.target.innerHTML.endsWith('.sv')) {
							editor.session.setMode("ace/mode/verilog")
						}
						else if (window.active_tab == $(e.target).parent()[0] && e.target.innerHTML.endsWith('.json')) {
							editor.session.setMode("ace/mode/json")
						}
						editor_tab_list [workspace][e.target.innerHTML] = editor_tab_list [workspace][el.name]
						delete editor_tab_list [workspace][el.name]
						el.name = e.target.innerHTML
                    }
                    return el
                })
                filesystem [workspace] = JSON.stringify (all)
                localStorage.filesystem = JSON.stringify (filesystem)
				
				// let finisher code remain inside so it finishes after tab check
				$(e.target).parent().attr('name', e.target.innerHTML)
				browserLoadFilesystem()
			}
		}
	}

	$('body'
	).on('blur', '.tab-label', eventRenameTab
	).on('keydown', '.tab-label', eventRenameTab
	).on('blur', '.tab-label-workspace', eventRenameWorkspace
	).on('keydown', '.tab-label-workspace', eventRenameWorkspace
	).on('keydown', '.ace_text-input', e => {
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
			if (!($(window.active_tab).attr('name').endsWith(".sv")) && !($(window.active_tab).attr('name').endsWith(".mem")) && !($(window.active_tab).attr('name').endsWith(".json")))
				alert ("To organize your code better, enter a filename ending with one of .sv, .mem or .json in the tab.  " + 
					   "Remember that you will not be able to open this in another computer, " + 
                       "however, so make sure to actually save your code somewhere else.  Simulation will " +
                       "not start until you set a valid name.")
			else {
				if (localStorage.simulateOnSave == "true") {
					ice40hx8k_handler()
                }
            }
		}
		else if (e.ctrlKey && e.which == 192 && e.type == "keydown") {
			// ctrl + ` support to scroll tabs
			e.preventDefault()
			len = $('#editor-tab-header').children().length
			old_idx = $('#editor-tab-header').children().index (window.active_tab)
			new_idx = old_idx == len - 2 ? 0 : old_idx + 1
			selectTabByElement ($('#editor-tab-header').children()[new_idx])
		}
		else if (e.ctrlKey && e.shiftKey && e.which == 84 && e.type == "keydown") {
			// ctrl + shift + t support to add a tab
			e.preventDefault()
			addTabHandler (e)
		}
		else if (e.ctrlKey && e.altKey && e.which == 87 && e.type == "keydown") {
			// ctrl + alt + w support to close a tab
			e.preventDefault()
			e.target = window.active_tab
			closeTabHandler (e)
		}
		else if (editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')]) {
			editor_tab_list[$(window.active_tab).attr('workspace')][$(window.active_tab).attr('name')].setValue(editor.session.getValue())
		}
	}).on('click', '.tab-label', switchTabHandler
	 ).on('click', '.tab-label-workspace', switchTabHandler
	 ).on('blur', '.tab-label', e => {
		if (e.target.innerHTML.replace(/ +/, "") == "") {
			alert("Please specify a name for this code file.")
			e.target.innerHTML = "new" + ($('#editor-tab-header').children().length - 1).toString() + ".sv"
		}
		$(e.target).css('background-color', 'var(--editor-tab-bg)')
	}).on('click', '.editor-tab', switchTabHandler
	).on('click', '.editor-tab-workspace', switchTabHandler
	).on('click', '.tab-close', closeTabHandler
	).on ('click', '#wksp-tab-add', addTabHandler
	).on ('click', '#editor-tab-workspace-add', addTabHandler
	).on ('click', '#editor-tab-add', addTabHandler
	).on ('click', '#tab-add', addTabHandler
	).on ('mousedown', '#resize-editor', e => {
		e.preventDefault();
		if (term) {
			term.resize (parseInt ($("#editor-workspace").width() / 10.5), parseInt ($("#editor-workspace").height() / 22.5))
        }
		$(e.target).addClass ('dragging')
		last_page_x = e.pageX
		return false;
	}).on ('click', '.module_check', e => {
		var icon  = e.currentTarget;
		var mod   = icon.parentNode.querySelector('label').innerHTML;
		var wksp  = $('#wksp_settings_title').text().match(/for '([^']+)'/)[1];
		if (!('workspace_settings' in localStorage)) {
			localStorage['workspace_settings'] = `{"${wksp}": {"support": [], "testbench": ""}}`;
		}
		var saved = getWkspSettings(wksp) || {"support": [], "testbench": ""};
		var support = saved["support"];
		if (icon.style.color == '') {
			icon.style.color = 'var(--display-4-color)';
			support.push(mod);
		}
		else {
			icon.style.color = '';
			support = support.filter(e => e != mod);
		}
		saved["support"] = support;
		setWkspSettings(wksp, saved);
	}).on ('change', '#select_testbench', e => {
		var wksp = $('#wksp_settings_title').text().match(/for '([^']+)'/)[1];
		if (!('workspace_settings' in localStorage)) {
			localStorage['workspace_settings'] = `{"${wksp}": {"support": [], "testbench": ""}}`;
		}
		if (!(wksp in JSON.parse(localStorage['workspace_settings']))) {
			setWkspSettings(wksp, {"support": [], "testbench": ""});
		}
		var wksp_settings = getWkspSettings(wksp);
		wksp_settings["testbench"] = e.currentTarget.value;
		setWkspSettings(wksp, wksp_settings);
	});
	

	if (!localStorage.switchsim) {
		localStorage.switchsim = 'workspace'
	}
	else if (localStorage.switchsim == 'file') {
		$('#switchsim')[0].innerHTML = 'File Simulation'
	}
	else {	// failsafe
		localStorage.switchsim = 'workspace'
		$('#switchsim')[0].innerHTML = 'Workspace Simulation'
	}

	$(document).mousemove (e => {
		if ($('#resize-editor')[0].classList.contains ("dragging")) {
			$("#editor-workspace").css("flex", "none")
			if (e.pageX < last_page_x) {
				// left
				$("#editor-workspace").width($("#editor-workspace").width() - (last_page_x - e.pageX))
				$("#outputview").width($("#editor-workspace").width() - (last_page_x - e.pageX))
			}
			else {
				// right - make sure not to drag it larger than the width of the window!
				if ($("#status-navbar").width() - $("#editor-workspace").width() - (e.pageX - last_page_x) >= 700
						|| ($("#status-navbar").width() < 1675 &&  $("#editor-workspace").width() + (e.pageX - last_page_x) < 1600)) {
					$("#editor-workspace").width($("#editor-workspace").width() + (e.pageX - last_page_x))
					$("#outputview").width($("#editor-workspace").width() + (e.pageX - last_page_x))
				}
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

	function initFilesystem() {
		var sess = new EditSession(window.localStorage.original_code)
		new_file = {
			'name': "template.sv",
			'code': window.localStorage.original_code,
			'ctime': new Date(),
			'mtime': new Date(),
			'workspace': 'default',
			'state': 'open'
		}
		editor_tab_list ['default'] = {}
		editor_tab_list ['default']["template.sv"] = sess
		window.localStorage.filesystem = JSON.stringify ({ 'default': [JSON.stringify (new_file)] })
		addTab(new_file)
		var elm = addWorkspace('default')
		var new_tab = $('.editor-tab').get().slice($('.editor-tab').length - 2)[0]
		selectTabByElement(new_tab)
		selectWorkspaceByElement(elm[0])
		editor.session.setValue (window.localStorage.original_code)
		browserLoadFilesystem()
	}

	Promise.resolve(promised_code).then(() => {
		// if it does, move it to localStorage.filesystem.default
		if (!localStorage.tab_data && !localStorage.filesystem) {
			initFilesystem()
		}
		else {
			if (localStorage.tab_data) {
				localStorage.filesystem = JSON.stringify ({'default': [localStorage.tab_data]})
				localStorage.removeItem ('tab_data')
			}
		}
		if (Object.keys (editor_tab_list).length == 0) {
			browserLoadFilesystem()
			openTabsFromStorage()
		}
	})
    .catch(err => {
        console.error(err)
	})

    if (!window.localStorage.currentWorkspace) {
        localStorage.currentWorkspace = 'default'
    }

	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) 
		alert ("This site is not currently optimized for mobile devices. You can tap around, but full functionality may not be available, specifically interaction with the FPGA.")
	if (!window.localStorage.tab_data && !window.localStorage.filesystem) {
		alert ("If you have never visited this page before, welcome! Glad to have you try this page out for the first time!\nIf you've used the simulator before, however, you might be browsing incognito. Take care to save your code to your computer, because the webpage will not be able to save it when your incognito session closes.")
	}
	if (window.localStorage.uartmode) {
		alert ("The simulator's UART option has now been permanently turned on since there is really no need to switch between two modes of simulation.  The UART panel will only include the Auto-Switch option, and the template code (updated to SystemVerilog!) will now always include the UART ports.")
		document.documentElement.setAttribute("uart-option", "true")
		$('#uart_view').css ('display', 'flex')
		template_code = "270sim_source_uart.sv"
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

	/**************************************************************************** */

	function receiveMessage(event)
	{
		// Do we trust the sender of this message?
		if ((event.origin !== "https://verilog.ecn.purdue.edu" && event.origin !== "https://engineering.purdue.edu") && event.isTrusted)
			return;
		
		if (event.origin == "https://verilog.ecn.purdue.edu") {
			event.source.postMessage (editor.getValue() + "\n")
		}
		// else {
		// 	try {
		// 		var student = JSON.parse (event.data)
		// 		if (!('code' in student) || !('assignment' in student))
		// 			throw "Invalid format."
				
		// 		var filesystem = JSON.parse (localStorage.filesystem)
		// 		var result = JSON.parse (filesystem ['default']).filter (e => e.name == "grader.sv").length > 0
		// 		if (Object.keys (editor_tab_list).length == 0)
		// 			openTabsFromStorage()
		// 		if (!result) {
		// 			var sess = new EditSession(student.code)
		// 			var tab = 0
		// 			editor_tab_list ["default"]["grader.sv"] = sess
		// 			addTab({
		// 				name: "grader.sv",
		// 				session: tab.toString(),
		// 				ctime: new Date(),
		// 				mtime: new Date(),
		// 				workspace: 'default',
		// 				state: 'open',
		// 			})
		// 			new_tab = $('.editor-tab').get().slice($('.editor-tab').length - 2)[0]
		// 			selectTabByElement(new_tab)
		// 		}
		// 		else {
		// 			selectTabByElement($('[name="grader.sv"]')[0])
		// 		}
				
		// 		editor.session.setValue (student.code, -1)
		// 		saveAllFilesToStorage()
		// 		setTimeout (ice40hx8k_handler, 1000)
		// 	}
		// 	catch (err) {
		// 		alert ("Nope. " + err.toString())
		// 		console.error (err)
		// 	}
		// 	event.source.postMessage ("Simulating!", event.origin)
		// }
	}

	window.addEventListener("message", receiveMessage, false);

	/**************************************************************************** */

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

	window.editor.on ('change', (e) => {
		try {
			editor_tab_list [window.active_tab.getAttribute ('workspace')][window.active_tab.getAttribute ('name')].setValue (editor.getValue())
		}
		catch (err) {
			console.log ("Error saving code: possible tab change in progress for: ")
			console.log ('workspace', window.active_tab.getAttribute ('workspace'))
			console.log ('name', window.active_tab.getAttribute ('name'))
		}
		saveAllFilesToStorage()
	})

	if (window.opener)
		window.opener.postMessage ("Ready", "https://engineering.purdue.edu")
}
