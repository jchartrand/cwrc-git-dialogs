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

import React, {Component} from 'react'
import ReactDOM from 'react-dom';
import { Modal, Button } from 'react-bootstrap';
import cwrcGit from 'cwrc-git-server-client';

import save from "./Save.js"
import { LoadDialog } from './Load.js'
import { AuthenticateDialog, authenticate, getUserInfo } from './authenticate.js'

let _writer;
let dialogId;
let renderId;

let _userInfo;
let _repo;
let _path;

// we need to move dialog show state up so it can be re-opened
let doShow = true;

function initDialogs(writer) {
    _writer = writer;
    dialogId = _writer.getUniqueId('git-dialogs-');
    renderId = _writer.getUniqueId('git-dialogs-');
    _writer.dialogManager.getDialogWrapper().append(`<div id=${renderId} />`);
}

function saveWrap(writer) {
    if (_writer === undefined) {
        initDialogs(writer)
    }
    doShow = true;
    ReactDOM.render(
        <GitDialog action="save" isDocLoaded={writer.isDocLoaded}/>,
        document.querySelector('#'+renderId)
    );
    $('#'+dialogId).addClass('cwrc');
}

function loadWrap(writer, shouldOverwrite = false) {
    if (_writer === undefined) {
        initDialogs(writer)
    }
    doShow = true;
    ReactDOM.render(
        <GitDialog action="load" isDocLoaded={writer.isDocLoaded}/>,
        document.querySelector('#'+renderId)
    );
    $('#'+dialogId).addClass('cwrc');
}

function getUserInfoWrap() {
    return _userInfo;
}

function getDocumentURI() {
    let path = _path;
    if (path.charAt(0) !== '/') {
        path = '/'+path;
    }
    return 'https://github.com/'+_repo+'/blob/master'+path;
}

class GitDialog extends Component {
    constructor(props) {
        super(props);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.state = {
            user: undefined,
            repo: undefined,
            path: undefined,
            show: true
        }
    }

    componentDidMount() {
        console.log('componentDidMount')
    }

    componentWillUnmount() {
        console.log('componentWillUnmount')
    }

    handleAuthentication(userInfo) {
        console.log('setting user info', userInfo);
        _userInfo = userInfo;
        this.setState({user: userInfo});
    }

    handleFileSelect(repo, path) {
        _repo = undefined;
        _path = undefined;
		cwrcGit.getDoc(repo, 'master', path)
			.done((result)=>{
                _repo = repo;
                _path = path;
                this.setState({repo, path});
                this.handleClose();
                setTimeout(()=>{
                    _writer.setDocument(result.doc);
                }, 50)
			}).fail((error)=>{
                console.warn(error);
                this.setState({repo: undefined, path: undefined});
			});
    }

    handleFileUpload(doc) {
        _repo = undefined;
        _path = undefined;
        this.handleClose();
        setTimeout(()=>{
            _writer.setDocument(doc);
        }, 50)
    }

    handleClose() {
        doShow = false;
        this.setState({show: false});
    }

    render() {
        const show = doShow;
        const action = this.props.action;
        const isDocLoaded = this.props.isDocLoaded;
        if (this.state.user === undefined) {
            console.log('need authentication')
            return (
                <Modal id={dialogId} show={show} animation={false}>
                    <AuthenticateDialog onUserAuthentication={this.handleAuthentication} />
                </Modal>
            )
        } else {
            switch (action) {
                case 'load':
                    return (
                        <Modal id={dialogId} show={show} bsSize="large" animation={false}>
                            <LoadDialog isDocLoaded={isDocLoaded} user={this.state.user} onFileSelect={this.handleFileSelect} onFileUpload={this.handleFileUpload} handleClose={this.handleClose} />
                        </Modal>
                    )
                case 'save':
                    console.log('do save');
                    return null;
            }
        }
    }
}

export {
	saveWrap as save,
    loadWrap as load,
    authenticate,
    getUserInfoWrap as getUserInfo,
    getDocumentURI
}
