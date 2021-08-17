# Simulator workspacing
- To incorporate the compilation of numerous files containing different modules as well as non-SystemVerilog files to be used as eg. memory initialization files, the simulator now has a workspace/filesystem feature that can help you organize your files into workspaces/folders.  Given below is a comprehensive guide on how to use them, along with tips and tricks.  
- Note that workspace/folder are exchangable terms that will be used throughout.  
## Creating a file/workspace
- In addition to the usual method of using the Add (+) tab to create a new tab, you can also create a new file and assign it to a workspace, or even create a new workspace to assign the file to.  To do this, click the New icon on the top left, which will open the File Manager (containing a list of workspaces with their files), and then the New Workspace/File dialog should appear.  The example below shows how to create a new file for a certain workspace, which you can pick from the list.  
<img src="md/newfile.gif" width="90%" height="auto"/>  
- While renaming files, you can rename them to one of two extensions - .sv for SystemVerilog, or .mem for memory init values, to be read in by your design using $readmemh, etc.  
- You can add a new workspace using the Workspace Add tab as shown below, which will ask for a valid name (stripping out special characters) and create the workspace with an initial template.sv.
<img src="md/newwksptab.gif" width="90%" height="auto"/>
- From the File Manager, you can create a new workspace by clicking the Create New... option in the dropdown and entering a valid workspace name.  A template.sv will be be added upon workspace creation.
<img src="md/newwksp.gif" width="90%" height="auto"/>
- You can also create a new workspace by reassigning a file to another workspace.  You can do this by quite simply dragging a file tab into the new workspace.
<img src="md/renameworkspace.gif" width="90%" height="auto"/>  
## Deleting a file/workspace
- If you used the simulator last semester, you would remember that you could only delete tabs by actually closing the tab, then deleting it from the file list.  With the workspace manager, you can simply delete the file, which will automatically close the tab upon deletion, so be sure to use this option with care!
- Deleting either files/workspaces is merely a matter of selecting them in the workspace manager, then clicking the Delete button at the bottom or the Delete key (the GIF uses the latter).  You'll also notice that if the file being deleted is the last file in a workspace, the workspace will also be deleted since it is then no longer necessary.  (Warning: do not delete the 'default' workspace, since the code expects the default workspace to exist in the browser localStorage.)
<img src="md/deletefile.gif" width="90%" height="auto"/>  
## Memory files in workspaces
- The $readmemh and $readmemb system tasks may be used in SystemVerilog to preload 'logic'/'reg'-based memory with values from a given file.  In a workspace simulation, the mem files will be sent along with the code to be saved in the same directory so that it can be detected by the compiler, which checks for the existence of these files if the code makes use of $readmemX system tasks that reference them.  Ensure that no paths, only the filename, is used, eg. "values.mem", in the $readmemX system task, and that 'Workspace Simulation' is set.  
- In the example below, File Simulation is toggled to demonstrate what happens if the requisite memory file is not found when it is referenced by the code.  Setting it back to Workspace Simulation will show what happens when the memory file exists - in this case, the readmemh function reads the values from values.mem (70af) into the 16-bit memory[0] logic bus, which is connected to 'left' and 'right' to show the value propagation.  
<img src="md/readmem.gif" width="90%" height="auto"/>  
## Switching simulation types
- Having a workspace of files to simulate can result in issues if you have multiple designs with the top module in different files, triggering the "multiple top module" error from the syntax-checking process.  The new "workspace simulation" button is meant to solve this issue:
    - "Workspace simulation" will send all the files for the current tab's workspace for simulation.  This will cause errors if multiple files have conflicting modules.  
    - "File simulation" is the old method of simulation - whatever is in the editor at the moment will be simulated, and no other files will be sent.  
## Workspace Settings (added Spring 2021)
- For more complex labs (likely labs 12 and 13) you will need to enable "support modules", which provide hidden functionality upon which you will build designs outlined in lab documents.  
- You may also change the testbench for a specific workspace, so clicking Verify Design will automatically copy your code to HDLwave and run the corresponding testbench.  For example, if you're working on lab 7, you would set the lab7 testbench in the workspace settings, and clicking Verify Design will open HDLwave in a new tab with your code and auto-run the testbench.  This is mostly intended as a time-saving feature.
- To access these settings, open the workspace you'd like to modify.  Notice that when the workspace is open, its corresponding tab will have a gear icon in the top-right corner.  
<img src="md/wkspgear.PNG" width="15%" height="auto"/>  
- Move your cursor over the gear until a circle appears around it, then click it.  A panel will appear showing the settings for that workspace.  
<img src="md/wkspsettings.PNG" width="70%" height="auto"/>  
- In the example shown above, the user happens to be working on lab12 in the 'default' workspace, and so the 'support_lab12.sv' file is enabled, providing needed functionality to work on the lab, and the testbench is set to lab12full.  To enable/disable support files, just click on the corresponding checkbox, and to change the testbench, click on the dropdown to select another one.  