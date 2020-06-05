# Tips and tricks for the simulator  
### Holding down buttons on the simulator
- When you start labs where you need to hold down multiple buttons the virtual breakout board, you might find the following ways to do it very helpful:
    - The default and easiest way is to hold down the keys corresponding to the buttons.  You may find that this doesn't work when you are pressing more than 4/5 buttons, in which case, you'll have to set them in a fixed position while toggling the keys you need to toggle.  You can do that using the other methods outlined below.
    ![multiplekeys.gif](md/multiplekeys.gif)
    - To leave a button asserted without holding down the key all the time, you can also use the Shift key.  In the example below, I press Shift+W, letting go of those buttons, and then press and release 0 and 3 to toggle them.  To release the W button from being held down, pressing W or Shift-W will do the trick.
    ![keyassert.gif](md/keyassert.gif)
    - You can also use the mouse to hold down buttons, if you prefer - simply hold down Shift as you're clicking on the buttons.  
    ![mousekey.gif](md/mousekey.gif)
    - And finally, the method below was originally a bug, but we decided to label it a feature.  In this case, you don't even have to use the Shift key if you're clicking to hold down the buttons.  If you click on the text of the button, and release, you will find that the button toggles as usual.  But if you move the cursor of your mouse to the edge of the button, well away from the button text, and click and release, the button won't come back up.  
    ![bugkey.gif](md/bugkey.gif)
    - This is because the button size reduces as you are clicking the button (to give you the illusion of the button "going down") so the mouse is no longer over the active region of the button.  Being outside the region prevents the button from being restored to its original state when the mouse button is released, and so the button is held down.
### Simulate-on-Save
- For those of you used to coding, pressing Ctrl+S regularly to save must be second nature to you.  While pressing Ctrl+S on the simulator, the code you typed does get saved into the browser, but you can also add a second action to simulate immediately after saving by enabling the Simulate-on-Save option in Settings.
### Multicursor typing
- You can select multiple lines in the editor for when you want to type the same word for each line, as shown:  
    ![multicursor.gif](md/multicursor.gif)
    - Make sure the cursor is selected on the first line from where you want to add cursors.
    - On Windows, press Ctrl + Alt + Up/Down, depending on the way you're adding cursors.
    - On Mac, press Ctrl + Option + Up/Down.
    - On Linux, the keyboard shortcuts don't seem to work so you can click and drag in the Up/Down direction while holding down Ctrl + Alt, as shown:  
    ![linuxmulticursor.gif](md/linuxmulticursor.gif)  
    - When you've set the cursors, let go of Ctrl + Alt + Up/Down (or your mouse button), and type as necessary.  You can select characters with the keyboard using Shift + Left/Right.  Experiment for a while to see what works for you.
- Sometimes the text you want to change is not in different lines or aligned vertically.  In that case, you can explicitly add cursors by holding down Ctrl and clicking in different positions.  Use the Shift + Left/Right keys to select the characters you want to modify.  
    ![multicursor2.gif](md/multicursor2.gif)  
- On occassion, you might want to change specific words across the document, but they aren't along the same row/column so you can't click and drag to add cursors along an axis.  In that case, you can hold down Ctrl and either:
    - Click to add cursors at specific spots, or;  
    ![multicursor3.gif](md/multicursor3.gif)  
    - Double-click to select the entire word at each spot.  
    ![multicursor4.gif](md/multicursor4.gif)  
### <a href="#" onclick='displayPage("md/intro.md")'>Back to Introduction</a>