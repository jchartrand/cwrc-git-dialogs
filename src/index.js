'use strict';

// shared instance of bootstraped jquery for entity and git dialogs
let $ = window.cwrcQuery
if ($ === undefined) {
    let prevJQuery = window.jQuery
    $ = require('jquery')
    window.jQuery = $
    require('bootstrap')
    window.jQuery = prevJQuery
    window.cwrcQuery = $
}


import save from "./Save.js"
import load from './Load.js'
import authenticate from './authenticate.js'

export default {
	save,
	load,
	authenticate
}
