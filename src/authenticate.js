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

function authenticate() {
	if (isAuthenticated()) {
        console.log('already have token')
        return getUserInfo();
	} else {
        return doAuthenticate();
	}
}

function doAuthenticate() {
    let dfd = $.Deferred();

    $.ajax({
        url: authenticateURL,
        dataType: 'jsonp'
    }).always(() => {
        console.log('got token')
        getUserInfo().then((user) => {
            dfd.resolve(user);
        }, (error) => {
            dfd.reject(error);
        })
    })

    return dfd.promise();
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
            console.warn('error getting user info', error)
            var message = (error === 'login') ? "You must first sign in to GitHub." : "Couldn't find anything for that user ID. Please try again."
            dfd.reject(message);
        });
    
    return dfd.promise();
}

class AuthenticateDialog extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            authenticating: false,
            error: undefined,
            user: undefined
        }
    }

    handleClick() {
        this.setState({authenticating: true});
        authenticate()
            .then((user) => {
                this.setState({authenticating: false, error: undefined, user})
                this.props.onUserAuthentication(user);
            }, (error) => {
                this.setState({authenticating: false, error})
            })
    }

    componentDidMount() {
        if (isAuthenticated() && this.state.user === undefined) {
            // trigger the click in order to fetch user info
            this.handleClick();
        }
    }

    render() {
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
                        <p>You must first authenticate through GitHub to allow CWRC-Writer to make calls on your behalf.</p>
                        <p>CWRC does not keep any of your GitHub information. The GitHub token issued by GitHub is not stored on a CWRC server, but is only submitted as a <a href="https://jwt.io/" rel="noopener noreferrer" target="_blank">JSON Web Token</a> for each request you make.</p>
                        {error ? <h4><Label bsStyle="danger">{error}</Label></h4> : ''}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="success" onClick={this.handleClick}>Authenticate with GitHub</Button>
                    </Modal.Footer>
                </Fragment>
            )
        }
    }
}

export {
    AuthenticateDialog,
    isAuthenticated,
    authenticate,
    getUserInfo
}
