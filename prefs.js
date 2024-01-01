import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MyExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
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
        page.add(group);

        /*const iconPositionComboBox = new Adw.ComboRow({
            title: "Position setting",
            subtitle: "Set the icon default position on the top bar",
            model: model,
            expression: new Gtk.PropertyExpression(KeyValuePair, null, "value"),
        });*/
    }
}