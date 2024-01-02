import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const KeyValuePair = GObject.registerClass(
    {
        Properties: {
            key: GObject.ParamSpec.string(
                "key",
                null,
                null,
                GObject.ParamFlags.READWRITE,
                "",
            ),
            value: GObject.ParamSpec.string(
                "value",
                "Value",
                "Value",
                GObject.ParamFlags.READWRITE,
                "",
            ),
        },
    },
    class KeyValuePair extends GObject.Object { },
);

export default class OnTheTopPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Appearance'),
            description: _('Configure the appearance of the extension'),
        });
        group.add(this._createDDMenu(settings))
        page.add(group);
    }

    _createDDMenu(settings) {
        const model = new Gio.ListStore({ item_type: KeyValuePair });
        model.splice(0, 0, [
            new KeyValuePair({ key: "right", value: "Right" }),
            new KeyValuePair({ key: "left", value: "Left" }),
        ]);
        const positionComboBox = new Adw.ComboRow({
            title: "Set position",
            subtitle: "Set the extension icon's position",
            model: model,
            expression: new Gtk.PropertyExpression(KeyValuePair, null, "value"),
        });

        let json = this._importJSONFile();

        for (let i = 0; i < model.n_items; i++) {
            if (
              model.get_item(i).key == json.position
            ) {
                positionComboBox.selected = i;
              break;
            }
          }

        positionComboBox.connect("notify::selected-item",()=>{
            this._comboBoxChange(positionComboBox, settings)
        })

        return positionComboBox
    }
    
    _comboBoxChange(positionComboBox, settings){
        settings.set_string("positions",positionComboBox.selected_item.key)
        let positions = positionComboBox.selected_item.key;
        
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
            return null;
        }
    }
}