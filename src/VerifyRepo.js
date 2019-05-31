import React, {Fragment, Component} from 'react'
const cwrcGit = require('cwrc-git-server-client');
import { Modal, Button, FormGroup, Checkbox, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';

const ErrorModal = ({cancel, error}) => (
	<Fragment>
		<Modal.Header>An error occurred</Modal.Header>
		<Modal.Body>
			<p>{error}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button
				onClick={cancel}
				bsStyle="success"
			>Ok</Button>
		</Modal.Footer>
	</Fragment>
)

const ConfirmModal = ({cancel, title, body, ok, buttonText}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>{title}</h4>
			<p>{body}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel}>
				Cancel
			</Button>
			<Button
				onClick={ok}
				bsStyle="success"
			>{buttonText}</Button>
		</Modal.Footer>
	</Fragment>
)

const CreateModal = ({cancel,ok, repoDesc, isPrivate, handlePrivateChange, handleDescriptionChange}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>Create Repository</h4>
			<p>This repository doesn't yet exist, would you like to create it?</p>
			<FormGroup controlId='repoDesc'>
				<ControlLabel>Description</ControlLabel>
				<FormControl
					type="text"
					placeholder="A short description of your repository."
					value={repoDesc}
					onChange={handleDescriptionChange}
				/>
				<HelpBlock>The description will appear in the GitHub page for your new repository.</HelpBlock>
			</FormGroup>
			<Checkbox checked={isPrivate} onChange={handlePrivateChange}>
				Make Private
			</Checkbox>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel}>
				Cancel
			</Button>
			<Button
				onClick={ok}
				bsStyle="success"
			>Create</Button>
		</Modal.Footer>
	</Fragment>
)

const CheckingModal = () => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<p>Checking your respository...</p>
		</Modal.Body>
	</Fragment>
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
		cwrcGit.getRepoContents(this.getFullRepoPath()).then(
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

	getFullRepoPath() {
		return this.props.user+'/'+this.props.repo;
	}

	complete = () => {
		this.resetComponent()
		this.props.verifiedCB()
	}

	cancel = () => {
		this.resetComponent()
		this.props.cancelCB()
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
