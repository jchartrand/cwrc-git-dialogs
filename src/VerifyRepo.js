import React, {Component} from 'react'
import ReactDOM from 'react-dom';
const cwrcGit = require('cwrc-git-server-client');
import { Modal, Button, FormGroup, Checkbox, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';

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
			>OK</Button>
		</Modal.Footer>
	</Modal>
)

const ConfirmModal = ({cancel, title, body, ok, buttonText}) => (
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
			>{buttonText}</Button>
		</Modal.Footer>
	</Modal>
)

const CreateModal = ({cancel,ok, repoDesc, isPrivate, handlePrivateChange, handleDescriptionChange}) => (
	<Modal
		show={true}>
		<Modal.Header>Create Repository</Modal.Header>
		<Modal.Body>
			<p>This repository doesn't yet exist, would you like to create it?</p>
			<FormGroup controlId='repoDesc'>
				<ControlLabel>Description</ControlLabel>
				<FormControl
					type="text"
					placeholder="A short description of your repository."
					value={repoDesc}
					onChange={handleDescriptionChange}
				/>
				<HelpBlock>The description will appear in the Github page for your new repository.</HelpBlock>
			</FormGroup>
			<Checkbox checked={isPrivate} onChange={handlePrivateChange}>
				Make Private
				<HelpBlock>You must have a paid Github account to create private repositories.</HelpBlock>
			</Checkbox>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel} bsStyle="danger">
				Cancel
			</Button>
			<Button
				onClick={ok}
				bsStyle="success"
			>Create</Button>
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
		repoHasBeenChecked: false,
		doesRepoExist: null,
		error: null,
		checkingRepo: null,
		isPrivate: false,
		repoDesc: 'Automagically created by CWRC'
	})

	componentDidMount() {
		this.setState({checkingRepo: true})
		cwrcGit.getRepoContents(this.props.repo).then(
			(result)=>{
				this.setState({
					checkingRepo: false,
					doesRepoExist: true
				})
				return result;
			},
			(error)=>{
				error.status === 404 ? this.setState({
					checkingRepo: false,
					repoHasBeenChecked: true,
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
		let repoNameWithoutUserName = this.props.repo.split('/')[1]
		cwrcGit.createRepo(repoNameWithoutUserName, this.state.repoDesc, this.state.isPrivate).then(
			(result) => this.complete(),
			(error) => this.displayError(error)
		)
	}

	// handles changes passed up from children
	handleDescriptionChange(e) {
		this.setState({repoDesc: e.target.value});
	}

	handlePrivateChange(e) {
		this.setState({isPrivate: e.target.checked})
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
			return <CreateModal
				ok = {this.createRepo.bind(this)}
				cancel = {this.cancel.bind(this)}
				handlePrivateChange = {this.handlePrivateChange.bind(this)}
				handleDescriptionChange = {this.handleDescriptionChange.bind(this)}
				isPrivate = {this.state.isPrivate}
				repoDesc={this.state.repoDesc}
				/>
		} else {
			return null;
		}
	}
}
export default VerifyRepo
