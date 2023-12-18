import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio'


export default class ExampleExtension extends Extension {
    constructor(ext) {
        super(ext)
    }

    enable() {
        //above funkcio id-ja
        this._handlerId = 0;

        this._oldGlobalDisplayFocusWindow = null;

        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._indicator.connect('button-press-event', this._buttonClicked.bind(this))

        //icon size
        this._iconSize = 20;

        //onthetop
        const aboveAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/Symbolic/above-symbolic.svg`)

        this._aboveIcon = new St.Icon({
            gicon: aboveAdwaitaIcon,
            style_class: 'system-status-icon',
            icon_size: this._iconSize
        })

        const underAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/Symbolic/under-symbolic.svg`)

        //onunder
        this._belowIcon = new St.Icon({
            gicon: underAdwaitaIcon,
            style_class: 'system-status-icon',
            icon_size: this._iconSize
        })

        if (global.display.focus_window) {
            this._indicator.visible = true
            this._indicator.add_child(global.display.focus_window.is_above()?this._aboveIcon:this._belowIcon)
            this._newFocusedWindow()
        } else {
            this._indicator.visible = false
        }

        //Window is focused
        this._focusAppHandlerId = Shell.WindowTracker.get_default().connectObject('notify::focus-app',
            this._focusAppChanged.bind(this), this);

        this._switchWorkspaceHandleId = global.window_manager.connectObject('switch-workspace',
            this._focusAppChanged.bind(this), this);

        this._settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });

        // Add the indicator to the panel
        Main.panel.addToStatusArea(this.uuid, this._indicator, 2, 'left');
    }

    disable() {
        this._aboveIcon?.destroy()
        this._aboveIcon=null

        this._belowIcon?.destroy()
        this._belowIcon = null

        global.window_manager.disconnectObject(this)//this._switchWorkspaceHandleId
        Shell.WindowTracker.get_default().disconnectObject(this)//this._focusAppHandlerId
        this._settings.disconnect(this._settingsHandleId)

        this._indicator?.destroy();
        this._indicator = null;

        this._focusAppHandlerId = null;
        this._switchWorkspaceHandleId = null;
        this._handlerId = null;
        this._gnome_theme = null;
        this._settings = null;
        this._settingsHandleId = null;
    }

    _focusAppChanged() {
        this._isWindowChange_Handler()
        this._changeIcon()
    }

    _isAboveFunction() {
        this._changeIcon()
    }

    _isWindowChange_Handler() {
        if (this._oldGlobalDisplayFocusWindow) {
            this._oldGlobalDisplayFocusWindow.disconnect(this._handlerId)
        }
        this._newFocusedWindow()
    }

    _newFocusedWindow() {
        this._oldGlobalDisplayFocusWindow = global.display.focus_window ? global.display.focus_window : null;
        this._handlerId = global.display.focus_window ? global.display.focus_window.connect('notify::above', this._isAboveFunction.bind(this)) : 0;
    }

    _changeIcon() {
        //change icons
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
            } else {
                this._indicator.visible = false
            }
        }
        catch {
            this._indicator.visible = false
        }
    }

    _buttonClicked() {
        global.display.focus_window.is_above() ? global.display.focus_window.unmake_above() : global.display.focus_window.make_above();
    }
}

