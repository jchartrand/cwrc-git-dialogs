import React, {Component, Fragment} from 'react'
import {Panel, PanelGroup, ListGroup, ListGroupItem} from 'react-bootstrap';

class SearchResultList extends Component {

	showResultList = (results) => {
		return results.map((result, i) => {
			const repoDetails = result.repository ? result.repository : result;
			const header = `${repoDetails.full_name}/${result.path}`;
			return (
				<ListGroupItem
					key={i} /* this doesn't get passed for some reason */
					onClick={()=>this.props.selectCB(repoDetails.full_name, result.path)}
					style={{cursor: "pointer"}}
				>
					<div style={{fontSize: '16px', fontWeight:'900'}} class="list-group-item-heading">{repoDetails.full_name}/{result.path}</div>
					{this.highlightedMatches(result)}
				</ListGroupItem>
			)
		})
	}

	highlightedMatches(result) {
		return result.text_matches.map((text_match, i)=>(
			<Fragment>
				<span>{text_match.fragment.slice(0, text_match.matches[0].indices[0])}</span>
				{
					text_match.matches.map((currentMatch, currentIndex, allMatches)=> {
						const startOfNextMatch = currentIndex + 1 == allMatches.length ? text_match.fragment.length : allMatches[currentIndex + 1].indices[0]
						const endOfThisMatch = currentMatch.indices[1]
						return	<span>
								<span style={{fontWeight:'900', fontSize:'16px'}}>{currentMatch.text}</span>
								{`${text_match.fragment.slice(
									endOfThisMatch,
									startOfNextMatch
								)}`}
							</span>
					})
				}
			</Fragment>
		))
	}

	render() {
		return (
			<ListGroup>
				{this.showResultList(this.props.results)}
			</ListGroup>
		)
	}
}


export default SearchResultList
