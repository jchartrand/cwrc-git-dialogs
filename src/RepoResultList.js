import React, {Component} from 'react'
import { Button, Panel, PanelGroup, Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap';
import cwrcGit from './GitServerClient.js';

class RepoResultList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			repoStructures:{},
			openFolders:[],
			selectedRepo: null
		}
	}

	componentDidMount() {
		cwrcGit.setServerURL(this.props.serverURL);
	}

	toggleFolder(path) {
		this.setState((prevState) => this.state.openFolders.includes(path)
				? ({openFolders: prevState.openFolders.filter(item=>item.path !== path)})
				: ({openFolders: prevState.openFolders.concat(path)})
		)
	}

	showTree(structure, repo, indent=0) {
		return structure.map((item, i) => {
			return item.type === 'folder'
				? <div key={i}>
					<ListGroupItem bsStyle="info" onClick={()=>this.toggleFolder(item.path)} style={{padding: '10px'}}>
						<div style={{paddingLeft: `${indent*10}px`}}>
							<Glyphicon glyph={this.state.openFolders.includes(item.path)?"chevron-down":"chevron-right"} style={{paddingRight: '10px'}}/>
							{item.name}
						</div>
					</ListGroupItem>
					{this.state.openFolders.includes(item.path) && this.showTree(item.contents, repo, indent+2)}
				</div>
				: <ListGroupItem key={i} onClick={()=>this.props.selectCB(repo, item.path)} style={{padding: '10px'}}>
					<div style={{paddingLeft: `${indent*10}px`}}>{item.name}</div>
				</ListGroupItem>
		})
	}

	showRepoStructure(repoFullName){
			if (!this.state.repoStructures[repoFullName]) {
				cwrcGit.getRepoContents(repoFullName).then(({contents: {contents: structure}}) => {
						//console.log(structure)
						this.setState((prevState, props) => ({repoStructures: {...prevState.repoStructures, [repoFullName]: structure}}))
					}
				)
				return <div><Glyphicon glyph="cloud-download" style={{padding:'10px'}}/>Loading Repository Structure...</div>
			} else {
				return <ListGroup>{this.showTree(this.state.repoStructures[repoFullName], repoFullName)}</ListGroup>
			}
	}

	showRepoList = (results) => {
		return results.map((result, i)=> {
			const repoDetails = result.repository ? result.repository : result
			return <Panel key={i} eventKey={repoDetails.full_name} >
				<Panel.Heading>
					<Panel.Title toggle >
						<span style={{fontWeight: '900'}}>{repoDetails.full_name}</span>
						<span style={{fontSize: '0.8em'}}>{repoDetails.description && ` ︱ ${repoDetails.description}`}</span>
					</Panel.Title>
				</Panel.Heading>
				<Panel.Collapse>
					<Panel.Body>
						{repoDetails.full_name === this.state.selectedRepo && this.showRepoStructure(repoDetails.full_name)}
					</Panel.Body>
				</Panel.Collapse>
			</Panel>
		})
	}

	handlePanelSelect(eventKey) {
		// eventKey is the value of the eventKey attribute of the Panel that was clicked (expanded)
		// The value of eventKey=repoId
		// eventKey will be null if the open panel was clicked.
		// But, that's fine, because that then closes all panels.
		this.setState({selectedRepo: eventKey})

	}


	render() {
		return (
			<PanelGroup accordion id="git-dialogs-repoResultList" onSelect={this.handlePanelSelect.bind(this)}>
				{this.showRepoList(this.props.repos)}
			</PanelGroup>
		)
	}
}


export default RepoResultList
