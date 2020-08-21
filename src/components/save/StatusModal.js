import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Modal } from 'react-bootstrap';

const StatusModal = ({ status }) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<p>{status}</p>
		</Modal.Body>
	</Fragment>
);

StatusModal.propTypes = {
	status: PropTypes.string,
};

export default StatusModal;
