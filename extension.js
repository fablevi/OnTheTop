import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';

export default class OnTheTop extends Extension {
    constructor(ext) {
        super(ext);
    }

    //ID's and listeners
    enable() {
        this.settings = this.getSettings();
        this.settings.connect("changed::positions", this._changePosition.bind(this))
        this.settings.connect("changed::ranking", this._changePosition.bind(this))
        this.settings.connect("changed::stickiness", this._changePosition.bind(this))

        this._menu = null;

        this._handlerId = null;
        this._stickhandlerId = null;
        this._oldGlobalDisplayFocusWindow = null;

        this._indicator = null;

        this._aboveIcon = null;
        this._belowIcon = null;
        this._noFocusIcon = null;
        this._aboveStickyIcon = null;
        this._belowStickyIcon = null;

        this._createButton()

        //Opened window listeners
        Shell.WindowTracker.get_default().connectObject('notify::focus-app', this._focusAppChanged.bind(this), this);
        global.window_manager.connectObject('switch-workspace', this._focusAppChanged.bind(this), this);
    }

    _createButton() {
        //icon size
        this._iconSize = 16;

        const aboveAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/pinned-symbolic.svg`);
        this._aboveIcon = this._createIcon(aboveAdwaitaIcon);

        const underAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/under-symbolic.svg`);
        this._belowIcon = this._createIcon(underAdwaitaIcon);

        const noAdwaitaIcon = Gio.icon_new_for_string(`${this.path}/icons/noFocus-symbolic.svg`);
        this._noFocusIcon = this._createIcon(noAdwaitaIcon);

        const aboveAdwaitaStickyIcon = Gio.icon_new_for_string(`${this.path}/icons/pinned-sticky-symbolic.svg`);
        this._aboveStickyIcon = this._createIcon(aboveAdwaitaStickyIcon);

        const underAdwaitaStickyIcon = Gio.icon_new_for_string(`${this.path}/icons/under-sticky-symbolic.svg`);
        this._belowStickyIcon = this._createIcon(underAdwaitaStickyIcon);

        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._indicator.connect('button-press-event', this._buttonClicked.bind(this));

        this._firstIconUpdate();

        // Add the indicator to the panel
        this._settingsJSON = this._importJSONFile();
        console.log(JSON.stringify(this._settingsJSON));
        this._addMenu();
        Main.panel.addToStatusArea(this.uuid, this._indicator, this._settingsJSON.rank, this._settingsJSON.position);


    }

    _addMenu() {
        this._menu = new PopupMenu.PopupMenuItem('Settings', {

        });
        this._menu.connect('activate', () => {
            try {
                this.openPreferences();
            } catch (e) {
                console.log('error', e);
            }
        });
        this._indicator.menu.addMenuItem(this._menu);
    }

    disable() {
        this._handlerId = null;
        this._stickhandlerId = null;
        this._oldGlobalDisplayFocusWindow = null;

        this._aboveIcon?.destroy();
        this._aboveIcon = null;

        this._belowIcon?.destroy();
        this._belowIcon = null;

        this._noFocusIcon?.destroy();
        this._noFocusIcon = null;

        this._aboveStickyIcon?.destroy();
        this._aboveStickyIcon = null;

        this._belowStickyIcon?.destroy();
        this._belowStickyIcon = null;

        global.window_manager.disconnectObject(this);
        Shell.WindowTracker.get_default().disconnectObject(this);

        this._indicator?.destroy();
        this._indicator = null;

        this._settingsJSON = null;
        this._settings = null;

        this._menu?.destroy();
        this._menu = null;
    }

    _importJSONFile() {
        let settingsJSONpath = `${this.path}/settings.json`
        try {
            let file = Gio.File.new_for_path(settingsJSONpath);
            let [success, content] = file.load_contents(null);

            if (success) {
                let json = JSON.parse(content);
                return json;
            } else {
                return null;
            }
        } catch (error) {
            log('Hiba történt:', error.message);
            return null;
        }
    }

    //not used right now
    _updateJSONFile(newPosition, newRank, newSticky) {
        let settingsJSONpath = `${this.path}/settings.json`
        try {
            let file = Gio.File.new_for_path(settingsJSONpath);
            let [success, content] = file.load_contents(null);

            if (success) {
                let json = JSON.parse(content);

                // Frissítsd a "position" kulcs értékét az új pozícióval
                json.position = newPosition;
                json.rank = newRank;
                json.sticky = newSticky;

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
            } else {
            }
        } catch (error) {
            log('Hiba történt:', error.message);
        }
    }

    _focusAppChanged() {
        this._isWindowChange_Handler();
        this._changeIcon();
    }

    _isNotified() {
        this._changeIcon();
    }

    _isWindowChange_Handler() {
        if (this._oldGlobalDisplayFocusWindow) {
            this._oldGlobalDisplayFocusWindow.disconnect(this._handlerId);
            this._oldGlobalDisplayFocusWindow.disconnect(this._stickhandlerId);
        }
        this._newFocusedWindow();
    }

    _newFocusedWindow() {
        this._oldGlobalDisplayFocusWindow = global.display.focus_window ? global.display.focus_window : null;
        this._handlerId = global.display.focus_window ? global.display.focus_window.connect('notify::above', this._isNotified.bind(this)) : 0;
        this._stickhandlerId = global.display.focus_window ? global.display.focus_window.connect('notify::on-all-workspaces', this._isNotified.bind(this)) : 0;
    }

    _changeIcon() {
        console.log("this.settings.get_string('stickiness'): ", this.settings.get_string('stickiness'))
        try {
            if (global.display.focus_window) {
                if (global.display.focus_window.is_above() && global.display.focus_window.is_on_all_workspaces()) {
                    this._indicator.remove_child(this._indicator.first_child);
                    this._indicator.add_child(this._aboveStickyIcon);
                } else if (global.display.focus_window.is_on_all_workspaces()) {
                    this._indicator.remove_child(this._indicator.first_child);
                    this._indicator.add_child(this._belowStickyIcon);
                } else if (global.display.focus_window.is_above()) {
                    this._indicator.remove_child(this._indicator.first_child);
                    this._indicator.add_child(this._aboveIcon)
                } else {
                    this._indicator.remove_child(this._indicator.first_child);
                    this._indicator.add_child(this._belowIcon);
                }
            } else {
                this._indicator.remove_child(this._indicator.first_child);
                this._indicator.add_child(this._noFocusIcon);
            }
        }
        catch {
            //this._indicator.reactive = false
            this._indicator.remove_child(this._indicator.first_child);
            this._indicator.add_child(this._noFocusIcon);
            //this._indicator.visible = false;
        }
    }

    _buttonClicked(actor, event) {
        if (event.get_button() === Clutter.BUTTON_PRIMARY) {
            this._indicator.menu.toggle();
            if (global.display.focus_window) {
                global.display.focus_window.is_above() ? global.display.focus_window.unmake_above() : global.display.focus_window.make_above();
                if (this.settings.get_string('stickiness') != "false") {
                    if (global.display.focus_window.is_on_all_workspaces() && !global.display.focus_window.is_above()) {
                        global.display.focus_window.unstick()
                    } else {
                        global.display.focus_window.stick();
                    }
                } else {
                    global.display.focus_window.is_on_all_workspaces() ? global.display.focus_window.unstick() : null;
                }
            }
        } else if (event.get_button() === Clutter.BUTTON_SECONDARY) {
            //console.log('Jobb egérgomb lenyomva');
        }
    }

    //check if any opened window is_above()
    _firstIconUpdate() {
        //replace with reactive
        if (global.display.focus_window) {
            //this._indicator.visible = true;
            //this._indicator.reactive = true
            this._indicator.add_child(global.display.focus_window.is_above() ? this._aboveIcon : this._belowIcon);
            this._newFocusedWindow();
        } else {
            //this._indicator.reactive = false;
            this._indicator.add_child(this._noFocusIcon);
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
        console.log('_changePosition', this.settings.get_string('positions'), this.settings.get_string('ranking'), this.settings.get_string('stickiness'));
        this._updateJSONFile(this.settings.get_string('positions'), this.settings.get_string('ranking'), this.settings.get_string('stickiness'));
        //this._updateJSONFile(this.settings.get_string('positions'),2);
        this._changeIconPosition();
    }


    _changeIconPosition() {
        this._aboveIcon?.destroy();
        this._aboveIcon = null;

        this._belowIcon?.destroy();
        this._belowIcon = null;

        this._indicator?.destroy();
        this._indicator = null;

        this._aboveStickyIcon?.destroy();
        this._aboveStickyIcon = null;

        this._belowStickyIcon?.destroy();
        this._belowStickyIcon = null;

        this._createButton();
    }
}

