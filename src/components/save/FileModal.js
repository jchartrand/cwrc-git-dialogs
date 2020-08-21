import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import cwrcGit from '../../GitServerClient';
import ErrorModal from './ErrorModal';
import StatusModal from './StatusModal';

const ConfirmModal = ({ cancel, title, body, ok }) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>{title}</h4>
			<p>{body}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel}>Cancel</Button>
			<Button onClick={ok} bsStyle="success">
				Yes
			</Button>
		</Modal.Footer>
	</Fragment>
);

ConfirmModal.propTypes = {
	cancel: PropTypes.func,
	body: PropTypes.string,
	ok: PropTypes.func,
	title: PropTypes.string,
};

const FileModal = ({
	branch,
	cancelCB,
	commitMessage,
	currentFile,
	fromFork,
	getDocument,
	isGitLab,
	owner,
	path,
	repo,
	savedCB,
	serverURL,
	username,
}) => {
	const [error, setError] = useState(null);
	const [processStatus, setProcessStatus] = useState(null);

	useEffect(() => {
		cwrcGit.setServerURL(serverURL);
		cwrcGit.useGitLab(isGitLab);
		fromFork === 'new' ? save() : checkDocumentExists();
	}, []);

	const resetComponent = () => {
		setError(null);
		setProcessStatus(null);
	};

	const cancel = () => {
		resetComponent();
		cancelCB();
	};

	const complete = () => {
		resetComponent();
		savedCB();
	};

	const displayError = (error) => {
		let errorMsg = typeof error === 'string' ? error : error.statusText;
		setError(errorMsg);
		setProcessStatus('error');
	};

	const isCurrentDocument = () => {
		return (
			`${currentFile.owner}/${currentFile.repo}/${currentFile.path}` ===
			`${owner}/${repo}/${path}`
		);
	};

	const checkDocumentExists = async () => {
		setProcessStatus('checkingFile');

		// if request from fork action, check file on forked repo
		if (fromFork) owner = username;

		const file = await cwrcGit
			.getDoc({
				repoName: `${owner}/${repo}`,
				branch: 'master',
				path,
			})
			.catch((error) => error);

		if (file.status === 404) return setProcessStatus('confirmCreate'); //not found: create new?
		if (file.ok === false) return displayError(error); //error

		if (isCurrentDocument()) return save(); // no meed to prompt the user

		setProcessStatus('confirmOverwrite'); // prompt the user if file already exists
	};

	const save = async () => {
		setProcessStatus('saving');

		const document = await getDocument().catch((error) => {
			console.log(error);
		});

		if (!document) return displayError(error);

		// if request from fork action, check file on forked repo
		if (fromFork) owner = username;

		await cwrcGit
			.saveDoc({
				repo: `${owner}/${repo}`,
				path,
				content: document,
				branch,
				message: commitMessage,
			})
			.catch((error) => {
				if (error.status === 404) {
					error.statusText =
						'You do not have writing permissions for the selected repository. Try saving as a pull request or save to another repository you have writing privileges for.';
				}
				return displayError(error);
			});

		complete();
	};

	return (
		<Fragment>
			{processStatus === 'error' && (
				<ErrorModal cancel={cancel}>
					<h4>An error occurred</h4>
					<p>{error}</p>
				</ErrorModal>
			)}
			{processStatus === 'checkingFile' && <StatusModal status="Checking your file..." />}
			{processStatus === 'saving' && <StatusModal status="Saving your file..." />}
			{processStatus === 'confirmOverwrite' && (
				<ConfirmModal
					title="File Exists"
					body="This file exists - would you like to overwrite it?"
					buttonText="Yes"
					ok={save}
					cancel={cancel}
				/>
			)}
			{processStatus === 'confirmCreate' && (
				<ConfirmModal
					title="Create File"
					body="This file doesn't yet exist, would you like to create it?"
					buttonText="Create"
					ok={save}
					cancel={cancel}
				/>
			)}
		</Fragment>
	);
};

FileModal.propTypes = {
	branch: PropTypes.string,
	cancelCB: PropTypes.func,
	commitMessage: PropTypes.string,
	currentFile: PropTypes.object,
	fromFork: PropTypes.string,
	getDocument: PropTypes.func,
	isGitLab: PropTypes.bool,
	owner: PropTypes.string,
	path: PropTypes.string,
	repo: PropTypes.string,
	savedCB: PropTypes.func,
	serverURL: PropTypes.string,
	username: PropTypes.string,
};

FileModal.defaultProps = {
	branch: 'master',
	commitMessage: 'Saved by CWRC-Writer',
	fromFork: undefined,
	isGitLab: false,
};

export default FileModal;
