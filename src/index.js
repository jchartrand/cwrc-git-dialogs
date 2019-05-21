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

//import React, {Component} from 'react'

import save from "./Save.js"
import load from './Load.js'
import authenticate from './authenticate.js'

import cwrcGit from 'cwrc-git-server-client'

// TODO redo as react component
let state = {
    userId: undefined,
    userName: undefined,
    userUrl: undefined,
    repo: undefined,
    path: undefined
}

function doGetInfoForAuthenticatedUser() {
	return cwrcGit.getInfoForAuthenticatedUser()
		.then((info) => {
            console.log('github user', info);
            state.userUrl = info.html_url;
            state.userName = info.name;
            state.userId = info.login;
		}, (errorMessage) => {
			console.log("in the fail in getInfoAndReposForAuthenticatedUser")
			var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`
			console.log(message)
		});
}

function saveWrap(writer) {
    authenticate(() => {
        save.call(this, writer, state)
    })
}

function loadWrap(writer, shouldOverwrite = false) {
    authenticate(() => {
        if (state.userId) {
            load.call(this, writer, state, shouldOverwrite)
        } else {
            doGetInfoForAuthenticatedUser().then(() => {
                load.call(this, writer, state, shouldOverwrite)
            })
        }
    })
}

function getUserInfo() {
    return {
        userUrl: state.userUrl,
        userName: state.userName,
        userId: state.userId
    }
}

function getDocumentURI() {
    let path = state.path;
    if (path.charAt(0) !== '/') {
        path = '/'+path;
    }
    return 'https://github.com/'+state.repo+'/blob/master'+path;
}

export default {
	save: saveWrap,
    load: loadWrap,
    getUserInfo,
    getDocumentURI
}
