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

const PathModal = ({
	handleClose,
	handleChange,
	handleSaveFile,
	handleSaveFileAsPR,
	repo,
	path,
	owner,
}) => {
	const [formMessage, setFormMessage] = useState(undefined);

	let ownerInput = null;
	let repoInput = null;
	let pathInput = null;

	const validateControl = (value) => {
		if (value === undefined || value.length === 0) return 'error';
		return null;
	};

	const isFormValid = () => {
		if (
			ownerInput.value !== undefined &&
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
		if (!isFormValid()) return setFormMessage('Form values cannot be blank');
		handleSaveFile();
	};

	// action on button click in form
	const saveFileAsPR = () => {
		handleSaveFileAsPR(isFormValid);
	};

	return (
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
									validationState={validateControl(owner)}
								>
									<ControlLabel>GitHub User/Organization</ControlLabel>
									<FormControl
										type="text"
										value={owner}
										onChange={(e) => {
											setFormMessage(undefined);
											handleChange('owner', e.target.value);
										}}
										inputRef={(ref) => (ownerInput = ref)}
									/>
								</FormGroup>
							</Col>
							<Col sm={6}>
								<FormGroup controlId="repo" validationState={validateControl(repo)}>
									<ControlLabel>Repository Name</ControlLabel>
									<FormControl
										type="text"
										value={repo}
										onChange={(e) => {
											setFormMessage(undefined);
											handleChange('repo', e.target.value);
										}}
										inputRef={(ref) => (repoInput = ref)}
									/>
								</FormGroup>
							</Col>
						</Row>
						<Row>
							<h4>File Path</h4>
							<Col sm={12}>
								<FormGroup controlId="path" validationState={validateControl(path)}>
									<FormControl
										type="text"
										value={path}
										onChange={(e) => {
											setFormMessage(undefined);
											handleChange('path', e.target.value);
										}}
										inputRef={(ref) => (pathInput = ref)}
									/>
									<div style={{ marginTop: '5px', color: '#737373' }}>
										The file (and folder) path to which to save (<i>e.g.</i>, french/basque/SaintSauveur.xml).
									</div>
								</FormGroup>
							</Col>
						</Row>
						{formMessage !== undefined && (
							<Row>
								<Col sm={12}>
									<h4>
										<Label bsStyle="danger">{formMessage}</Label>
									</h4>
								</Col>
							</Row>
						)}
					</Grid>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={handleClose}>Cancel</Button>
				<Button onClick={saveFile} bsStyle="success">
					Save
				</Button>
				<Button onClick={saveFileAsPR} bsStyle="success">
					Save As Pull Request
				</Button>
			</Modal.Footer>
		</Fragment>
	);
};

PathModal.propTypes = {
	handleClose: PropTypes.func,
	handleChange: PropTypes.func,
	handleSaveFile: PropTypes.func,
	handleSaveFileAsPR: PropTypes.func,
	path: PropTypes.string,
	repo: PropTypes.string,
	owner: PropTypes.string,
};

export default PathModal;
