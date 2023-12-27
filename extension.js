import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';


export default class OnTheTop extends Extension {
    constructor(ext) {
        super(ext);
    }

    //ID's and listeners
    enable() {
        this._handlerId = null;
        this._oldGlobalDisplayFocusWindow = null;

        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._indicator.connect('button-press-event', this._buttonClicked.bind(this));

        //icon size
        this._iconSize = 16;

        const aboveAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/above-symbolic.svg`);
        this._aboveIcon = this._createIcon(aboveAdwaitaIcon);

        const underAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/under-symbolic.svg`);
        this._belowIcon = this._createIcon(underAdwaitaIcon);

        this._firstIconUpdate();

        //Opened window listeners
        Shell.WindowTracker.get_default().connectObject('notify::focus-app', this._focusAppChanged.bind(this), this);
        global.window_manager.connectObject('switch-workspace', this._focusAppChanged.bind(this), this);

        // Add the indicator to the panel
        Main.panel.addToStatusArea(this.uuid, this._indicator, 2, 'left');
    }

    disable() {
        this._handlerId = null;
        this._aboveIcon?.destroy();
        this._aboveIcon = null;

        this._belowIcon?.destroy();
        this._belowIcon = null;

        global.window_manager.disconnectObject(this);
        Shell.WindowTracker.get_default().disconnectObject(this);

        this._indicator?.destroy();
        this._indicator = null;
    }

    _focusAppChanged() {
        this._isWindowChange_Handler();
        this._changeIcon();
    }

    _isAboveFunction() {
        this._changeIcon();
    }

    _isWindowChange_Handler() {
        if (this._oldGlobalDisplayFocusWindow) {
            this._oldGlobalDisplayFocusWindow.disconnect(this._handlerId);
        }
        this._newFocusedWindow();
    }

    _newFocusedWindow() {
        this._oldGlobalDisplayFocusWindow = global.display.focus_window ? global.display.focus_window : null;
        this._handlerId = global.display.focus_window ? global.display.focus_window.connect('notify::above', this._isAboveFunction.bind(this)) : 0;
    }

    _changeIcon() {
        try {
            if (global.display.focus_window) {
                this._indicator.visible = true;
                if (global.display.focus_window.is_above()) {
                    this._indicator.remove_child(this._belowIcon);
                    this._indicator.add_child(this._aboveIcon);
                } else {
                    this._indicator.remove_child(this._aboveIcon);
                    this._indicator.add_child(this._belowIcon);
                }
            } else {
                this._indicator.visible = false;
            }
        }
        catch {
            this._indicator.visible = false;
        }
    }

    _buttonClicked() {
        global.display.focus_window.is_above() ? global.display.focus_window.unmake_above() : global.display.focus_window.make_above();
    }

    //check if any opened window is_above()
    _firstIconUpdate() {
        if (global.display.focus_window) {
            this._indicator.visible = true;
            this._indicator.add_child(global.display.focus_window.is_above() ? this._aboveIcon : this._belowIcon);
            this._newFocusedWindow();
        } else {
            this._indicator.visible = false;
        }
    }

    _createIcon(icon) {
        return new St.Icon({
            gicon: icon,
            style_class: 'system-status-icon',
            icon_size: this._iconSize
        });
    }
}

