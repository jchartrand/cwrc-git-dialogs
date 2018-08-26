import React, {Component} from 'react'
import {Panel, PanelGroup,} from 'react-bootstrap';

class SearchResultList extends Component {

	showResultList = (results) => {
		return results.map(result=> {
			const repoDetails = result.repository ? result.repository : result
			return <Panel key={result.url} onClick={()=>this.props.selectCB(repoDetails.full_name, result.path)}>
				<Panel.Heading>
					<Panel.Title>
						<h4>{result.path}</h4>
						<h5>{repoDetails.full_name}  {repoDetails.description && ( '-' + repoDetails.description)}</h5>
					</Panel.Title>
				</Panel.Heading>
					<Panel.Body>
						{this.highlightedMatches(result)}
					</Panel.Body>
			</Panel>
		})
	}

	highlightedMatches(result) {
		return result.text_matches.map((text_match)=>(
			<p>
				<span>{text_match.fragment.slice(0, text_match.matches[0].indices[0])}</span>
				{
					text_match.matches.map((currentMatch, currentIndex, allMatches)=> {
						const startOfNextMatch = currentIndex + 1 == allMatches.length ? text_match.fragment.length : allMatches[currentIndex + 1].indices[0]
						const endOfThisMatch = currentMatch.indices[1]
						return	<span>
								<span style={{fontWeight:'900', fontSize:'1.3em'}}>{currentMatch.text}</span>
								{`${text_match.fragment.slice(
									endOfThisMatch,
									startOfNextMatch
								)}`}
							</span>
					})
				}
			</p>
		))
	}

	render() {
		const {selectCB} = this.props

		return (
			<PanelGroup accordion id="accordion-example">
				{this.showResultList(this.props.results)}
			</PanelGroup>
		)
	}
}


export default SearchResultList
