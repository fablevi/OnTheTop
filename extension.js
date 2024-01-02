import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';

import Gtk from 'gi://Gtk'

export default class OnTheTop extends Extension {
    constructor(ext) {
        super(ext);
    }

    //ID's and listeners
    enable() {
        this.settings = this.getSettings();
        this.settings.connect("changed::positions", this._changePosition.bind(this))

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
        this._settingsJSON = this._importJSONFile()
        this._oldIndicator = Main.panel.addToStatusArea(this.uuid, this._indicator, 2, this._settingsJSON.position);
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

        this._settingsJSON = null;
        this._settings = null;
    }

    _importJSONFile() {
        let settingsJSONpath = `${this.path}/settings.json`
        try {
            let file = Gio.File.new_for_path(settingsJSONpath);
            let [success, content] = file.load_contents(null);

            if (success) {
                let json = JSON.parse(content);
                log('JSON tartalom:', json.position);
                return json;
            } else {
                log('Nem sikerült beolvasni a JSON fájlt.');
                return null;
            }
        } catch (error) {
            log('Hiba történt:', error.message);
            return null;
        }
    }

    //not used right now
    _updateJSONFile(newPosition) {
        let settingsJSONpath = `${this.path}/settings.json`
        try {
            let file = Gio.File.new_for_path(settingsJSONpath);
            let [success, content] = file.load_contents(null);

            if (success) {
                let json = JSON.parse(content);

                // Frissítsd a "position" kulcs értékét az új pozícióval
                json.position = newPosition;

                // JSON objektumot szöveggé alakítsuk
                let updatedContent = JSON.stringify(json, null, 4);

                // A fájl tartalmának frissítése
                file.replace_contents(
                    updatedContent,
                    null,
                    false,
                    Gio.FileCreateFlags.REPLACE_DESTINATION,
                    null
                );

                log('JSON fájl sikeresen frissítve.');
            } else {
                log('Nem sikerült beolvasni a JSON fájlt.');
            }
        } catch (error) {
            log('Hiba történt:', error.message);
        }
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

    _changePosition() {
        console.log('Valtozott ext!!')
        this._updateJSONFile(this.settings.get_string('positions'))
        this._changeIconPosition()
    }


    _changeIconPosition() {
        //Main.panel.remove
       /* if("right"==this.settings.get_string('positions')){
            Main.panel._rightBox.remove_child(Main.panel.statusArea['OnTheTop@fablevi.github.io'])
        }else if ("left"==this.settings.get_string('positions')){
            Main.panel._leftBox.remove_child(Main.panel.statusArea['OnTheTop@fablevi.github.io'])
        }else{
            console.log('Something wrong')
        }*/
        //console.log(this._test)
        //Main.panel.statusArea['OnTheTop@fablevi.github.io'].get_position()
        /*this._oldIndicator.destroy()
        this._settingsJSON = this._importJSONFile()
        this._oldIndicator = Main.panel.addToStatusArea(this.uuid, this._indicator, 2, this._settingsJSON.position);*/
    }
}

