'use strict';

let $ = window.cwrcQuery
if ($ === undefined) {
    let prevJQuery = window.jQuery
    $ = require('jquery')
    window.jQuery = $
    require('bootstrap')
    window.jQuery = prevJQuery
    window.cwrcQuery = $
}

let Cookies = require('js-cookie');

import cwrcGit from './GitServerClient.js';

import React, {Component, Fragment} from 'react'
import { Modal, Button, Alert } from 'react-bootstrap';

function isAuthenticated() {
    return Cookies.get('cwrc-token') !== undefined;
}

function getUserInfo() {
    let dfd = $.Deferred();

    cwrcGit.getInfoForAuthenticatedUser()
        .then((info) => {
            let user = {
                userUrl: info.html_url,
                userName: info.name,
                userId: info.login
            }
            console.log('got user info', user);
            dfd.resolve(user);
        }, (error) => {
            console.warn('cwrc-git-dialogs error:', error)
            dfd.reject(error);
        });
    
    return dfd.promise();
}

class AuthenticateDialog extends Component {
    constructor(props) {
        super(props);
        this.doGetUserInfo = this.doGetUserInfo.bind(this);
        this.state = {
            authenticating: false,
            error: undefined,
            user: undefined
        }
    }

    doGetUserInfo() {
        this.setState({authenticating: true});
        getUserInfo()
            .then((user) => {
                this.setState({authenticating: false, error: undefined, user})
                this.props.onUserAuthentication(user);
            }, (error) => {
                this.setState({authenticating: false, error})
            })
    }

    componentDidMount() {
        cwrcGit.setServerURL(this.props.serverURL);
        cwrcGit.useGitLab(this.props.isGitLab);
        if (isAuthenticated() && this.state.user === undefined) {
            this.doGetUserInfo();
        }
    }

    render() {
        const authenticateURL = this.props.serverURL+'/authenticate';
        const authenticating = this.state.authenticating;
        const error = this.state.error;

        if (authenticating) {
            return (
                <Fragment>
                    <Modal.Header>Authenticate with GitHub</Modal.Header>
                    <Modal.Body>
                        <p>Authenticating...</p>
                    </Modal.Body>
                </Fragment>
            )
        } else {
            return (
                <Fragment>
                    <Modal.Header>Authenticate with GitHub</Modal.Header>
                    <Modal.Body>
                        {error ?
                            <Alert bsStyle="danger">
                                An error occurred during authentication. Click below to try authenticating again.
                            </Alert>
                            :
                            <Fragment>
                                <p>You must first authenticate through GitHub to allow CWRC-Writer to make calls on your behalf.</p>
                                <p>CWRC does not keep any of your GitHub information. The GitHub token issued by GitHub is not stored on a CWRC server, but is only submitted as a <a href="https://jwt.io/" rel="noopener noreferrer" target="_blank">JSON Web Token</a> for each request you make.</p>
                                <p>Click below to authenticate with GitHub. Once you've completed the process you will be returned to CWRC-Writer.</p>
                            </Fragment>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="success" href={authenticateURL}>
                            Authenticate with GitHub
                        </Button>
                    </Modal.Footer>
                </Fragment>
            )
        }
    }
}

export {
    AuthenticateDialog,
    isAuthenticated,
    getUserInfo
}
