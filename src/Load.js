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

import initializeReactResultComponent from "./ResultList.js";
import showPagination from "./Paginator.js";
import showExistingDocModal from "./ExistingDocModal.js";
import authenticate from './authenticate.js'

var Cookies = require('js-cookie');
const parseLinks = require('parse-link-header');
var cwrcGit = require('cwrc-git-server-client');

const cwrcAppName = "CWRC-GitWriter" + "-web-app";

var blankTEIDoc = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="https://cwrc.ca/schemas/cwrc_tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<?xml-stylesheet type="text/css" href="https://cwrc.ca/templates/css/tei.css"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:cw="http://cwrc.ca/ns/cw#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#">
	<text>
		<body>
			<div>
				<head>
					<title>Replace with your title</title>
				</head>
				<p>Replace with your text</p>
			</div>
		</body>
	</text>
</TEI>`;

function loadIntoWriter(writer, xmlDoc) {
	writer.loadDocumentXML(xmlDoc);
	writer.isDocLoaded = true;
}
function setDocInEditor(writer, result) {
	var xmlDoc = $.parseXML(result.doc);
	loadIntoWriter(writer, xmlDoc);
}

function setBlankDocumentInEditor(writer) {
	var defaultxmlDoc = $.parseXML(blankTEIDoc);
	loadIntoWriter(writer, defaultxmlDoc);
}

function loadTemplate(writer, templateName) {
	cwrcGit.getTemplate(templateName)
		.done(function( result ) {
			loadIntoWriter(writer, result);
		}).fail(function(errorMessage) {
			console.log("in the getTemplate fail");
			console.log(errorMessage);
		});
}

function isCurrentDocValid(writer) {
	return writer && writer.getDocRawContent && writer.getDocRawContent().includes('_tag')
}
function loadDoc(writer, repo, path) {
	return cwrcGit.getDoc(repo, 'master', path)
		.done(function( result ) {
			setDocInEditor(writer, result)
			writer.repoName = repo;
			writer.filePathInGithub = path;
		}).fail(function(errorMessage) {
			console.log("in the getDoc fail");
			console.log(errorMessage);
		});
}

function displayPaging(pagingContainerId, results, requestedPage, pagingCB, reactResultComponentReference) {
	var lastPage;
	if (results.meta.link) {
		const relLinks = parseLinks(results.meta.link);
		lastPage = relLinks.last ? parseInt(relLinks.last.page, 10) : requestedPage
	} else {
		lastPage = requestedPage
	}
	showPagination(pagingContainerId, requestedPage, lastPage, pagingCB, reactResultComponentReference)
}

function fileSelectCB(writer, repo, path){
	loadDoc(writer, repo, path);
	$('#githubLoadModal').modal('hide');
}

function getInfoForAuthenticatedUser(writer) {
	cwrcGit.getInfoForAuthenticatedUser()
		.then((info) => {
			writer.githubUser = info
			$('#private-tab').text(`${writer.githubUser.login} repositories`)
		}, (errorMessage) => {
			console.log("in the fail in getInfoAndReposForAuthenticatedUser")
			var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`
			console.log(message)
			$('#cwrc-message').text(message).show()
		});
}

function createTargetElement(elementName) {
	if ($(`#${elementName}`).length == 0) {
		$(writer.dialogManager.getDialogWrapper()).append(`<div id="${elementName}"/>`)
	}
}

function initializePrivatePanel(writer) {
	createTargetElement('github-private-doc-list')
	const resultListComponent = initializeReactResultComponent('github-private-doc-list', fileSelectCB.bind(null, writer));
	getInfoForAuthenticatedUser(writer);
	showReposForAuthenticatedUser(writer,'private-pagination', 1, resultListComponent, 'owner')

	$('#private-repo-owner').prop('checked', true);

	$('#github-private-form').submit(function(event){
		event.preventDefault();
		var privateSearchTerms = $('#private-search-terms').val();
		showSearchResults(writer, writer.githubUser.login, privateSearchTerms, 'private-pagination', 1, resultListComponent);
	});

	$('#private-repo-owner, #private-repo-collaborator, #private-repo-member').change(function() {
		let affiliation = $('input[name=repo-filter]:checked').val();
		showReposForAuthenticatedUser(writer, 'private-pagination', 1, resultListComponent, affiliation)
	})
}

function initializePublicPanel(writer) {
	createTargetElement('github-public-doc-list')
	const resultListComponent = initializeReactResultComponent('github-public-doc-list', fileSelectCB.bind(null, writer));
	$('#github-public-form').submit(function(event){
		event.preventDefault();
		var gitName = $('#git-user').val();
		var publicSearchTerms = $('#public-search-terms').val();
		if (gitName && !publicSearchTerms) {
			showReposForGithubUser(writer, gitName, 'public-pagination', 1, resultListComponent)
		} else {
			showSearchResults(writer, gitName, publicSearchTerms, 'public-pagination', 1, resultListComponent);
		}
	});
}

function showReposForAuthenticatedUser(writer, pagingContainerId, requestedPage, resultComponent, affiliation) {
	cwrcGit.getReposForAuthenticatedGithubUser(requestedPage, 20, affiliation).then(results=>{
		const pagingCB = (requestedPage, resultComponent)=>showReposForAuthenticatedUser(writer, 'private-pagination', requestedPage, resultComponent, affiliation)
		populateResultList(writer, results, requestedPage, pagingContainerId, pagingCB, resultComponent)
	})
}

function showReposForGithubUser(writer, user, pagingContainerId, requestedPage, resultComponent) {
	cwrcGit.getReposForGithubUser(user, requestedPage, 20).then(results=>{
		const pagingCB = (requestedPage, resultComponent)=>showReposForGithubUser(writer, user, 'public-pagination', requestedPage, resultComponent)
		populateResultList(writer, results, requestedPage, pagingContainerId, pagingCB, resultComponent)
	})
}

function populateResultList(writer, results, requestedPage, pagingContainerId, pagingCB, reactResultComponentReference) {
	$('#cwrc-message').hide();
	reactResultComponentReference.updateList(results)
	if (pagingContainerId) displayPaging(pagingContainerId, results, requestedPage, pagingCB, reactResultComponentReference)
}

function showSearchResults(writer, gitName, searchTerms, pagingContainerId, requestedPage, resultComponent) {
	// var queryString = cwrcAppName;
	var queryString = 'language:xml ';
	if (searchTerms) queryString += '"' + searchTerms + '" ';
	if (gitName) queryString += "user:" + gitName;
	const pagingCB = (requestedPage)=>showSearchResults(writer, gitName, searchTerms, pagingContainerId, requestedPage, resultComponent)
	cwrcGit.search(queryString, 20, requestedPage)
		.done(function (results) {
			populateResultList(writer, results, requestedPage, pagingContainerId, pagingCB, resultComponent)
		}).fail(function(errorMessage) {
		console.log('in the fail of the call to search in showRepos')
		$('#cwrc-message').text(`Couldn't find anything for your query.  Please try again.`).show()
	})
}

function showTemplates(writer) {
	cwrcGit.getTemplates()
		.done(function( templates ) {
			populateTemplateList(writer, templates, '#template-list')
		}).fail(function(errorMessage) {
		$('#cwrc-message').text(`Couldn't find the templates. Please check your connection or try again.`).show();
	});
}

function populateTemplateList(writer, templates, listGroupId) {
	$(function () {
		const listContainer = $(listGroupId);
		listContainer.empty()

		for (let template of templates) {
			listContainer.prepend(`
                <a id="gh_${template.name}" href="#" data-template="${template.name}" class="list-group-item git-repo">
                    <h4 class="list-group-item-heading">${template.name}</h4>
                </a>`);
		}

		$('#cwrc-message').hide();

		$(`${listGroupId} .list-group-item`).on('click', function() {
			var $this = $(this);
			var $templateName = $this.data('template');
			loadTemplate(writer, $templateName);

			$('#githubLoadModal').modal('hide');
		});

	});
}



function showLoadModal(writer) {
	if ($('#githubLoadModal').length) {
		$('#githubLoadModal').modal('show');
		console.log("an existing load modal was detected when trying to show it.")
	} else {
		console.log("about to show the load modal")
		var el = writer.dialogManager.getDialogWrapper();
		$(el).append($.parseHTML(
			`<div id="githubLoadModal" class="modal fade">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
     
                    <div id="menu" class="modal-body">
                        <div style="margin-bottom:2em">
                              <button id="close-load-btn" type="button" class="close"  aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                           <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Load From a Github Repository</h4>
                        </div>
                        <div style="margin-top:1em">
                            <div id="cwrc-message" class="text-warning" style="margin-top:1em">some text</div>
                        </div>


                            <!-- Nav tabs -->
                        <ul class="nav nav-tabs" role="tablist">
                          <li class="nav-item">
                            <a class="nav-link active" id="private-tab" data-toggle="tab" href="#private" role="tab">My Documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#public" role="tab">Search all public CWRC Github documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#templates" role="tab">CWRC Templates</a>
                          </li>
                          
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content">
                            <div class="tab-pane active" id="private" role="tabpanel">
                                <form role="search" id="github-private-form">
                                    <div class="row" style="margin-top:1em">
                                        <div class="col-xs-4">   
                                            <div class="input-group">
                                                <input type="text" class="form-control input-md" id="private-search-terms" name="private-search-terms"
                                                       placeholder="Search your documents"/>
                                                <span class="input-group-btn">
                                                    <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                </span>
                                            </div>  
                                        </div>
                                        <div class="col-xs-4">
                                        	
                                        </div>
                                        <div class="col-xs-4">
                                            <!--button id="open-new-doc-btn" href="#github-new-form"  class="btn btn-default"  style="float:right" data-toggle="collapse" >Blank Document</button-->
                                            <button id="blank-doc-btn" class="btn btn-default"  style="float:right" >Blank Document</button>
                                        </div>
                                    </div>
                                    <div style="margin-top:1em">
	                                    <label style="padding-right:1em">Show repositories for which I am: </label>
                                        <label class="radio-inline">
                                            <input type="radio" id="private-repo-owner" name="repo-filter" value="owner"/> Owner
										</label>
										<label class="radio-inline">
                                            <input type="radio" id="private-repo-collaborator" name="repo-filter" value="collaborator"/> Collaborator
										</label>
										<label class="radio-inline">
                                            <input type="radio" id="private-repo-member" name="repo-filter" value="organization_member"/> Organization Member
										</label>
									</div>
                                </form>
                          
                                <div id="github-private-doc-list" class="list-group" style="padding-left:4em;padding-right:4em;padding-top:1em;padding-bottom:3em"></div>
                                <div id="private-pagination" style="text-align:center"/>
                            </div><!-- /tab-pane -->
                            
                            <!-- PUBLIC REPOS PANE -->
                            <div class="tab-pane" id="public" role="tabpanel">
                                
                                    <form role="search" id="github-public-form">
                                      <div class="row" style="margin-top:1em">
                                            <div class="col-xs-4">   
                                                <div class="input-group">
                                                    <input type="text" class="form-control input-md" id="public-search-terms" name="public-search-terms"
                                                           placeholder="Search"/>
                                                    <span class="input-group-btn">
                                                        <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </span>
                                                </div>  
                                            </div>
                                            <div class="col-xs-4">
                                                <!--div class="input-group">
                                                    <input type="text" class="form-control input-md" id="public-topic-terms" name="public-topic-terms"
                                                           placeholder="Filter by GitHub topic"/>
                                                    <span class="input-group-btn">
                                                        <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </span>
                                                </div-->  
                                            </div>
                                            <div class="col-xs-4">
                                                <div class="input-group" >
                                                    <input id="git-user" type="text" class="form-control" placeholder="Limit to github user or organization" aria-describedby="git-user-addon"/>
                                                    <div class="input-group-btn" id="git-user-id-addon">
                                                        <button type="submit" value="Submit" id="new-user-btn" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </div>
                                                </div><!-- /input-group -->
                                            </div>
                                        </div>
                                    </form>

                               
                                <div id="github-public-doc-list" class="list-group" style="padding-top:1em"></div>
                                <div id="public-pagination" style="text-align:center"/>
                            </div><!-- /tab-pane -->

                            <!-- TEMPLATES PANE -->
                            <div class="tab-pane" id="templates" role="tabpanel">
                            
                                <div id="template-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->                     

                        </div> <!-- /tab-content -->
                    </div><!-- /.modal-body -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="cancel-load-btn">Cancel</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->`));

		// enable popover functionality - bootstrap requires explicit enabling
		$(function () {
			$('[data-toggle="popover"]').popover()
		});

		$('#close-load-btn').add('#cancel-load-btn').click(function (event) {
			// if the load popup window has been triggered then don't allow it to close unless we have
			// a valid document in the editor.
			if (isCurrentDocValid(writer)) {
				$('#githubLoadModal').modal('hide');
			} else {
				$('#cwrc-message').text('You must either load a document from GitHub or choose "Blank Document"').show()
			}
		});

		$('#blank-doc-btn').click(function (event) {
			$('#githubLoadModal').modal('hide');
			setBlankDocumentInEditor(writer);
		});

		$('#github-new-form').submit(function (event) {
			event.preventDefault();
			var repoName = $('#git-doc-name').val();
			var repoDesc = $('#git-doc-description').val();
			var isPrivate = $('#git-doc-private').checked;
			// console.log("should be about to close the repo");
			$('#githubLoadModal').modal('hide');
			createRepoWithBlankDoc(writer, repoName, repoDesc, isPrivate);
		});

		initializePrivatePanel(writer);

		initializePublicPanel(writer);

		showTemplates(writer);

		$('#open-new-doc-btn').show();
		$('#cwrc-message').hide();
		$('#private-tab').tab('show')
		$('#githubLoadModal').modal({backdrop: 'static', keyboard: false}).on('hidden.bs.modal', function () {
			$(this).data('bs.modal', null);
			$(this).remove()
			$(".modal-backdrop").remove();
		});

		var data = $('#githubLoadModal').data('bs.modal');
		data.$backdrop.detach().appendTo(el);
	}
}


function load(writer, shouldOverwrite = false) {
	if (authenticate()) {
		console.log('in the load metnhod of Load.js, about to check if doc is loaded.');
		(shouldOverwrite || ! writer.isDocLoaded)? showLoadModal(writer) : showExistingDocModal(writer)
	}
}

export default load
