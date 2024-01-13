import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences,gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OnTheTopPreferences extends ExtensionPreferences {
//export default class OnTheTopPreferences{
    fillPreferencesWindow(window) {
        let settings = this.getSettings();
        let json = this._importJSONFile();

        let builder = new Gtk.Builder();
        builder.set_translation_domain(this.metadata['gettext-domain']);
        builder.add_from_file(this.dir.get_child('settings.ui').get_path());

        //let panelPositions;
        //let panelRanks;

        let comboRowPositions = builder.get_object('positions'); 
        //let comboRowRanks = builder.get_object('ranking');

        if(json.position == 'right'){
            comboRowPositions.set_selected(1);
        }else{
            comboRowPositions.set_selected(0);  
        }

        comboRowPositions.connect("notify::selected-item",()=>{
            this._comboBoxChange(comboRowPositions, settings)
        })

        window.add(builder.get_object('settings_page'));
    }

    _importJSONFile() {
        let settingsJSONpath = `${this.path}/settings.json`
        try {
            let file = Gio.File.new_for_path(settingsJSONpath);
            let [success, content] = file.load_contents(null);
            console.log('success: ', content);
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

    _comboBoxChange(comboRowPositions, settings){
        switch(comboRowPositions.get_selected()){
            case 0:
                settings.set_string("positions","left");
                break;
            case 1:
                settings.set_string("positions","right");
                break;
        }
    }
}