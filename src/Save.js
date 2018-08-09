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
import authenticate from "./authenticate";

const SaveForm = ({handleRepoChangeCB, handlePathChangeCB, saveFileCB, saveFileAsPullRequestCB, cancelCB, repo, path}) => (
	<Modal
		show={true}>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<Form>
				<FormGroup controlId="repo" validationState={null}>
					<ControlLabel>Repository Name</ControlLabel>
					<FormControl
						type="text"
						value={repo}
						onChange={handleRepoChangeCB}/>
					<HelpBlock>The repository to which to save (e.g., jchartrand/cheese)</HelpBlock>
				</FormGroup>
				<FormGroup controlId="path" validationState={null}>
					<ControlLabel>Path</ControlLabel>
					<FormControl
						type="text"
						value={path}
						onChange={handlePathChangeCB} />
					<HelpBlock>The path to which to save (e.g., french/basque/SaintSauveur.xml)</HelpBlock>
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
			message: 'file commit or pr message'
		})
	}
	componentWillMount() {
		this.resetState()
	}

	// handles changes passed up from the form
	handleChange(state,e) {
		this.setState({[state]: e.target.value});
	}

	// action on button click in form
	saveFile() {
		this.setState({submitted:true, userPR: false})
	}

	// action on button click in form
	saveFileAsPR() {
		this.setState({submitted: true, usePR: true})
	}

	// action on button click in form
	cancel() {
	}

	// callback passed to VerifyRepo
	repoVerified() {
		this.setState({repoVerified:true})
	}

	// callback passed to VerifyRepo and SaveToPath
	repoOrPathCancelled() {
		this.setState({repoVerified: false, submitted:false})
	}

	// callback passed to SaveToPath
	// could use this to show a message
	done() {
	}

	render() {
		const {repo, path, usePR, message, submitted, repoVerified} = this.state
		if (!submitted) {
			return (
				<SaveForm
					handleRepoChangeCB={this.handleChange.bind(this, 'repo')}
					handlePathChangeCB={this.handleChange.bind(this, 'path')}
					repo={repo}
					path={path}
					saveFileCB={this.saveFile.bind(this)}
					saveFileAsPullRequestCB={this.saveFileAsPR.bind(this)}
					cancelCB={this.cancel.bind(this)}
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
					savedCB={this.done.bind(this)}
					cancelCB={this.repoOrPathCancelled.bind(this)}
				/>
			)
		} else {
			return null
		}
	}
}

async function save(writer) {

	//const repoName = 'whaaaa'
	//const userName = 'jchartrand'
	//const path = 'test/test.xml'
	//const repoDesc = 'hello'
	//const isPrivate = false
	//const text = 'some test text dddd'
	//const message = 'a test commit message'
	if (authenticate()) {
		if ($('#file-save').length == 0) {
			$(writer.dialogManager.getDialogWrapper()).append('<div id="file-save"/>')
		}
		const repo = writer.repoName || ''
		const path = writer.filePathInGithub || ''
		const content = writer.converter.getDocumentContent(true);

		const component = ReactDOM.render(
			<SaveCmp
				repo={repo}
				path={path}
				content={content}/>,
			document.getElementById('file-save'))
		component.resetState()
		//document.getElementById(targetElement)

	}
}

export default save
