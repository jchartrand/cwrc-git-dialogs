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
import { Modal, Button, Form, HelpBlock, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';

import VerifyRepo from './VerifyRepo.js'
import SaveToPath from './SaveToPath.js'

const SavedDialog = ({closedCB}) => {
	return (
		<Fragment>
			<Modal.Header>Document Saved</Modal.Header>
			<Modal.Body>Your document has been saved.</Modal.Body>
			<Modal.Footer>
				<Button onClick={closedCB} bsStyle="success">Ok</Button>
			</Modal.Footer>
		</Fragment>
	)
}

const SaveForm = ({handleRepoChangeCB, handlePathChangeCB, saveFileCB, saveFileAsPullRequestCB, cancelCB, repo, path}) => {
	return (
		<Fragment>
			<Modal.Header>Save to Repository</Modal.Header>
			<Modal.Body>
				<Form>
					<FormGroup controlId="repo" validationState={null}>
						<ControlLabel>Repository Path</ControlLabel>
						<FormControl
							type="text"
							value={repo}
							onChange={handleRepoChangeCB}/>
						<HelpBlock>[GitHub-user-ID]/[GitHub-repository] (e.g., jchartrand/cheeses)</HelpBlock>
					</FormGroup>
					<FormGroup controlId="path" validationState={null}>
						<ControlLabel>File Path</ControlLabel>
						<FormControl
							type="text"
							value={path}
							onChange={handlePathChangeCB} />
						<HelpBlock>The repository path to which to save (e.g., french/basque/SaintSauveur.xml)</HelpBlock>
					</FormGroup>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={cancelCB}>
					Cancel
				</Button>
				<Button
					onClick={saveFileCB}
					bsStyle="success"
				>Save</Button>
				<Button
					onClick={saveFileAsPullRequestCB}
					bsStyle="success"
				>Save As Pull Request</Button>
			</Modal.Footer>
		</Fragment>
	)
}

class SaveCmp extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		this.resetState();
	}

	resetState() {
		this.setState({
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
		this.setState({saved: true})
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
		const {repo, path, usePR, message, submitted, repoVerified, saved} = this.state;
		const handleClose = this.props.handleClose;
		const handleRepoChange = this.props.handleRepoChange;
		const handlePathChange = this.props.handlePathChange;
		const getDocument = this.props.getDocument;
		if (saved) {
			return (
				<SavedDialog closedCB={handleClose}/>
			)
		} else if (!submitted) {
			return (
				<SaveForm
					handleRepoChangeCB={(e)=>{let val = e.target.value; this.handleChange('repo', val); handleRepoChange(val);}}
					handlePathChangeCB={(e)=>{let val = e.target.value; this.handleChange('path', val); handlePathChange(val);}}
					repo={repo}
					path={path}
					saveFileCB={this.saveFile.bind(this)}
					saveFileAsPullRequestCB={this.saveFileAsPR.bind(this)}
					cancelCB={handleClose}
				/>
			)
		} else if (submitted && !repoVerified) {
			return (
				<VerifyRepo
					repo={repo}
					path={path}
					verifiedCB={this.repoVerified.bind(this)}
					cancelCB={this.repoOrPathCancelled.bind(this)}
				/>
			)
		} else if (submitted) {
			return (
				<SaveToPath
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
