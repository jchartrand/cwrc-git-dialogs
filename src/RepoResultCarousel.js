import React, { Component } from 'react'
import { Carousel, Breadcrumb, Glyphicon, ListGroup, ListGroupItem } from 'react-bootstrap';
import cwrcGit from './GitServerClient.js';
import SearchInput from './SearchInput.js';

class RepoResultCarousel extends Component {
    constructor(props) {
        super(props);

        this.handleCarouselSelect = this.handleCarouselSelect.bind(this);
        this.handleRepoSelect = this.handleRepoSelect.bind(this);
        
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.doSearch = this.doSearch.bind(this);

        this.state = {
            index: 0,
            direction: null,
            repoStructures: {},
            openFolders: [],
            selectedRepo: null,
            isSearch: false,
            query: ''
        }
    }

    componentDidMount() {
        cwrcGit.setServerURL(this.props.serverURL);
        cwrcGit.useGitLab(this.props.isGitLab);
    }

    toggleFolder(path) {
        this.setState((prevState) => {
            if (this.state.openFolders.includes(path)) {
                return { openFolders: prevState.openFolders.filter(item => item !== path) }
            } else {
                return { openFolders: prevState.openFolders.concat(path) }
            }
        })
    }

    showTree(structure, repo, indent = 0) {
        let isSearch = this.state.isSearch;
        const searchQuery = this.state.query.toLowerCase();
        if (searchQuery.length === 0) isSearch = false;

        return structure.map((item, i) => {
            if (item.type === 'folder') {
                let isFolderOpen = this.state.openFolders.includes(item.path);
                return <div key={i}>
                    <ListGroupItem bsStyle="info" onClick={() => this.toggleFolder(item.path)} style={{ padding: '10px' }}>
                        <div style={{ paddingLeft: `${indent * 10}px` }}>
                            <Glyphicon glyph={isFolderOpen ? "chevron-down" : "chevron-right"} style={{ paddingRight: '10px' }} />
                            {item.name}
                        </div>
                    </ListGroupItem>
                    {isFolderOpen && this.showTree(item.contents, repo, indent + 2)}
                </div>
            } else {
                if (isSearch === false) {
                    return <ListGroupItem key={i} onClick={() => this.props.selectCB(repo, item.path)} style={{ padding: '10px' }}>
                        <div style={{ paddingLeft: `${indent * 10}px` }}>{item.name}</div>
                    </ListGroupItem>
                } else {
                    const queryIndex = item.name.toLowerCase().indexOf(searchQuery);
                    if (queryIndex !== -1) {
                        return <ListGroupItem key={i} onClick={() => this.props.selectCB(repo, item.path)} style={{ padding: '10px' }}>
                            <div style={{ paddingLeft: `${indent * 10}px` }}>
                                {item.name.substring(0, queryIndex)}<span style={{fontWeight: 'bold'}}>{item.name.substring(queryIndex, queryIndex+searchQuery.length)}</span>{item.name.substring(queryIndex+searchQuery.length)}
                            </div>
                        </ListGroupItem>
                    }
                }
            }
        })
    }

    showRepoStructure(repoFullName) {
        if (!this.state.repoStructures[repoFullName]) {
            cwrcGit.getRepoContentsByDrillDown(repoFullName).then(({ contents: { contents: structure } }) => {
                // console.log(structure)
                this.setState((prevState, props) => ({ repoStructures: { ...prevState.repoStructures, [repoFullName]: structure } }))
            }
            )
            return <div><Glyphicon glyph="cloud-download" style={{ padding: '10px' }} />Loading Repository Structure...</div>
        } else {
            return <ListGroup style={{maxHeight: '500px', overflowY: 'scroll'}}>{this.showTree(this.state.repoStructures[repoFullName], repoFullName)}</ListGroup>
        }
    }

    showRepoList = (results) => {
        return results.map((result, i) => {
            const repoDetails = result.repository ? result.repository : result
            return <ListGroupItem key={i} eventkey={repoDetails.full_name} onClick={this.handleRepoSelect}>
                <span style={{ fontWeight: '900' }}>{repoDetails.full_name}</span>
                <span style={{ fontSize: '0.8em' }}>{repoDetails.description && ` ︱ ${repoDetails.description}`}</span>
            </ListGroupItem>
        })
    }

	handleRepoSelect(event) {
        const repo = event.currentTarget.getAttribute('eventkey');
		this.setState({selectedRepo: repo, index: 1, direction: 'next'})
    }

    handleCarouselSelect(selectedIndex, e) {
        this.setState({
            index: selectedIndex,
            direction: e.direction
        });
    }

	handleSearchClear() {
		this.setState({isSearch: false, query: ''});
    }
    
    doSearch(value=this.state.query) {
        const openFolders = [];
        const repoStructure = this.state.repoStructures[this.state.selectedRepo];
        if (repoStructure !== undefined) {
            repoStructure.forEach((item) => {
                if (item.type ==='folder' && this.doesItemMatchSearch(item, value)) {
                    openFolders.push(item.path);
                }
            })
        }
        
        this.setState({isSearch: true, query: value, openFolders});
    }
    
    doesItemMatchSearch(item, query) {
        if (item.type === 'folder' && item.contents !== undefined) {
            for (let i = 0; i < item.contents.length; i++) {
                const subItem = item.contents[i];
                if (this.doesItemMatchSearch(subItem, query)) {
                    return true;
                }
            }
        } else if (item.type === 'file') {
            return item.name.toLowerCase().indexOf(query) !== -1;
        }
        return false;
    }


    render() {
        const { index, direction, selectedRepo } = this.state;

        return (
            <Carousel
                id="git-dialogs-repoResultCarousel"
                activeIndex={index} direction={direction} onSelect={this.handleCarouselSelect}
                interval={null}
                indicators={false}
                controls={false}
                wrap={false}
                slide={false}
            >
                <Carousel.Item>
                    <Breadcrumb style={{marginBottom: '10px'}}>
                        <Breadcrumb.Item active={true}>Repos</Breadcrumb.Item>
                    </Breadcrumb>
                    <ListGroup style={{maxHeight: '500px', overflowY: 'scroll'}}>
                        {this.showRepoList(this.props.repos)}
                    </ListGroup>
                </Carousel.Item>
                <Carousel.Item>
                    <Breadcrumb style={{marginBottom: '10px'}}>
                        <Breadcrumb.Item onClick={this.handleCarouselSelect.bind(this, 0, {direction: 'prev'})}>Repos</Breadcrumb.Item>
                        <Breadcrumb.Item active={true}>{selectedRepo}</Breadcrumb.Item>
                    </Breadcrumb>
                    <SearchInput placeholder="Filename filter" style={{marginTop: '10px'}} onChange={this.doSearch} onSearch={this.doSearch} onClear={this.handleSearchClear} />
                    {index === 1 && selectedRepo !== null ? this.showRepoStructure(selectedRepo) : ''}
                </Carousel.Item>
            </Carousel>
        )
    }
}


export default RepoResultCarousel
