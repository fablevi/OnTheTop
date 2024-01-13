import Gtk from 'gi://Gtk';
import {ExtensionPreferences,gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OnTheTopPreferences extends ExtensionPreferences {
//export default class OnTheTopPreferences{
    fillPreferencesWindow(window) {
        let settings = this.getSettings();

        let builder = new Gtk.Builder();
        builder.set_translation_domain(this.metadata['gettext-domain']);
        builder.add_from_file(this.dir.get_child('settings.ui').get_path());

        //let panelPositions;
        //let panelRanks;

        let comboRowPositions = builder.get_object('positions'); 
        //let comboRowRanks = builder.get_object('ranking');

        

        window.add(builder.get_object('settings_page'));
    }
}