import React, {Component} from 'react'
import RepoResultList from './RepoResultList.js';
import SearchResultList from './SearchResultList.js'
import ReactDOM from 'react-dom';
class ResultList extends Component {

	state = {
		//results: this.props.results
		results: null
	}

	/*
		reactComponentRef.updateRepoList([
			{repository: {id: 'jchartrand/aTest', fullName: 'a repo', description: 'Should have updated.'}},
			{repository: {id: 'jchartrand/isicily', fullName: 'yet yet repo', description: 'oh repo description'}}
		])*/
	updateList(results) {
		this.setState((prevState) => ({
			results: results
		}))
	}

	render() {
		if (! this.state.results) {
			return <div></div>
		} else if (this.state.results.data.items) {
			return <SearchResultList selectCB={this.props.selectCB} results={this.state.results.data.items}/>
		} else {
			return <RepoResultList selectCB={this.props.selectCB} repositories={this.state.results.data}/>
		}
	}
}


/*function showResultList(targetElement, results, selectCB)  {

	const reactComponentRef = ReactDOM.render(<ResultList selectCB={selectCB} results={results} />, document.getElementById(targetElement))
	return reactComponentRef;
}*/

function initializeReactResultComponent(targetElement, selectCB) {
	return ReactDOM.render(<ResultList selectCB={selectCB} />, document.getElementById(targetElement))
}


export default initializeReactResultComponent
