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

import cwrcGit from 'cwrc-git-server-client';

import React, {Component, Fragment} from 'react'
import { Modal, Button, Label } from 'react-bootstrap';

const authenticateURL = '/github/authenticate';

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
        this.authClick = this.authClick.bind(this);
        this.doGetUserInfo = this.doGetUserInfo.bind(this);
        this.state = {
            authenticating: false,
            authClicked: false,
            error: undefined,
            user: undefined
        }
    }

    authClick() {
        this.setState({authClicked: true})
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
        if (isAuthenticated() && this.state.user === undefined) {
            this.doGetUserInfo();
        }
    }

    render() {
        const authenticating = this.state.authenticating;
        const error = this.state.error;
        const authClicked = this.state.authClicked;

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
                        <p>You must first authenticate through GitHub to allow CWRC-Writer to make calls on your behalf.</p>
                        <p>CWRC does not keep any of your GitHub information. The GitHub token issued by GitHub is not stored on a CWRC server, but is only submitted as a <a href="https://jwt.io/" rel="noopener noreferrer" target="_blank">JSON Web Token</a> for each request you make.</p>
                        <p>Click below to authenticate with GitHub. A new window will open up to complete the process. Once completed, click below to verify your GitHub token.</p>
                        {error ?
                            <h4><Label bsStyle="danger">There was an error verifying your token. Please make sure you're authenticated and try again.</Label></h4>
                            : ''
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="success" href={authenticateURL} target="githubAuthentication" onClick={this.authClick} disabled={authClicked ? true : false}>
                            Authenticate with GitHub
                        </Button>
                        <Button bsStyle="success" onClick={this.doGetUserInfo} disabled={authClicked ? false : true}>
                            Verify GitHub Token
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
