import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import {
	Modal,
	Button,
	FormGroup,
	Checkbox,
	ControlLabel,
	FormControl,
	HelpBlock,
} from 'react-bootstrap';

import cwrcGit from '../../GitServerClient';
import ErrorModal from './ErrorModal';
import StatusModal from './StatusModal';

const CreateRepoModal = ({ cancel, complete, owner, ownerType, repo }) => {
	const [error, setError] = useState(null);
	const [isPrivate, setIsPrivate] = useState(false);
	const [processStatus, setProcessStatus] = useState(null);
	const [repoDesc, setRepoDesc] = useState('Created by CWRC');

	const handleDescriptionChange = (e) => setRepoDesc(e.target.value);
	const handlePrivateChange = (e) => setIsPrivate(e.target.checked);

	const displayError = (error) => {
		const errorMsg = typeof error === 'string' ? error : error.statusText;
		setError(errorMsg);
	};

	const createRepo = async () => {
		setProcessStatus('creatingRepo');
		let newRepo;

		if (ownerType === 'User') {
			newRepo = await cwrcGit
				.createRepo({ repo, repoDesc, isPrivate })
				.catch((error) => displayError(error));
		} else if (ownerType === 'Organization') {
			newRepo = await cwrcGit
				.createOrgRepo({ org: owner, repo, repoDesc, isPrivate })
				.catch((error) => displayError(error));
		}
		if (newRepo) complete();
	};

	return (
		<Fragment>
			{error ? (
				<ErrorModal cancel={cancel}>{error}</ErrorModal>
			) : processStatus === 'creatingRepo' ? (
				<StatusModal status="Creating a new repository..." />
			) : (
				<Fragment>
					<Modal.Header>Save to Repository</Modal.Header>
					<Modal.Body>
						<h4>Create Repository</h4>
						<p>This repository does not yet exist, would you like to create it?</p>
						<FormGroup controlId="repoTitle">
							<ControlLabel>Repository</ControlLabel>
							<FormControl type="text" value={repo} disabled />
						</FormGroup>
						<FormGroup controlId="repoDesc">
							<ControlLabel style={{ marginTop: '10px' }}>Description</ControlLabel>
							<FormControl
								type="text"
								placeholder="A short description of your repository."
								value={repoDesc}
								onChange={handleDescriptionChange}
							/>
							<HelpBlock>
								The description will appear in the GitHub page for your new
								repository.
							</HelpBlock>
						</FormGroup>
						<Checkbox checked={isPrivate} onChange={handlePrivateChange}>
							Make Private
						</Checkbox>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={cancel}>Cancel</Button>
						<Button onClick={createRepo} bsStyle="success">
							Create
						</Button>
					</Modal.Footer>
				</Fragment>
			)}
		</Fragment>
	);
};

CreateRepoModal.propTypes = {
	cancel: PropTypes.func,
	complete: PropTypes.func,
	owner: PropTypes.string,
	ownerType: PropTypes.string,
	repo: PropTypes.string,
};

export default CreateRepoModal;
