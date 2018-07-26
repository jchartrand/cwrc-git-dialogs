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
		<Modal.Header>Checking your respository...</Modal.Header>
		<Modal.Body>
			<p></p>
		</Modal.Body>
	</Modal>
)

class VerifyRepo extends Component {

	componentWillMount () {
		this.resetComponent()
	}

	resetComponent = () => this.setState({
		repoHasBeenSaved: false,
		doesRepoExist: null,
		error: null,
		checkingRepo: null,
		isPrivate: false,
		repoDesc: 'Automagically created by CWRC'
	})

	componentDidMount() {
		this.setState({checkingRepo: true})
		cwrcGit.getRepoContents(`${this.props.repo}`).then(
			(result)=>{
				this.setState({
					checkingRepo: false,
					repoHasBeenSaved: true,
					doesRepoExist: true
				})
				return result;
			},
			(error)=>{
				error.status === 404 ? this.setState({
					checkingRepo: false,
					repoHasBeenSaved: true,
					doesRepoExist: false
				}): this.displayError(error)
				return error
			})
	}

	complete = () => {
		this.resetComponent()
		this.props.verifiedCB()
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

	createRepo = () => {
		cwrcGit.createRepo(this.props.repo, this.state.repoDesc, this.state.isPrivate).then(
			(result) => this.complete(),
			(error) => this.displayError(error)
		)
	}

	render() {
		const {repoHasBeenChecked, doesRepoExist, error, checkingRepo} = this.state

		if (error) {
			return <ErrorModal
					error = {error}
					cancel = {this.cancel.bind(this)}/>
		} else if (checkingRepo) {
			return <CheckingModal/>
		} else if (doesRepoExist) {
			return <ConfirmModal
				title='Repository Exists'
				body='This repository exists, would you like to use it?'
				buttonText='Yes'
				ok = {this.complete.bind(this)}
				cancel = {this.cancel.bind(this)}
			/>
		} else if (repoHasBeenChecked) {
			return <ConfirmModal
				title='Create Repository'
				body="This repository doesn't yet exist, would you like to create it?"
				buttonText='Create'
				ok ={this.createRepo.bind(this)}
			/>
		} else {
			return null;
		}
	}
}

/*function verifyRepo(userName, repoName, repoDesc, isPrivate) {
	return new Promise((resolve, reject)=> {
		const component = ReactDOM.render(
			<VerifyRepoCmp
				promiseResolve={resolve}
				promiseReject={reject}
				userName={userName}
				repoName={repoName}
				repoDesc={repoDesc}
				isPrivate={isPrivate}/>,
			document.getElementById('repo-verify'))
	})
}*/

export default VerifyRepo
