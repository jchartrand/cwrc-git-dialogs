import React, {Component} from 'react'
import { Button, Panel, PanelGroup, Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap';
import ReactDOM from 'react-dom';
var cwrcGit = require('cwrc-git-server-client');

class RepoResultList extends Component {

	state = {
		repoStructures:{},
		openFolders:[],
		selectedRepo: null
	}

/*	updateRepoList(repos) {
		this.setState((prevState) => ({
			repositories: repos,
			repoStructures: {},
			openFolders:[],
			selectedRepo: null
		}))
	}*/

	toggleFolder(path) {
		this.setState((prevState) => this.state.openFolders.includes(path)
				? ({openFolders: prevState.openFolders.filter(item=>item.path !== path)})
				: ({openFolders: prevState.openFolders.concat(path)})
		)
	}

	showTree(structure, repo, indent=0) {
		return structure.map((item, i) => {
			return item.type === 'folder'
				? <div key={item.sha}>
					<ListGroupItem bsStyle="success" onClick={()=>this.toggleFolder(item.path)} style={{padding: '1em'}}>
						<div style={{paddingLeft: `${indent}em`}}>
							<Glyphicon glyph={this.state.openFolders.includes(item.path)?"chevron-down":"chevron-right"} style={{paddingRight: '1em'}}/>
							{item.name}
						</div>
					</ListGroupItem>
					{this.state.openFolders.includes(item.path) && this.showTree(item.contents, repo, indent+2)}
				</div>
				: <ListGroupItem key={item.sha} onClick={()=>this.props.selectCB(repo, item.path)} style={{padding: '1em'}}>
					<div style={{paddingLeft: `${indent}em`}}>{item.name}</div>
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
				return <div><Glyphicon glyph="refresh" style={{padding:'1em'}}/>Loading Repository Structure...</div>
			} else {
				return <ListGroup style={{padding:'1em'}}>{this.showTree(this.state.repoStructures[repoFullName], repoFullName)}</ListGroup>
			}
	}

	showRepoList = (results) => {
		return results.map((result, i)=> {
			const repoDetails = result.repository ? result.repository : result
			return <Panel key={i} eventKey={repoDetails.full_name} >
				<Panel.Heading>
					<Panel.Title toggle>
						<h4>{repoDetails.fullName || repoDetails.full_name}</h4>
						<h5>{repoDetails.description && repoDetails.description}</h5>
					</Panel.Title>
				</Panel.Heading>
				<Panel.Collapse>
					<Panel.Body>
						{repoDetails.full_name === this.state.selectedRepo?this.showRepoStructure(repoDetails.full_name):''}
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
		const {selectCB} = this.props
		return (
			<PanelGroup accordion id="accordion-example" onSelect={this.handlePanelSelect.bind(this)}>
				{this.showRepoList(this.props.repositories)}
			</PanelGroup>
		)
	}
}


export default RepoResultList
