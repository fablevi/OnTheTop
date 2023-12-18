import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';

export default class ExampleExtension extends Extension {
    constructor(ext) {
        super(ext);
        this._indicator = null;
        this._aboveIcon = null;
        this._belowIcon = null;
        this._oldGlobalDisplayFocusWindow = null;
        this._handlerId = 0;
    }

    enable() {
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._indicator.connect('button-press-event', this._buttonClicked.bind(this));

        this._aboveIcon = this._createIcon(`${this.path}/icons/Above-symbolic.svg`);
        this._belowIcon = this._createIcon(`${this.path}/icons/Under-symbolic.svg`);

        this._initializeIcons();
        this._updateIconPosition();

        this._focusAppHandlerId = Shell.WindowTracker.get_default().connectObject('notify::focus-app',
            this._focusAppChanged.bind(this), this);

        this._switchWorkspaceHandleId = global.window_manager.connectObject('switch-workspace',
            this._focusAppChanged.bind(this), this);

        Main.panel.addToStatusArea(this.uuid, this._indicator, 2, 'left');
    }

    disable() {
        this._aboveIcon?.destroy();
        this._belowIcon?.destroy();

        global.window_manager.disconnectObject(this._switchWorkspaceHandleId);
        Shell.WindowTracker.get_default().disconnectObject(this._focusAppHandlerId);

        this._indicator?.destroy();
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
        this._updateIconPosition();
    }

    _buttonClicked() {
        global.display.focus_window.is_above() ? global.display.focus_window.unmake_above() : global.display.focus_window.make_above();
    }

    _initializeIcons() {
        this._indicator.add_child(this._aboveIcon);
        this._indicator.visible = false;
    }

    _createIcon(giconPath) {
        const icon = Gio.icon_new_for_string(giconPath);
        return new St.Icon({
            gicon: icon,
            style_class: 'system-status-icon',
            icon_size: 20,
        });
    }

    _updateIconPosition() {
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
        } catch (error) {
            this._indicator.visible = false;
        }
    }
}
