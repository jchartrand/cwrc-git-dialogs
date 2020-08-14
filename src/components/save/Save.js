import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import {
	Button,
	Col,
	ControlLabel,
	Form,
	FormControl,
	FormGroup,
	Grid,
	Label,
	Modal,
	Row,
} from 'react-bootstrap';

import SaveToPath from './SaveToPath';
import VerifyRepo from './VerifyRepo';

const SaveCmp = ({
	handleClose,
	getDocument,
	handlePathChange,
	handleRepoChange,
	handleSaved,
	isGitLab,
	owner,
	path,
	repo,
	serverURL,
	user
}) => {

	let ownerInput = null;
	let repoInput = null;
	let pathInput = null;

	const [ownerState, setOwnerState] = useState(owner);
	const [repoState, setRepoState] = useState(repo);
	const [pathState, setPathState] = useState(path);
	const [usePR, setUsePR] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [isRepoVerified, setIsRepoVerified] = useState(false);
	const [formMessage, setFormMessage] = useState(undefined);
	const [isSaved, setIsSaved] = useState(false);

	// handles changes passed up from the form
	const handleChange = (name, value) => {
		setFormMessage(undefined);

		switch (name) {
		case 'path':
			setPathState(value);
			handlePathChange(value);
			break;
		case 'owner':
			setOwnerState(value);
			handleRepoChange(`${value}/${repoState}`);
			break;
		case 'repo':
			setRepoState(value);
			handleRepoChange(`${ownerState}/${value}`);
			break;
		}
	};

	const validateControl = (value) => {
		if (value === undefined || value.length === 0) return 'error';
		return null;
	};

	const isFormValid = () => {
		if (ownerInput.value !== undefined &&
			ownerInput.value !== '' &&
			repoInput.value !== undefined &&
			repoInput.value !== '' &&
			pathInput.value !== undefined &&
			pathInput.value !== ''
		) {
			return true;
		}
		return false;
	};

	// action on button click in form
	const saveFile = () => {
		if (isFormValid()) {
			setSubmitted(true);
			setUsePR(false);
		} else {
			setFormMessage('Form values cannot be blank');
		}
	};

	// action on button click in form
	const saveFileAsPR = () => {
		if (isFormValid()) {
			setSubmitted(true);
			setUsePR(true);
		} else {
			setFormMessage('Form values cannot be blank');
		}
	};

	const saved = () => {
		handleSaved(`${ownerState}/${repoState}`, pathState);
		setIsSaved(true);
	};

	// callback passed to VerifyRepo
	const repoVerified = () => setIsRepoVerified(true);

	// callback passed to VerifyRepo and SaveToPath
	const repoOrPathCancelled = () => {
		setIsRepoVerified(false);
		setSubmitted(false);
	};

	return (
		<Fragment>
			{isSaved &&
				<Fragment>
					<Modal.Header>Save to Repository</Modal.Header>
					<Modal.Body>
						<h4>Document Saved</h4>
						<p>Your document has been saved.</p>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={handleClose} bsStyle="success">Ok</Button>
					</Modal.Footer>
				</Fragment>
			}
			{!submitted &&
				<Fragment>
					<Modal.Header>Save to Repository</Modal.Header>
					<Modal.Body>
						<Form>
							<Grid fluid>
								<Row>
									<h4>Repository Path</h4>
									<Col sm={6}>
										<FormGroup
											controlId="owner"
											validationState={validateControl(ownerState)}
										>
											<ControlLabel>GitHub User/Organization</ControlLabel>
											<FormControl
												type="text"
												value={ownerState}
												onChange={(e) => handleChange('owner', e.target.value)}
												inputRef={(ref) => ownerInput = ref}
											/>
										</FormGroup>
									</Col>
									<Col sm={6}>
										<FormGroup
											controlId="repo"
											validationState={validateControl(repoState)}
										>
											<ControlLabel>Repository Name</ControlLabel>
											<FormControl
												type="text"
												value={repoState}
												onChange={(e) => handleChange('repo', e.target.value)}
												inputRef={(ref) => repoInput = ref}
											/>
										</FormGroup>
									</Col>
								</Row>
								<Row>
									<h4>File Path</h4>
									<Col sm={12}>
										<FormGroup
											controlId="path"
											validationState={validateControl(pathState)}
										>
											<FormControl
												type="text"
												value={pathState}
												onChange={(e) => handleChange('path', e.target.value)}
												inputRef={(ref) => pathInput = ref}
											/>
											<div style={{ marginTop: '5px', color: '#737373' }}>
												The file (and folder) path to which to save (e.g.,
												french/basque/SaintSauveur.xml)
											</div>
										</FormGroup>
									</Col>
								</Row>
								{formMessage !== undefined ? (
									<Row>
										<Col sm={12}>
											<h4>
												<Label bsStyle="danger">{formMessage}</Label>
											</h4>
										</Col>
									</Row>
								) : (
									''
								)}
							</Grid>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={handleClose}>Cancel</Button>
						<Button onClick={saveFile} bsStyle="success">Save</Button>
						<Button onClick={saveFileAsPR} bsStyle="success">Save As Pull Request</Button>
					</Modal.Footer>
				</Fragment>
			}
			{submitted && !isRepoVerified &&
				<VerifyRepo
					serverURL={serverURL}
					isGitLab={isGitLab}
					user={user}
					owner={ownerState}
					repo={repoState}
					path={pathState}
					usePR={usePR}
					verifiedCB={repoVerified}
					cancelCB={repoOrPathCancelled}
				/>
			}
			{submitted && isRepoVerified &&
				<SaveToPath
					serverURL={serverURL}
					isGitLab={isGitLab}
					owner={ownerState}
					repo={repoState}
					path={pathState}
					getDocument={getDocument}
					usePR={usePR}
					savedCB={saved}
					cancelCB={repoOrPathCancelled}
				/>
			}
		</Fragment>
	);

};

SaveCmp.propTypes = {
	handleClose: PropTypes.func,
	getDocument: PropTypes.func,
	handlePathChange: PropTypes.func,
	handleRepoChange: PropTypes.func,
	handleSaved: PropTypes.func,
	isGitLab: PropTypes.bool,
	owner: PropTypes.string,
	path: PropTypes.string,
	repo: PropTypes.string,
	serverURL: PropTypes.string,
	user: PropTypes.string,
};

export default SaveCmp;
