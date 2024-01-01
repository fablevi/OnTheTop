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
const settings = this.getSettings();


export default class OnTheTopPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        settings.set_string("OnTheTopJSON",this._importJSONFile())

        settings.connect("changed::OnTheTopJSON",this._changePosition.bind(this))

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
        group.add(this._createDDMenu())
        page.add(group);
    }

    _createDDMenu() {
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

        positionComboBox.connect("notify::selected-item",()=>{
            this._comboBoxChange(positionComboBox)
        })

        return positionComboBox
    }
    
    _comboBoxChange(positionComboBox){
        console.log(positionComboBox.selected_item.key)

        let json = settings.get_string("OnTheTopJSON")
        json.position = positionComboBox.selected_item.key;
        settings.set_string("OnTheTopJSON",json)
    }

    _changePosition(){
        console.log('Valtozott!!')
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
}