
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import St from 'gi://St';
import Shell from 'gi://Shell';

/*let panelButton;

    let aboveIcon  = new St.Icon({
        icon_name: 'go-top-symbolic',
        style_class: 'system-status-icon',
    })
    
    let belowIcon  = new St.Icon({
        icon_name: 'go-bottom-symbolic',
        style_class: 'system-status-icon',
    })

export default class ExampleExtension extends Extension{
    
    enable() {
        Main.panel._leftBox.insert_child_at_index(panelButton,1)
    }
    
    disable() {
        Main.panel._leftBox.remove_child_at_index(panelButton,1)
    }
    
    init() {
        panelButton = new St.Bin({
            style_class:'panel-button'
        })
    
        panelButton.set_child(belowIcon)
    }
}*/

export default class ExampleExtension extends Extension {
    enable() {
        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

        const aboveIcon  = new St.Icon({
            icon_name: 'go-top-symbolic',
            style_class: 'system-status-icon',
        })
        
        const belowIcon  = new St.Icon({
            icon_name: 'go-bottom-symbolic',
            style_class: 'system-status-icon',
        })

        this._indicator.add_child(belowIcon);

        //Window is focused
        Shell.WindowTracker.get_default().connectObject('notify::focus-app',
            this._focusAppChanged.bind(this), this);

        // Add the indicator to the panel
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }

    _focusAppChanged(){
        console.log('TEST.................................................................')
    }
}

