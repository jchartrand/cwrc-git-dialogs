import React, {Component} from 'react'
import {Panel, PanelGroup,} from 'react-bootstrap';


const cwrcAppName = "CWRC-GitWriter" + "-web-app";

class SearchResultList extends Component {

	showResultList = (results) => {
		return results.map(result=> {
			console.log('the result in the search result list:')
			console.log(result)
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
		return result.text_matches.map((match, i)=><h5 key={i}>{match.fragment}</h5>)


		//let highlightedFragment = ''
		/*for (var textMatch of result.text_matches) {
			if (! textMatch.fragment.includes(cwrcAppName)) {
				var fragment = textMatch.fragment;
				//var searchString = textMatch.matches[0].text;
				//var boldSearchString = `<b>${searchString}</b>`;
				//var regex = new RegExp(searchString,"gi");
				//.var boldFragment = fragment.replace(regex, boldSearchString);

			}
		}
		return <p>{fragment}</p>*/
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
