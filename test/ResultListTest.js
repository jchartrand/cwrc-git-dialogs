// file on which to run browserify when manually testing (in a browser)
// or working on the module (to see the effect of changes in the browser).
'use strict';
import showResultList from "../src/ResultList.js";

if (!window.$) {
	window.jQuery = window.$ = require('jquery');
}
//import { Button } from 'react-bootstrap';
//let resultList = require('../src/ResultList.js');

//addBootstrapCSS();

function addBootstrapCSS() {
	let bootstrapCSSLink = document.createElement('link')
	let bootstrapThemeCSSLink = document.createElement('link')
	bootstrapCSSLink.rel='stylesheet'
	bootstrapThemeCSSLink.rel='stylesheet'
	bootstrapCSSLink.href= '../node_modules/bootstrap/dist/css/bootstrap.min.css'
	bootstrapThemeCSSLink.href='../node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
	let headElement = document.getElementsByTagName('head')[0]
	headElement.appendChild(bootstrapCSSLink)
	headElement.appendChild(bootstrapThemeCSSLink)
}


$('#testList').on('click', function() {
	// need to pass some results here in the first agrument, either by
	// calling search, or hardcoding some values.
	const mockResults = [
		{repository: {id: 'jchartrand/aTest', fullName: 'a repo', description: 'A repo description'}},
		{repository: {id: 'jchartrand/cwrc-git-dialogs', fullName: 'another repo', description: 'Another repo description'}},
		{repository: {id: 'jchartrand/cwrc-git', fullName: 'yet another repo', description: 'hyet another repo description'}},
		{repository: {id: 'jchartrand/isicily', fullName: 'yet yet repo', description: 'oh repo description'}}
		]
	showResultList('resultsTest', mockResults)

})
