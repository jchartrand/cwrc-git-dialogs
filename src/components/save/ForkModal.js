/* eslint-disable quotes */
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

import ErrorModal from './ErrorModal';
import cwrcGit from '../../GitServerClient';
import StatusModal from './StatusModal';

const ForkModal = ({ cancel, complete, doesUserHavePermission, owner, repo, username }) => {
	const [error, setError] = useState(null);
	const [processStatus, setProcessStatus] = useState(null);

	const displayError = (error) => {
		setProcessStatus(null);
		const errorMsg = typeof error === 'string' ? error : error.statusText;
		setError(errorMsg);
	};

	const handleFork = async () => {
		setProcessStatus('forking');

		//check if repo is already forked
		let forkedRepo = await cwrcGit
			.getRepoContents(`${username}/${repo}`)
			.catch(() => null);

		// fork repo if it doesn't exist
		if (!forkedRepo) {
			// create fork
			forkedRepo = await cwrcGit
				.createFork({ owner, repo })
				.catch((error) => displayError(error));

			if (!forkedRepo) return;

			complete({ action: 'save', fromFork: 'new' });
			return;
		}

		// use already forked repo
		complete({ action: 'save', fromFork: 'existed' });
	};

	//no fork
	const handlePR = () => {
		complete({ action: 'pr' });
	};

	return (
		<Fragment>
			{error ? (
				<ErrorModal cancel={cancel}>{error}</ErrorModal>
			) : processStatus === 'forking' ? (
				<StatusModal status="Forking repository..." />
			) : (
				<Fragment>
					<Modal.Header>Save to Repository</Modal.Header>
					<Modal.Body>
						<h4>Fork and Pull Request Repository</h4>
						{doesUserHavePermission
							? "You do have permission to create a Pull Request, but you do not own this repository. If you would like a copy of this repository's content, fork it and create a Pull Request of your chages to the original repository"
							: `You do not have permission to use this repository: "${repo}". Try saving to another repository or fork the repository to make a pull request.`}
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={cancel}>Cancel</Button>
						{doesUserHavePermission && owner !== username && (
							<Button onClick={handlePR} bsStyle="success">
								Pull Request
							</Button>
						)}
						<Button onClick={handleFork} bsStyle="success">
							Fork and Pull Request
						</Button>
					</Modal.Footer>
				</Fragment>
			)}
		</Fragment>
	);
};

ForkModal.propTypes = {
	cancel: PropTypes.func,
	complete: PropTypes.func,
	doesUserHavePermission: PropTypes.bool,
	owner: PropTypes.string,
	repo: PropTypes.string,
	username: PropTypes.string,
};

ForkModal.defaultProps = {
	showPROption: false,
};

export default ForkModal;
