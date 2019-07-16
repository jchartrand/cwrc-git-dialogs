'use strict';

let Cookies = require('js-cookie');

import React, {Component, Fragment} from 'react'
import { Modal, Button } from 'react-bootstrap';

function doLogOut() {
    Cookies.remove('cwrc-token');
    window.location.reload();
}

class LogOutDialog extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const handleClose = this.props.handleClose;
        return (
            <Fragment>
                <Modal.Header>CWRC-Writer Logout</Modal.Header>
                <Modal.Body>
                    <Fragment>
                        <p>You are about to log out of CWRC-Writer (i.e. revoke the GitHub authentication). Any unsaved changes will be lost.</p>
                        <p>Do you want to continue?</p>
                    </Fragment>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose}>
                        No, Cancel and Return
                    </Button>
                    <Button bsStyle="success" onClick={doLogOut}>
                        Yes, Log Out
                    </Button>
                </Modal.Footer>
            </Fragment>
        )
    }
}

export default LogOutDialog
