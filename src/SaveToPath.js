import React, {Component} from 'react'
import ReactDOM from 'react-dom';
const cwrcGit = require('cwrc-git-server-client');
import { Modal, Button } from 'react-bootstrap';

const ErrorModal = ({cancel, error}) => (
	<Modal
		show={true}>
		<Modal.Header>An error occurred</Modal.Header>
		<Modal.Body>
			<p>{error}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button
				onClick={cancel}
				bsStyle="success"
			>Yes</Button>
		</Modal.Footer>
	</Modal>
)

const ConfirmModal = ({cancel, title, body, ok}) => (
	<Modal
		show={true}>
		<Modal.Header>{title}</Modal.Header>
		<Modal.Body>
			<p>{body}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel} bsStyle="danger">
				Cancel
			</Button>
			<Button
				onClick={ok}
				bsStyle="success"
			>Yes</Button>
		</Modal.Footer>
	</Modal>
)

const CheckingModal = () => (
	<Modal
		show={true}>
		<Modal.Header>Checking your file...</Modal.Header>
		<Modal.Body>
			<p></p>
		</Modal.Body>
	</Modal>
)

class SaveToPath extends Component {

	componentWillMount () {
		this.resetComponent()
	}

	resetComponent = () => this.setState({
		fileHasBeenSaved: false,
		doesPathExist: null,
		error: null,
		checkingPath: null,
		pathHasBeenChecked: null,
		branch: 'master',
		commitMessage: 'Saved by CWRC-Writer',
		prTitle: 'Request made from CWRC-Writer',
		prBranch: 'cwrc-writer-pr'
	})

	componentDidMount() {
		this.setState({checkingPath: true})
		cwrcGit.getDoc(`${this.props.repo}`, 'master', this.props.path).then(
			(result)=>{
				this.setState({
					checkingPath: false,
					doesPathExist: true,
					pathHasBeenChecked: true
				})
				return result;
			},
			(error)=>{
				error.status === 404 ? this.setState({
					checkingPath: false,
					doesPathExist: false,
					pathHasBeenChecked: true
				}): this.displayError(error)
				return error
			})
	}

	complete = () => {
		this.resetComponent()
		this.props.savedCB()
		//this.props.promiseResolve()
	}

	cancel = () => {
		this.resetComponent()
		this.props.cancelCB()
		//this.props.promiseReject()
	}

	displayError = (error) => {
		this.setState({error: error.statusText})
	}

	save = () => {
		this.props.usePR ?
			cwrcGit.saveAsPullRequest(this.props.repo, this.props.path, this.props.content, this.state.prBranch, this.state.commitMessage, this.state.prTitle).then(
				(result) => this.complete(),
				(error) => this.displayError(error)
			) :
			cwrcGit.saveDoc(this.props.repo, this.props.path, this.props.content, this.state.branch, this.state.commitMessage).then(
				(result) => this.complete(),
				(error) => this.displayError(error)
			)

	}

	render() {
		const {pathHasBeenChecked, doesPathExist, error, checkingPath} = this.state

		if (error) {
			return <ErrorModal
				error = {error}
				cancel = {this.cancel.bind(this)}/>
		} else if (checkingPath) {
			return <CheckingModal/>
		} else if (doesPathExist) {
			return <ConfirmModal
				title='File Exists'
				body='This file exists - would you like to overwrite it?'
				buttonText='Yes'
				ok = {this.save.bind(this)}
				cancel = {this.cancel.bind(this)}
			/>
		} else if (pathHasBeenChecked) {
			return <ConfirmModal
				title='Create File'
				body="This file doesn't yet exist, would you like to create it?"
				buttonText='Create'
				ok ={this.save.bind(this)}
			/>
		} else {
			return null;
		}
	}
}

/*function saveToPath(userName, repoName, path, content, message) {
	return new Promise((resolve, reject)=> {
		const component = ReactDOM.render(
			<SaveToPathCmp
				promiseResolve={resolve}
				promiseReject={reject}
				userName={userName}
				repoName={repoName}
				path={path}
				message={message}
				content={content}/>,
			document.getElementById('file-verify'))
	})
}*/

export default SaveToPath
