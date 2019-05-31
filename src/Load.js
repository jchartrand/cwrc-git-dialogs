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

import React, {Component, Fragment} from 'react'
import { Modal, Button, Tabs, Tab, Well, Grid, Row, Col, PanelGroup, Panel, ListGroup, ListGroupItem, ToggleButtonGroup, ToggleButton, ControlLabel, FormControl, Glyphicon } from 'react-bootstrap';
import parseLinks from 'parse-link-header';
import cwrcGit from 'cwrc-git-server-client';

import RepoResultList from "./RepoResultList.js";
import SearchResultList from "./SearchResultList.js";
import FileUpload from "./FileUpload.js";
import Paginator from "./Paginator.js";
import SearchInput from "./SearchInput.js";

const RESULTS_PER_PAGE = 10;

function getReposForGithubUser(user, requestedPage, resultsPerPage=RESULTS_PER_PAGE) {
	let dfd = $.Deferred();
	cwrcGit.getReposForGithubUser(user, requestedPage, resultsPerPage).then((results)=>{
		dfd.resolve({
			items: results.data,
			lastPage: getLastPage(results, requestedPage)
		});
	}, (fail)=>{
		dfd.reject(fail);
	})
	return dfd.promise();
}

function getReposForAuthenticatedGithubUser(requestedPage, affiliation='owner', resultsPerPage=RESULTS_PER_PAGE) {
	let dfd = $.Deferred();
	cwrcGit.getReposForAuthenticatedGithubUser(requestedPage, resultsPerPage, affiliation).then((results)=>{
		dfd.resolve({
			items: results.data,
			lastPage: getLastPage(results, requestedPage)
		});
	}, (fail)=>{
		dfd.reject(fail);
	})
	return dfd.promise();
}

function getSearchResults(gitName, searchTerms, requestedPage, resultsPerPage=RESULTS_PER_PAGE) {
	let dfd = $.Deferred();
	let queryString = 'language:xml ';
	if (searchTerms) queryString += '"' + searchTerms + '" ';
	if (gitName) queryString += "user:" + gitName;
	cwrcGit.search(queryString, resultsPerPage, requestedPage).then((results)=>{
		dfd.resolve({
			items: results.data.items,
			lastPage: getLastPage(results, requestedPage)
		});
	}, (fail)=>{
		dfd.reject(fail);
	});
	return dfd.promise();
}

function getLastPage(results, requestedPage) {
	var lastPage;
	if (results.meta.link) {
		const relLinks = parseLinks(results.meta.link);
		lastPage = relLinks.last ? parseInt(relLinks.last.page, 10) : requestedPage
	} else {
		lastPage = requestedPage
	}
	return lastPage;
}

class LoadDialog extends Component {
	constructor(props) {
		super(props);

		this.handleTabSelect = this.handleTabSelect.bind(this);
		this.handleRepoTypeSelect = this.handleRepoTypeSelect.bind(this);
		this.handleAffiliationSelect = this.handleAffiliationSelect.bind(this);
		this.doSearch = this.doSearch.bind(this);
		this.handleSearchClear = this.handleSearchClear.bind(this);
		this.handleSearchChange = this.handleSearchChange.bind(this);
		this.getRepos = this.getRepos.bind(this);

		this.state = {
			activeTab: undefined,
			loading: false,
			error: '',
			
			isSearch: false,
			searchFilter: '',
			query: undefined,

			repoType: 'private',
			privateReposAffiliation: 'owner',

			results: undefined,
			currentPage: 1,
			lastPage: 1,

			templates: undefined
		}
	}

	componentWillMount() {
		this.handleTabSelect('templates');
	}

	handleTabSelect(key) {
		this.setState({activeTab: key, loading: false});
		switch(key) {
			case 'repos':
				if (this.state.results === undefined) {
					this.getRepos();
				}
				break;
			case 'templates':
				if (this.state.templates === undefined) {
					this.setState({loading: true});
					cwrcGit.getTemplates().then((templates)=>{
						this.setState({templates, loading: false})
					}, (fail)=>{
						this.setState({error: fail.responseText})
					})
				}
				break;
		}
	}

	handleRepoTypeSelect(key) {
		if (key !== null) {
			this.setState({repoType: key, isSearch: false});
			if (key === 'private') {
				setTimeout(()=>{
					this.getRepos();
				});
			}
		}
	}

	handleAffiliationSelect(value) {
		this.setState({privateReposAffiliation: value, isSearch: false});
		setTimeout(()=>{
			this.getRepos();
		});
	}

	doSearch(pageNum, value=this.state.query) {
		this.setState({loading: true, error: '', isSearch: true, query: value});
		let promise;
		if (this.state.repoType === 'private') {
			promise = getSearchResults(this.props.user.userId, value, pageNum)
		} else {
			let filter = this.filterInput.value;
			if (filter && !value) {
				this.setState({isSearch: false});
				promise = getReposForGithubUser(filter, pageNum);
			} else {
				promise = getSearchResults(filter, value, pageNum);
			}
		}
		promise.then((result)=>{
			this.setState({loading: false, results: result.items, currentPage: pageNum, lastPage: result.lastPage})
		},(fail)=>{
			this.setState({loading: false, error: fail.responseText})
		})
	}

	handleSearchChange(value) {
		this.setState({query: value});
	}

	handleSearchClear() {
		this.setState({isSearch: false});
		setTimeout(()=>{
			this.getRepos();
		})
	}

	getRepos(pageNum=1) {
		this.setState({loading: true, error: ''});
		let promise;
		if (this.state.repoType === 'public') {
			let filter = this.filterInput.value;
			if (filter !== '') {
				promise = getReposForGithubUser(filter, pageNum);
			} else {
				this.setState({loading: false});
				return false;
			}
		} else {
			promise = getReposForAuthenticatedGithubUser(pageNum, this.state.privateReposAffiliation);
		}
		promise.then((result)=>{
			this.setState({loading: false, results: result.items, currentPage: pageNum, lastPage: result.lastPage})
		},(fail)=>{
			this.setState({loading: false, error: fail.responseText})
		})
	}	

	render() {
		const isDocLoaded = this.props.isDocLoaded;
		const user = this.props.user;
		const onFileSelect = this.props.onFileSelect;
		const onFileUpload = this.props.onFileUpload;
		const handleClose = this.props.handleClose;
		const loading = this.state.loading;
		const isSearch = this.state.isSearch;
		const error = this.state.error;
		const results = this.state.results || [];
		const templates = (this.state.templates || []).map((item, key)=>(
			<ListGroupItem key={key} onClick={onFileUpload.bind(this, item.download_url)}>{item.name.replace(/.xml$/, '')}</ListGroupItem>
		));
		return (
			<Fragment>
				<Modal.Header closeButton={isDocLoaded} onHide={handleClose}>Load a Document</Modal.Header>
				<Modal.Body>
					<Tabs
						id="git-dialogs-tabs"
						animation={false}
						activeKey={this.state.activeTab}
						onSelect={this.handleTabSelect}
					>
						<Tab eventKey="templates" title="CWRC Templates" style={{marginTop: "10px"}}>
						{loading ?
							<Well><h5><Glyphicon glyph="cloud-download" style={{padding: '10px'}}/>Loading...</h5></Well>
							:
							(error !== '' ?
								<Well><h5>Error!</h5><p>{error}</p></Well>
								:
								<Well bsSize="small">
									<ListGroup>{templates}</ListGroup>
								</Well>
							)
						}
						</Tab>

						<Tab eventKey="repos" title={'GitHub Repositories'} style={{marginTop: "10px"}}>
							<Grid fluid={true} style={{marginBottom: "10px"}}>
								<Row>
									<Col sm={5}>
										<h4>Search</h4>
										<PanelGroup accordion id="git-dialogs-repoPanelGroup" activeKey={this.state.repoType} onSelect={this.handleRepoTypeSelect}>
											<Panel eventKey="private">
												<Panel.Heading>
													<Panel.Title toggle>My Repositories</Panel.Title>
												</Panel.Heading>
												<Panel.Collapse>
													<Panel.Body>
														<ControlLabel>Show repositories for which I am:</ControlLabel>
														<ToggleButtonGroup type="radio" name="affiliation" defaultValue="owner"> { /* can't use onChange because of bootstrap js conflict https://github.com/react-bootstrap/react-bootstrap/issues/2774 */ }
															<ToggleButton bsSize="small" value="owner" onClick={this.handleAffiliationSelect.bind(this, 'owner')}>Owner</ToggleButton>
															<ToggleButton bsSize="small" value="collaborator" onClick={this.handleAffiliationSelect.bind(this, 'collaborator')}>Collaborator</ToggleButton>
															<ToggleButton bsSize="small" value="organization_member" onClick={this.handleAffiliationSelect.bind(this, 'organization_member')}>Organization Member</ToggleButton>
														</ToggleButtonGroup>
													</Panel.Body>
												</Panel.Collapse>
											</Panel>
											<Panel eventKey="public">
												<Panel.Heading>
													<Panel.Title toggle>Public Repositories</Panel.Title>
												</Panel.Heading>
												<Panel.Collapse>
													<Panel.Body>
														<ControlLabel>Limit to user or organization:</ControlLabel>
														<FormControl type="text" inputRef={(ref)=>{this.filterInput = ref}} onKeyPress={(event)=>{if (event.charCode === 13) this.getRepos(1);}} />
														<Button onClick={()=>{this.getRepos(1)}} style={{marginTop: '10px'}}>Search</Button>
													</Panel.Body>
												</Panel.Collapse>
											</Panel>
										</PanelGroup>
										<SearchInput placeholder="Search within repositories" style={{marginTop: '10px'}} onChange={this.handleSearchChange} onSearch={(value)=>{this.doSearch(1,value)}} onClear={this.handleSearchClear} />
									</Col>
									<Col sm={7}>
										<h4>Results</h4>
										{loading ?
											<Well><h5><Glyphicon glyph="cloud-download" style={{padding: '10px'}}/>Loading...</h5></Well>
											:
											(error !== '' ?
												<Well><h5>Error!</h5><p>{error}</p></Well>
												:
												(results.length === 0 ?
													<Well><h5>No results</h5></Well>
													:
													(isSearch ? 
														<Well bsSize="small">
															<SearchResultList selectCB={onFileSelect} results={results} />
															<Paginator pagingCB={this.doSearch} currentPage={this.state.currentPage} lastPage={this.state.lastPage} />
														</Well>
														: 
														<Well bsSize="small">
															<RepoResultList selectCB={onFileSelect} repos={results} />
															<Paginator pagingCB={this.getRepos} currentPage={this.state.currentPage} lastPage={this.state.lastPage} />
														</Well>
													)
												)
											)
										}
									</Col>
								</Row>
							</Grid>
						</Tab>
						<Tab eventKey="upload" title="Upload File or Text" style={{marginTop: "10px"}}>
							<FileUpload fileCB={onFileUpload} />
						</Tab>
					</Tabs>
				</Modal.Body>
				<Modal.Footer>
					{isDocLoaded ? <Button onClick={handleClose}>Cancel</Button> : ''}
				</Modal.Footer>
			</Fragment>
		)
	}
}

export default LoadDialog
