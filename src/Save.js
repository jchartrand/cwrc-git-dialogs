'use strict';

let $ = window.cwrcQuery
if ($ === undefined) {
	let prevJQuery = window.jQuery
	$ = require('jquery')
	window.jQuery = $
	require('bootstrap')
	window.jQuery = prevJQuery
	window.cwrcQuery = $
}

import React, {Fragment, Component} from 'react'
import { Modal, Grid, Row, Col, Button, Form, HelpBlock, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';

import VerifyRepo from './VerifyRepo.js'
import SaveToPath from './SaveToPath.js'

class SaveCmp extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.saveFile = this.saveFile.bind(this);
		this.saveFileAsPR = this.saveFileAsPR.bind(this);
	}

	componentWillMount() {
		this.resetState();
	}

	resetState() {
		this.setState({
			owner: this.props.owner,
			repo: this.props.repo,
			path: this.props.path,
			usePR: false,
			submitted: false,
			repoVerified: false,
			message: 'file commit or pr message',
			saved: false
		})
	}

	// handles changes passed up from the form
	handleChange(name, value) {
		this.setState({[name]: value});
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

	// action on button click in form
	saveFile() {
		this.setState({submitted:true, usePR: false})
	}

	// action on button click in form
	saveFileAsPR() {
		this.setState({submitted: true, usePR: true})
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
		const {owner, repo, path, usePR, message, submitted, repoVerified, saved} = this.state;
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
										<FormGroup controlId="owner" validationState={null}>
											<ControlLabel>GitHub User</ControlLabel>
											<FormControl
												type="text"
												value={owner}
												onChange={(e)=>{this.handleChange('owner', e.target.value)}}/>
										</FormGroup>
									</Col>
									<Col sm={6}>
										<FormGroup controlId="repo" validationState={null}>
											<ControlLabel>Repository Name</ControlLabel>
											<FormControl
												type="text"
												value={repo}
												onChange={(e)=>{this.handleChange('repo', e.target.value)}}/>
										</FormGroup>
									</Col>
								</Row>
								<Row>
									<h4>File Path</h4>
									<Col sm={12}>
										<FormGroup controlId="path" validationState={null}>
											<FormControl
												type="text"
												value={path}
												onChange={(e)=>{this.handleChange('path', e.target.value)}}/>
											<HelpBlock>The file (and folder) path to which to save (e.g., french/basque/SaintSauveur.xml)</HelpBlock>
										</FormGroup>
									</Col>
								</Row>
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
					owner={owner}
					repo={repo}
					path={path}
					getDocument={getDocument}
					message={message}
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
