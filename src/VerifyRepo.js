import React, {Fragment, Component} from 'react'
import cwrcGit from './GitServerClient.js';
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

const CheckingModal = ({body}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<p>{body}</p>
		</Modal.Body>
	</Fragment>
)

class VerifyRepo extends Component {
	constructor(props) {
		super(props);

		this.state = {
			checkingRepo: null,
			doesRepoExist: null,
			checkingOwner: null,
			isOwnerUser: null,
			checkingPermission: null,
			doesUserHavePermission: null,
			error: null,
			isPrivate: false,
			repoDesc: 'Automagically created by CWRC'
		}
	}

	resetComponent = () => this.setState({
		checkingRepo: null,
		doesRepoExist: null,
		checkingOwner: null,
		isOwnerUser: null,
		checkingPermission: null,
		doesUserHavePermission: null,
		error: null,
		isPrivate: false,
		repoDesc: 'Automagically created by CWRC'
	})

	componentDidMount() {
		cwrcGit.setServerURL(this.props.serverURL);
		cwrcGit.useGitLab(this.props.isGitLab);
		this.isOwnerUserOrOrg();
	}

	isOwnerUserOrOrg() {
		this.setState({checkingOwner: true});
		cwrcGit.getDetailsForGithubUser(this.props.owner).then((result)=>{
			const isOwnerUser = result.data.type === 'User';
			this.setState({checkingOwner: false, isOwnerUser});
			this.checkRepoExistence();
		},
		(error)=>{
			this.displayError(`The repository owner "${this.props.owner}" does not exist.`);
		})
	}

	checkRepoExistence() {
		this.setState({checkingRepo: true});
		cwrcGit.getRepoContents(this.getFullRepoPath()).then(
			(result)=>{
				this.setState({
					checkingRepo: false,
					doesRepoExist: true
				})
				if (this.props.usePR !== true) {
					this.checkPermission();
				} else {
					this.complete();
				}
			},
			(error)=>{
				this.setState({
					checkingRepo: false,
					doesRepoExist: false
				})
			})
	}

	checkPermission() {
		this.setState({checkingPermission: true});
		cwrcGit.getPermissionsForGithubUser(this.props.owner, this.props.repo, this.props.user).then(
			(result)=>{
				if (result === 'none' || result === 'read') {
					this.setState({
						checkingPermission: false,
						doesUserHavePermission: false
					})
				} else {
					this.complete();
				}
				
			},
			(error)=>{
				this.setState({
					checkingPermission: false,
					doesUserHavePermission: false
				})
				// this.displayError(error);
			}
		)
	}

	getFullRepoPath() {
		return this.props.owner+'/'+this.props.repo;
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
		let errorMsg;
		if (typeof error === 'string') {
			errorMsg = error;
		} else {
			errorMsg = error.statusText;
		}
		this.setState({error: errorMsg})
	}

	createRepo = () => {
		if (this.state.isOwnerUser) {
			cwrcGit.createRepo(this.props.repo, this.state.repoDesc, this.state.isPrivate).then(
				(result) => this.complete(),
				(error) => this.displayError(error)
			)
		} else {
			cwrcGit.createOrgRepo(this.props.owner, this.props.repo, this.state.repoDesc, this.state.isPrivate).then(
				(result) => this.complete(),
				(error) => this.displayError(error)
			)
		}
	}

	// handles changes passed up from children
	handleDescriptionChange(e) {
		this.setState({repoDesc: e.target.value});
	}

	handlePrivateChange(e) {
		this.setState({isPrivate: e.target.checked})
	}

	render() {
		const {checkingRepo, checkingOwner, isOwnerUser, doesRepoExist, checkingPermission, doesUserHavePermission, error} = this.state

		if (error) {
			return <ErrorModal
					error = {error}
					cancel = {this.cancel.bind(this)}/>
		} else if (checkingOwner) {
			return <CheckingModal body="Checking the repository owner..." />
		} else if (checkingRepo) {
			return <CheckingModal body="Checking the respository..." />
		} else if (checkingPermission) {
			return <CheckingModal body="Checking your permissions..." />
		} else {
			if (doesRepoExist && doesUserHavePermission === false) {
				return <ErrorModal
					error = "You do not have permission to use this repository. Try saving as a pull request or save to another repository you have writing privileges for."
					cancel = {this.cancel.bind(this)}/>
			} else {
				if (isOwnerUser && this.props.owner !== this.props.user) {
					return <ErrorModal
						error = "You cannot create a repository for another user's account."
						cancel = {this.cancel.bind(this)}/>
				} else {
					return <CreateModal
						ok = {this.createRepo.bind(this)}
						cancel = {this.cancel.bind(this)}
						handlePrivateChange = {this.handlePrivateChange.bind(this)}
						handleDescriptionChange = {this.handleDescriptionChange.bind(this)}
						isPrivate = {this.state.isPrivate}
						repoDesc={this.state.repoDesc}
						/>
				}
			}
		}
	}
}
export default VerifyRepo
