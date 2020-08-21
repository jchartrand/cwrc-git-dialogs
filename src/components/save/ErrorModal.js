import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ErrorModal = ({ cancel, children }) => (
	<Fragment>
		<Modal.Header>An error occurred</Modal.Header>
		<Modal.Body>{children}</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel} bsStyle="success">
				Ok
			</Button>
		</Modal.Footer>
	</Fragment>
);

ErrorModal.propTypes = {
	cancel: PropTypes.func,
	children: PropTypes.any,
};

export default ErrorModal;
