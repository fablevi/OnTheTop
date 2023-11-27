
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import Clutter from 'gi://Clutter';

export default class ExampleExtension extends Extension {
    enable() {

        //above funkcio id-ja
        this._handlerId = 0;

        this._oldGlobalDisplayFocusWindow = null;

        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

        //onthetop
        this._aboveIcon = new St.Icon({
            icon_name: 'go-top-symbolic',
            style_class: 'system-status-icon',
        })

        //onunder
        this._belowIcon = new St.Icon({
            icon_name: 'go-bottom-symbolic',
            style_class: 'system-status-icon',
        })

        if (global.display.focus_window) {
            this._indicator.visible = true
            this._indicator.add_child(this._belowIcon)
            this._newFocusedWindow()
        }else{
            this._indicator.visible = false
        }

        //Window is focused
        Shell.WindowTracker.get_default().connectObject('notify::focus-app',
            this._focusAppChanged.bind(this), this);

        global.window_manager.connectObject('switch-workspace',
            this._focusAppChanged.bind(this), this);

        // Add the indicator to the panel
        Main.panel.addToStatusArea(this.uuid, this._indicator, 2, 'left');
        //Main.panel._leftBox.insert_child_at_index(this._indicator, 1)
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }

    _focusAppChanged() {
        console.log('_focusAppChanged.................................................................')
        this._isWindowChange_Handler()
        this._changeIcon()
    }

    _isAboveFunction() {
        console.log("TEST: _isAbove()")
        this._changeIcon()
    }

    _isWindowChange_Handler() {
        if (this._oldGlobalDisplayFocusWindow) {
            this._oldGlobalDisplayFocusWindow.disconnect(this._handlerId)
        }
        this._newFocusedWindow()
    }

    _newFocusedWindow() {
        this._oldGlobalDisplayFocusWindow = global.display.focus_window?global.display.focus_window:null;
        this._handlerId = global.display.focus_window?global.display.focus_window.connect('notify::above', this._isAboveFunction.bind(this)):0;
        console.log("global.display.focus_window newFocusedWindow", global.display.focus_window)
        console.log("this:handlerId: ", this._handlerId)
    }

    _changeIcon() {
        //change icons
        console.log("global.display.focus_window, changed icon: ", global.display.focus_window)
        try {
            if (global.display.focus_window) {
                this._indicator.visible = true
                if (global.display.focus_window.is_above()) {
                    this._indicator.remove_child(this._belowIcon)
                    this._indicator.add_child(this._aboveIcon)
                } else {
                    this._indicator.remove_child(this._aboveIcon)
                    this._indicator.add_child(this._belowIcon)
                }
            }
            console.log("global.display.focus_window: ", global.display.focus_window.is_above())
        }
        catch {
            console.log("CATCHEDDDDDDDDDDDDDDDDDDDD")
            this._indicator.visible = false
        }
    }
}

