import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences,gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OnTheTopPreferences extends ExtensionPreferences {
//export default class OnTheTopPreferences{
    fillPreferencesWindow(window) {
        window.set_default_size(500-122, 600-122);
        let settings = this.getSettings();
        let json = this._importJSONFile();

        let builder = new Gtk.Builder();
        builder.set_translation_domain(this.metadata['gettext-domain']);
        builder.add_from_file(this.dir.get_child('settings.ui').get_path());

        let comboRowPositions = builder.get_object('positions'); 
        let comboRowRanks = builder.get_object('ranking');
        let comboRowSticky = builder.get_object('stickiness');

        //set the default value
        if(json.position == 'right'){
            comboRowPositions.set_selected(1);
        }else{
            comboRowPositions.set_selected(0);  
        }

        comboRowRanks.set_selected(json.rank);

        if(json.sticky == "false"){
            comboRowSticky.set_selected(1);
        }else{
            comboRowSticky.set_selected(0);
        }

        //add listeners
        comboRowPositions.connect("notify::selected-item",()=>{
            this._comboRowPositionsChange(comboRowPositions, settings)
        })

        comboRowRanks.connect("notify::selected-item",()=>{
            this._comboRowRanksChange(comboRowRanks, settings)
        })

        comboRowSticky.connect("notify::selected-item",()=>{
            this._comboRowStickinessChange(comboRowSticky, settings)
        })

        window.add(builder.get_object('settings_page'));
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
            console.log('error',error);
            return null;
        }
    }

    _comboRowPositionsChange(comboRow, settings){
        console.log('_comboRowPositionsChange',comboRow.selected)
        try{
            switch(comboRow.get_selected()){
                case 0:
                    settings.set_string("positions","left");
                    break;
                case 1:
                    settings.set_string("positions","right");
                    break;
                default:
                    console.log("nem mentek!!")
                    break;
            }
        }catch(error){
            console.log('error',error);
        }
        
    }

    _comboRowRanksChange(comboRow, settings){
        settings.set_string("ranking",comboRow.selected.toString());
    }

    _comboRowStickinessChange(comboRow, settings){
        try{
            switch(comboRow.get_selected()){
                case 0:
                    settings.set_string("stickiness","true");
                    break;
                case 1:
                    settings.set_string("stickiness","false");
                    break;
                default:
                    console.log("nem mentek!!")
                    break;
            }
        }catch(error){
            console.log('error',error);
        }
    }
}