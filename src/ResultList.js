import React, {Component} from 'react'
import RepoResultList from './RepoResultList.js';
import SearchResultList from './SearchResultList.js';

class ResultList extends Component {
	constructor(props) {
		super(props);
		// this.state = {
		// 	results: null
		// }
	}

	render() {
		if (this.state.results.data.items) {
			return <SearchResultList selectCB={this.props.selectCB} results={this.state.results.data.items}/>
		} else {
			return <RepoResultList selectCB={this.props.selectCB} repos={this.state.results.data}/>
		}
	}
}

export default ResultList
