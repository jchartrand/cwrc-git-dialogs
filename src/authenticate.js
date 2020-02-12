/* eslint-disable react/no-unescaped-entities */
import Cookies from 'js-cookie';
import cwrcGit from './GitServerClient.js';
import PropTypes from 'prop-types';
import React, {Component, Fragment} from 'react'
import { Modal, Button, Alert } from 'react-bootstrap';


export const isAuthenticated = () => {
    return Cookies.get('cwrc-token') !== undefined;
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

    async doGetUserInfo() {
        this.setState({authenticating: true});

        const response = await cwrcGit.getInfoForAuthenticatedUser()
            .catch( (error) => {
                this.setState({authenticating: false, error})
            });

        const user = {
            userUrl: response.html_url,
            userName: response.name,
            userId: response.login
        }
        
        this.setState({authenticating: false, error: undefined, user})
        this.props.onUserAuthentication(user);
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

AuthenticateDialog.propTypes = {
    serverURL: PropTypes.string,
    isGitLab: PropTypes.bool,
    onUserAuthentication: PropTypes.func,
};

export {
    AuthenticateDialog
}
