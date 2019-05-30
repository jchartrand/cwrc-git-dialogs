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
import { Modal, Button, Label } from 'react-bootstrap';
import cwrcGit from 'cwrc-git-server-client';

import queryString from 'query-string';

import Splash from './Splash.js';
import { AuthenticateDialog, authenticate, isAuthenticated } from './authenticate.js';
import LoadDialog from './Load.js';
import SaveCmp from './Save.js';

let _writer;
let dialogId;
let renderId;

let _userInfo;
let _repo;
let _path;

let dialogInstance;

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
    ReactDOM.render(
        <GitDialog action="save" />,
        document.querySelector('#'+renderId)
    );
    dialogInstance.setState({show: true});
    $('#'+dialogId).addClass('cwrc');
}

function loadWrap(writer, shouldOverwrite = false) {
    if (_writer === undefined) {
        initDialogs(writer)
    }

    if (_writer.isDocLoaded === false && _repo === undefined && _path === undefined) {
        let docInfo = getDocumentInfoFromLocation();
        if (docInfo !== null) {
            _repo = docInfo.repo;
            _path = docInfo.path;
        }
    }

    ReactDOM.render(
        <GitDialog action="load" />,
        document.querySelector('#'+renderId)
    );
    dialogInstance.setState({show: true, confirmLoad: true});
    $('#'+dialogId).addClass('cwrc');
}

function getUserInfoWrap() {
    return _userInfo;
}

function getDocumentURI() {
    if (_path !== undefined && _repo !== undefined) {
        if (_path.charAt(0) === '/') {
            console.warn('cwrc-git-dialogs: path started with /');
            _path = _path.substring(1);
        }
        return 'https://github.com/'+_repo+'/blob/master/'+_path;
    } else {
        console.warn('cwrc-git-dialogs: no repo or path set!');
        return '';
    }
}

function getDocument() {
    const content = _writer.getDocument(true);
    return content;
}

function getDocumentInfoFromLocation() {
    const doc = queryString.parse(window.location.search);
    if (doc.githubRepo && doc.githubPath) {
        return {repo: doc.githubRepo, path: doc.githubPath};
    } else {
        return null;
    }
}

function setDocumentInfo(repo, path, updateLocation=true) {
    setRepo(repo);
    setPath(path);
    if (updateLocation) {
        const githubDoc = queryString.stringify({githubRepo: _repo, githubPath: _path});
        window.history.replaceState({}, undefined, '?'+githubDoc);
    }
}

function setRepo(repo) {
    _repo = repo;
}

function setPath(path) {
    if (path !== undefined) {
        // path should not start with /
        if (path.charAt(0) === '/') {
            path = path.substring(1);
        }
    }
    _path = path;
}

class GitDialog extends Component {
    constructor(props) {
        super(props);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleConfirmLoad = this.handleConfirmLoad.bind(this);
        this.state = {
            error: undefined,
            show: true,
            splashShown: false,
            confirmLoad: true
        }
    }

    componentDidMount() {
        dialogInstance = this;
    }

    componentWillUnmount() {
        dialogInstance = undefined;
    }

    handleAuthentication(userInfo) {
        _userInfo = userInfo;
        this.forceUpdate();
    }

    handleFileSelect(repo, path) {
		return cwrcGit.getDoc(repo, 'master', path)
			.done((result)=>{
                setDocumentInfo(repo, path);
                this.handleClose();
                setTimeout(()=>{
                    _writer.setDocument(result.doc);
                }, 50)
			}).fail((error)=>{
                setDocumentInfo(undefined, undefined);
                this.setState({error: `There was an error loading the document from: ${repo}${path}`});
			});
    }

    handleFileUpload(doc) {
        setDocumentInfo(undefined, undefined);
        this.handleClose();
        setTimeout(()=>{
            _writer.setDocument(doc);
        }, 50)
    }

    handleClose() {
        this.setState({show: false});
    }

    handleConfirmLoad() {
        this.setState({confirmLoad: false});
    }

    render() {
        const action = this.props.action;
        
        const user = _userInfo;
        const repo = _repo;
        const path = _path;
        const isDocLoaded = _writer.isDocLoaded;

        const show = this.state.show;
        const confirmLoad = this.state.confirmLoad;
        const splashShown = this.state.splashShown;
        const error = this.state.error;

        const hasToken = isAuthenticated();
        
        if (!show) {
            return null;
        }

        if (error !== undefined) {
            return (
                <Modal id={dialogId} show={true} animation={false}>
                    <Modal.Header closeButton={false}>Error</Modal.Header>
                    <Modal.Body>
                        <p>{error}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={()=>{this.setState({error: undefined})}}>Ok</Button>
                    </Modal.Footer>
                </Modal>
            )
        }

        if (user === undefined) {
            if (!splashShown && !hasToken) {
                return (
                    <Modal id={dialogId} show={true} animation={false}>
                        <Splash onContinue={()=>{this.setState({splashShown: true})}}/>
                    </Modal>
                )
            } else {
                return (
                    <Modal id={dialogId} show={true} animation={false}>
                        <AuthenticateDialog onUserAuthentication={this.handleAuthentication} />
                    </Modal>
                )
            }
        } else {
            switch(action) {
                case 'load':
                    if (!isDocLoaded && repo !== undefined && path !== undefined) {
                        return (
                            <Modal id={dialogId} show={true} animation={false}>
                                <Modal.Header closeButton={false}>Load Document from URL</Modal.Header>
                                <Modal.Body>
                                    <p>The following document is specified in the URL:<br/><strong>{repo}/{path}</strong></p>
                                    <p>Would you like to load it?</p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={()=>{setDocumentInfo(undefined, undefined); this.forceUpdate();}}>No, Load a Different Document</Button>
                                    <Button bsStyle="success" onClick={()=>{this.handleFileSelect(repo, path)}}>Yes, Load this Document</Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    }

                    if (isDocLoaded && confirmLoad) {
                        return (
                            <Modal id={dialogId} show={true} animation={false}>
                                <Modal.Header onHide={this.handleClose}>Existing Document</Modal.Header>
                                <Modal.Body>
                                    <p>You have a document loaded in the editor. Would you like to load a new document, and close your existing document?</p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={this.handleClose}>Return to Existing Document</Button>
                                    <Button bsStyle="success" onClick={this.handleConfirmLoad}>Continue to Load New Document</Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    } else {
                        return (
                            <Modal id={dialogId} show={true} bsSize="large" animation={false}>
                                <LoadDialog isDocLoaded={isDocLoaded} user={user} onFileSelect={this.handleFileSelect} onFileUpload={this.handleFileUpload} handleClose={this.handleClose} />
                            </Modal>
                        )
                    }
                case 'save':
                    return (
                        <Modal id={dialogId} show={true} animation={false}>
                            <SaveCmp path={path} repo={repo} handleClose={this.handleClose} getDocument={getDocument} handleRepoChange={setRepo} handlePathChange={setPath} />
                        </Modal>
                    )
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
