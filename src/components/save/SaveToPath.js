import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import cwrcGit from '../../GitServerClient.js';

const ErrorModal = ({ cancel, error }) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>An error occurred</h4>
			<p>{error}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel} bsStyle="success">Ok</Button>
		</Modal.Footer>
	</Fragment>
);

ErrorModal.propTypes = {
	cancel: PropTypes.func,
	error: PropTypes.string,
};

const ConfirmModal = ({ cancel, title, body, ok }) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>{title}</h4>
			<p>{body}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel}>Cancel</Button>
			<Button onClick={ok} bsStyle="success">Yes</Button>
		</Modal.Footer>
	</Fragment>
);

ConfirmModal.propTypes = {
	cancel: PropTypes.func,
	body: PropTypes.string,
	ok: PropTypes.func,
	title: PropTypes.string,
};

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

const SaveToPath = ({
	cancelCB,
	getDocument,
	isGitLab,
	owner,
	path,
	repo,
	savedCB,
	serverURL,
	usePR,
}) => {
	const [branch, setBranch] = useState('master');
	const [commitMessage, setCommitMessage] = useState('Saved by CWRC-Writer');
	const [error, setError] = useState(null);
	const [processStatus, setProcessStatus] = useState(null);
	const [prBranch, setPrBranch] = useState('cwrc-writer-pr');
	const [prTitle, setPrTitle] = useState('Request made from CWRC-Writer');

	const resetComponent = () => {
		setProcessStatus(null);
		setError(null);
		setBranch('master');
		setCommitMessage('Saved by CWRC-Writer');
		setPrTitle('Request made from CWRC-Writer');
		setPrBranch('cwrc-writer-pr');
	};

	useEffect(() => {
		cwrcGit.setServerURL(serverURL);
		cwrcGit.useGitLab(isGitLab);
		(usePR) ? save() : checkDocumentExists();
	}, []);


	const getFullRepoPath = () => (`${owner}/${repo}`);

	const complete = () => {
		resetComponent();
		savedCB();
	};

	const cancel = () => {
		resetComponent();
		cancelCB();
	};

	const displayError = (error) => {
		let errorMsg = typeof error === 'string' ? error : error.statusText;
		setError(errorMsg);
		setProcessStatus('error');
	};

	const checkDocumentExists = async () => {
		setProcessStatus('checking');

		const file = await cwrcGit.getDoc(getFullRepoPath(), 'master', path).catch((error) => error);

		if (file.status === 404) return setProcessStatus('confirmCreate'); //not found: create new?
		if (file.ok === false) return displayError(error); //error

		return setProcessStatus('confirmOverwrite'); //exists: overwrite?
	};

	const save = async () => {
		setProcessStatus('saving');

		const document = await getDocument().catch((error) => {
			console.log(error);
		});

		if (!document) return displayError(error);

		if (usePR) {
			await cwrcGit.saveAsPullRequest(
				getFullRepoPath(),
				path,
				document,
				prBranch,
				commitMessage,
				prTitle
			).catch((error) => {
				if (error.status === 500) {
					error.statusText = 'You do not have pull request permissions for the selected repository. Try saving to another repository you have pull request privileges for.';
				}
				return displayError(error);
			});

			complete();

		} else {
			await cwrcGit.saveDoc(
				getFullRepoPath(),
				path,
				document,
				branch,
				commitMessage
			).catch((error) => {
				if (error.status === 404) {
					error.statusText = 'You do not have writing permissions for the selected repository. Try saving as a pull request or save to another repository you have writing privileges for.';
				}
				return displayError(error);
			});

			complete();
		}
	};

	return (
		<Fragment>
			{processStatus === 'error' && <ErrorModal error={error} cancel={cancel} />}
			{processStatus === 'saving' && <StatusModal status="Saving your file..." />}
			{processStatus === 'checking' && <StatusModal status="Checking your file..." />}
			{processStatus === 'confirmOverwrite' &&
				<ConfirmModal
					title="File Exists"
					body="This file exists - would you like to overwrite it?"
					buttonText="Yes"
					ok={save}
					cancel={cancel}
				/>
			}
			{processStatus === 'confirmCreate' &&
				<ConfirmModal
					title="Create File"
					body="This file doesn't yet exist, would you like to create it?"
					buttonText="Create"
					ok={save}
					cancel={cancel}
				/>
			}
		</Fragment>
	);
};

SaveToPath.propTypes = {
	cancelCB: PropTypes.func,
	getDocument: PropTypes.func,
	isGitLab: PropTypes.bool,
	owner: PropTypes.string,
	path: PropTypes.string,
	repo: PropTypes.string,
	savedCB: PropTypes.func,
	serverURL: PropTypes.string,
	usePR: PropTypes.bool,
};

export default SaveToPath;
