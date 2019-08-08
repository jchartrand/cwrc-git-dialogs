'use strict';

import React, {Fragment, Component} from 'react'
import { Modal, Grid, Row, Col, Button, Label, Form, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';

import VerifyRepo from './VerifyRepo.js'
import SaveToPath from './SaveToPath.js'

class SaveCmp extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.validateControl = this.validateControl.bind(this);
		this.isFormValid = this.isFormValid.bind(this);
		this.saveFile = this.saveFile.bind(this);
		this.saveFileAsPR = this.saveFileAsPR.bind(this);

		this.ownerInput = null;
		this.repoInput = null;
		this.pathInput = null;

		this.state = {
			owner: this.props.owner,
			repo: this.props.repo,
			path: this.props.path,
			usePR: false,
			submitted: false,
			repoVerified: false,
			formMessage: undefined,
			saved: false
		}
	}

	// handles changes passed up from the form
	handleChange(name, value) {
		this.setState({[name]: value, formMessage: undefined});
		switch(name) {
			case 'path':
				this.props.handlePathChange(value);
				break;
			case 'owner':
				this.props.handleRepoChange(value+'/'+this.state.repo);
				break;
			case 'repo':
				this.props.handleRepoChange(this.state.owner+'/'+value);
				break;
		}
	}

	validateControl(value) {
		if (value === undefined || value.length === 0) {
			return 'error';
		}
		return null;
	}

	isFormValid() {
		if (
			this.ownerInput.value !== undefined && this.ownerInput.value !== '' &&
			this.repoInput.value !== undefined && this.repoInput.value !== '' &&
			this.pathInput.value !== undefined && this.pathInput.value !== ''
		) {
			return true;
		}
		return false;
	}

	// action on button click in form
	saveFile() {
		if (this.isFormValid()) {
			this.setState({submitted:true, usePR: false})
		} else {
			this.setState({formMessage: 'Form values cannot be blank'});
		}
	}

	// action on button click in form
	saveFileAsPR() {
		if (this.isFormValid()) {
			this.setState({submitted: true, usePR: true})
		} else {
			this.setState({formMessage: 'Form values cannot be blank'});
		}
	}

	saved() {
		this.props.handleSaved(this.state.owner+'/'+this.state.repo, this.state.path);
		this.setState({saved: true});
	}

	// callback passed to VerifyRepo
	repoVerified() {
		this.setState({repoVerified:true})
	}

	// callback passed to VerifyRepo and SaveToPath
	repoOrPathCancelled() {
		this.setState({repoVerified: false, submitted:false})
	}

	render() {
		const {owner, repo, path, usePR, formMessage, submitted, repoVerified, saved} = this.state;
		const user = this.props.user;
		const handleClose = this.props.handleClose;
		const getDocument = this.props.getDocument;
		if (saved) {
			return (
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
			)
		} else if (!submitted) {
			return (
				<Fragment>
					<Modal.Header>Save to Repository</Modal.Header>
					<Modal.Body>
						<Form>
							<Grid fluid>
								<Row>
									<h4>Repository Path</h4>
									<Col sm={6}>
										<FormGroup controlId="owner" validationState={this.validateControl(this.state.owner)}>
											<ControlLabel>GitHub User/Organization</ControlLabel>
											<FormControl
												type="text"
												value={owner}
												onChange={(e)=>{this.handleChange('owner', e.target.value)}}
												inputRef={(ref)=>{this.ownerInput = ref;}}/>
										</FormGroup>
									</Col>
									<Col sm={6}>
										<FormGroup controlId="repo" validationState={this.validateControl(this.state.repo)}>
											<ControlLabel>Repository Name</ControlLabel>
											<FormControl
												type="text"
												value={repo}
												onChange={(e)=>{this.handleChange('repo', e.target.value)}}
												inputRef={(ref)=>{this.repoInput = ref;}}/>
										</FormGroup>
									</Col>
								</Row>
								<Row>
									<h4>File Path</h4>
									<Col sm={12}>
										<FormGroup controlId="path" validationState={this.validateControl(this.state.path)}>
											<FormControl
												type="text"
												value={path}
												onChange={(e)=>{this.handleChange('path', e.target.value)}}
												inputRef={(ref)=>{this.pathInput = ref;}}/>
											<div style={{marginTop: '5px', color: '#737373'}}>The file (and folder) path to which to save (e.g., french/basque/SaintSauveur.xml)</div>
										</FormGroup>
									</Col>
								</Row>
								{(formMessage !== undefined ?
									<Row><Col sm={12}><h4><Label bsStyle="danger">{formMessage}</Label></h4></Col></Row> :
									''
								)}
							</Grid>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={handleClose}>Cancel</Button>
						<Button onClick={this.saveFile} bsStyle="success">Save</Button>
						<Button onClick={this.saveFileAsPR} bsStyle="success">Save As Pull Request</Button>
					</Modal.Footer>
				</Fragment>
			)
		} else if (submitted && !repoVerified) {
			return (
				<VerifyRepo
					serverURL={this.props.serverURL}
					isGitLab={this.props.isGitLab}
					user={user}
					owner={owner}
					repo={repo}
					path={path}
					usePR={usePR}
					verifiedCB={this.repoVerified.bind(this)}
					cancelCB={this.repoOrPathCancelled.bind(this)}
				/>
			)
		} else if (submitted) {
			return (
				<SaveToPath
					serverURL={this.props.serverURL}
					isGitLab={this.props.isGitLab}
					owner={owner}
					repo={repo}
					path={path}
					getDocument={getDocument}
					usePR={usePR}
					savedCB={this.saved.bind(this)}
					cancelCB={this.repoOrPathCancelled.bind(this)}
				/>
			)
		} else {
			return null
		}
	}
}

export default SaveCmp
