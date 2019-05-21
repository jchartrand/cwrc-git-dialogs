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

import React, {Component} from 'react'
import ReactDOM from 'react-dom';
import { Modal, Button, Form, HelpBlock, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';

import VerifyRepo from './VerifyRepo.js'
import SaveToPath from './SaveToPath.js'

let writer;
let state;

const SavedDialog = ({closedCB})=> (
	<Modal show={true}>
		<Modal.Header>Saved</Modal.Header>
		<Modal.Body>Your document has been saved.</Modal.Body>
		<Modal.Footer>
			<Button onClick={closedCB} bsStyle="success">
				OK
			</Button>
		</Modal.Footer>
	</Modal>
)
const SaveForm = ({handleRepoChangeCB, handlePathChangeCB, saveFileCB, saveFileAsPullRequestCB, cancelCB, repo, path}) => (
	<Modal
		show={true}>
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
			<Button onClick={cancelCB} bsStyle="danger">
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
	</Modal>

)
class SaveCmp extends Component {

	resetState() {
		this.setState({
			repo: this.props.repo,
			path: this.props.path,
			usePR: false,
			submitted: false,
			repoVerified: false,
			message: 'file commit or pr message',
			closed: false,
			saved: false
		})
	}
	componentWillMount() {
		this.resetState()
	}

	// handles changes passed up from the form
	handleChange(name,e) {
		this.setState({[name]: e.target.value});
		console.log(name, e.target.value);
		if (state.hasOwnProperty(name)) {
			state[name] = e.target.value;
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

	// action on button click in form
	close() {
		this.setState({closed: true})
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
		const {repo, path, user, usePR, message, submitted, repoVerified, closed, saved} = this.state
		if (closed) {
			return null
		} else if (saved) {
			return (
				<SavedDialog closedCB={this.close.bind(this)}/>
			)
		}   else if (!submitted) {
			return (
				<SaveForm
					handleRepoChangeCB={this.handleChange.bind(this, 'repo')}
					handlePathChangeCB={this.handleChange.bind(this, 'path')}
					repo={repo}
					path={path}
					saveFileCB={this.saveFile.bind(this)}
					saveFileAsPullRequestCB={this.saveFileAsPR.bind(this)}
					cancelCB={this.close.bind(this)}
				/>
			)
		} else if (submitted && ! repoVerified) {
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
					content={this.props.content}
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

async function save(_writer, _state) {
	if (writer === undefined && state === undefined) {
		writer = _writer;
		state = _state;
	}

	if ($('#file-save').length == 0) {
		$(writer.dialogManager.getDialogWrapper()).append('<div id="file-save"/>')
	}
	const repo = state.repo;
	const path = state.path ? state.path.replace(/^\/+/g, '') : ''
	const user = state.userId;

	// TODO get content after path and repo have been set
	const content = writer.converter.getDocumentContent(true);

	const component = ReactDOM.render(
		<SaveCmp
			repo={repo}
			path={path}
			user={user}
			content={content}/>,
		document.getElementById('file-save'))
	component.resetState()
	//document.getElementById(targetElement)
}

export default save
