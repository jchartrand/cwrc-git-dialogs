/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types';
import React, {Fragment, useEffect, useState } from 'react';
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

const ErrorModal = ({cancel, error}) => (
	<Fragment>
		<Modal.Header>An error occurred</Modal.Header>
		<Modal.Body>
			<p>{error}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel} bsStyle="success">
				Ok
			</Button>
		</Modal.Footer>
	</Fragment>
);

ErrorModal.propTypes = {
	cancel: PropTypes.func,
	error: PropTypes.string,
};

const CreateModal = ({
	cancel,
	ok,
	repoDesc,
	isPrivate,
	handlePrivateChange,
	handleDescriptionChange,
}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>Create Repository</h4>
			<p>This repository doesn't yet exist, would you like to create it?</p>
			<FormGroup controlId="repoDesc">
				<ControlLabel>Description</ControlLabel>
				<FormControl
					type="text"
					placeholder="A short description of your repository."
					value={repoDesc}
					onChange={handleDescriptionChange}
				/>
				<HelpBlock>
					The description will appear in the GitHub page for your new repository.
				</HelpBlock>
			</FormGroup>
			<Checkbox checked={isPrivate} onChange={handlePrivateChange}>
				Make Private
			</Checkbox>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel}>Cancel</Button>
			<Button onClick={ok} bsStyle="success">Create</Button>
		</Modal.Footer>
	</Fragment>
);

CreateModal.propTypes = {
	cancel: PropTypes.func,
	ok: PropTypes.func,
	handleDescriptionChange: PropTypes.func,
	handlePrivateChange: PropTypes.func,
	isPrivate: PropTypes.bool,
	repoDesc: PropTypes.string,
};

const CheckingModal = ({body}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<p>{body}</p>
		</Modal.Body>
	</Fragment>
);

CheckingModal.propTypes = {
	body: PropTypes.string,
};

const VerifyRepo = ({
	cancelCB,
	isGitLab,
	owner,
	repo,
	serverURL,
	usePR,
	user,
	verifiedCB
}) => {

	const [doesRepoExist, setDoesRepoExist] = useState(null);
	const [doesUserHavePermission, setDoesUserHavePermission] = useState(null);
	const [error, setError] = useState(null);
	const [isOwnerUser, setIsOwnerUser] = useState(null);
	const [isPrivate, setIsPrivate] = useState(false);
	const [processStatus, setProcessStatus] = useState(null);
	const [repoDesc, setRepoDesc] = useState('Automagically created by CWRC');


	const resetComponent = () => {
		setDoesRepoExist(null);
		setDoesUserHavePermission(null);
		setError(null);
		setIsOwnerUser(null);
		setIsPrivate(false);
		setProcessStatus(null);
		setRepoDesc('Automagically created by CWRC');
	};

	useEffect(() => {
		cwrcGit.setServerURL(serverURL);
		cwrcGit.useGitLab(isGitLab);
		isOwnerUserOrOrg();
	}, []);

	const isOwnerUserOrOrg = async () => {
		setProcessStatus('checkingOwner');

		const results = await cwrcGit.getDetailsForGithubUser(owner).catch((error) => {
			console.log(error);
		});

		if (!results) return displayError(`The repository owner "${owner}" does not exist.`);

		setIsOwnerUser(results.data.type === 'User');
		checkRepoExistence();
	};

	const checkRepoExistence = async () => {
		setProcessStatus('checkingRepoExistence');

		const results = await cwrcGit.getRepoContents(getFullRepoPath()).catch((error) => {
			return setDoesRepoExist(false);
		});

		if (!results) {
			setDoesRepoExist(false);
			checkPermission();
			return;
		}

		setDoesRepoExist(true);

		(usePR !== true) ? checkPermission() : complete();
	};

	const checkPermission = async () => {
		setProcessStatus('checkingPermission');

		const results = await cwrcGit.getPermissionsForGithubUser(owner, repo, user).catch((error)=>{
			console.log(error);
		});

		if (!results) return setDoesUserHavePermission(false);

		if (results === 'none' || results === 'read') {
			setDoesUserHavePermission(false);
			setProcessStatus('done');
			return;
		}

		complete();
	};

	const getFullRepoPath = () => (`${owner}/${repo}`);

	const complete = () => {
		setProcessStatus('done');
		resetComponent();
		verifiedCB();
	};

	const cancel = () => {
		resetComponent();
		cancelCB();
	};

	const displayError = (error) => {
		const errorMsg = (typeof error === 'string') ? error : error.statusText;
		setError(errorMsg);
		setProcessStatus('error');
	};

	const createRepo = async () => {
		setProcessStatus('creatingRepo');
		let newRepo;
		if (isOwnerUser) {
			newRepo = await cwrcGit.createRepo(repo, repoDesc, isPrivate).catch((error) => {
				displayError(error);
			});
		} else {
			newRepo = await cwrcGit.createOrgRepo(owner, repo, repoDesc, isPrivate).catch((error) => {
				displayError(error);
			});
		}
		if (newRepo) complete();
	};

	// handles changes passed up from children
	const handleDescriptionChange = (e) => setRepoDesc(e.target.value);
	const handlePrivateChange = (e) => setIsPrivate(e.target.checked);

	return (
		<Fragment>
			{processStatus === 'error' && <ErrorModal error={error} cancel={cancel} />}
			{processStatus === 'checkingOwner' && <CheckingModal body="Checking the repository owner..." />}
			{processStatus === 'checkingRepoExistence' && <CheckingModal body="Checking the respository..." />}
			{processStatus === 'checkingPermission' && <CheckingModal body="Checking your permissions..." />}
			{processStatus === 'creatingRepo' && <CheckingModal body="Creating a new repository..." />}
			{processStatus === 'done' && doesRepoExist && !doesUserHavePermission &&
				<ErrorModal
					error="You do not have permission to use this repository. Try saving as a pull request or save to another repository you have writing privileges for."
					cancel={cancel}
				/>
			}
			{processStatus === 'done' && !doesRepoExist && !doesUserHavePermission && owner !== user &&
				<ErrorModal
					error="You cannot create a repository for another user's account."
					cancel={cancel}
				/>
			}
			{processStatus === 'done' && !doesRepoExist && isOwnerUser && owner === user &&
				<CreateModal
					cancel={cancel}
					handleDescriptionChange={handleDescriptionChange}
					handlePrivateChange={handlePrivateChange}
					isPrivate={isPrivate}
					ok={createRepo}
					repoDesc={repoDesc}
				/>
			}
		</Fragment>
	);

};

VerifyRepo.propTypes = {
	cancelCB: PropTypes.func,
	isGitLab: PropTypes.bool,
	owner: PropTypes.string,
	path: PropTypes.string,
	repo: PropTypes.string,
	serverURL: PropTypes.string,
	usePR: PropTypes.bool,
	user: PropTypes.string,
	verifiedCB: PropTypes.func
};


export default VerifyRepo;
