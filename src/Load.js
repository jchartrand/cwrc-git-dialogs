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
import initializeFileUploadComponent from "./FileUpload.js";
import showPagination from "./Paginator.js";
import showExistingDocModal from "./ExistingDocModal.js";

var Cookies = require('js-cookie');
const parseLinks = require('parse-link-header');
var cwrcGit = require('cwrc-git-server-client');

// TODO
let writer;
let state;

function loadIntoWriter(xmlDoc) {
	writer.loadDocumentXML(xmlDoc);
}
function setDocInEditor(doc) {
	var xmlDoc = $.parseXML(doc);
	loadIntoWriter(xmlDoc);
}

function setBlankDocumentInEditor() {
	loadTemplate('TEI blank template.xml')
}

function loadTemplate(templateName) {
	state.repo = undefined;
	state.path = undefined;
	cwrcGit.getTemplate(templateName)
		.done(function( result ) {
			loadIntoWriter(result);
		}).fail(function(errorMessage) {
			console.log("in the getTemplate fail");
			console.log(errorMessage);
		});
}

function isCurrentDocValid() {
	return writer && writer.getDocRawContent && writer.getDocRawContent().includes('_tag')
}
function loadDoc(repo, path) {
	state.repo = undefined;
	state.path = undefined;
	return cwrcGit.getDoc(repo, 'master', path)
		.done(function( result ) {
			setDocInEditor(result.doc)
			state.repo = repo;
			state.path = path;
			console.log(state);
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

function fileSelectCB(repo, path){
	loadDoc(repo, path);
	$('#githubLoadModal').modal('hide');
}

function fileCB(textContents){
	loadIntoWriter(textContents)
	$('#githubLoadModal').modal('hide');
}

function createTargetElement(elementName) {
	if ($(`#${elementName}`).length == 0) {
		$(writer.dialogManager.getDialogWrapper()).append(`<div id="${elementName}"/>`)
	}
}

function initializePrivatePanel() {
	createTargetElement('github-private-doc-list')
	const resultListComponent = initializeReactResultComponent('github-private-doc-list', fileSelectCB);
	$('#private-tab').text(`${state.userId} repositories`)
	showReposForAuthenticatedUser('private-pagination', 1, resultListComponent, 'owner')

	$('#private-repo-owner').prop('checked', true);

	$('#github-private-form').submit(function(event){
		event.preventDefault();
		var privateSearchTerms = $('#private-search-terms').val();
		showSearchResults(writer.githubUser.login, privateSearchTerms, 'private-pagination', 1, resultListComponent);
	});

	$('#private-repo-owner, #private-repo-collaborator, #private-repo-member').change(function() {
		let affiliation = $('input[name=repo-filter]:checked').val();
		showReposForAuthenticatedUser('private-pagination', 1, resultListComponent, affiliation)
	})
}

function initializePublicPanel() {
	createTargetElement('github-public-doc-list')
	const resultListComponent = initializeReactResultComponent('github-public-doc-list', fileSelectCB);
	$('#github-public-form').submit(function(event){
		event.preventDefault();
		var gitName = $('#git-user').val();
		var publicSearchTerms = $('#public-search-terms').val();
		if (gitName && !publicSearchTerms) {
			showReposForGithubUser(gitName, 'public-pagination', 1, resultListComponent)
		} else {
			showSearchResults(gitName, publicSearchTerms, 'public-pagination', 1, resultListComponent);
		}
	});
}

function initializeUploadPanel() {
	createTargetElement('github-upload-form')
	const uploadComponent = initializeFileUploadComponent('github-upload-form', fileCB);
}

function showReposForAuthenticatedUser(pagingContainerId, requestedPage, resultComponent, affiliation) {
	cwrcGit.getReposForAuthenticatedGithubUser(requestedPage, 20, affiliation).then(results=>{
		const pagingCB = (requestedPage, resultComponent)=>showReposForAuthenticatedUser('private-pagination', requestedPage, resultComponent, affiliation)
		populateResultList(results, requestedPage, pagingContainerId, pagingCB, resultComponent)
	})
}

function showReposForGithubUser(user, pagingContainerId, requestedPage, resultComponent) {
	cwrcGit.getReposForGithubUser(user, requestedPage, 20).then(results=>{
		const pagingCB = (requestedPage, resultComponent)=>showReposForGithubUser(user, 'public-pagination', requestedPage, resultComponent)
		populateResultList(results, requestedPage, pagingContainerId, pagingCB, resultComponent)
	})
}

function populateResultList(results, requestedPage, pagingContainerId, pagingCB, reactResultComponentReference) {
	$('#cwrc-message').hide();
	reactResultComponentReference.updateList(results)
	if (pagingContainerId) displayPaging(pagingContainerId, results, requestedPage, pagingCB, reactResultComponentReference)
}

function showSearchResults(gitName, searchTerms, pagingContainerId, requestedPage, resultComponent) {
	// var queryString = cwrcAppName;
	var queryString = 'language:xml ';
	if (searchTerms) queryString += '"' + searchTerms + '" ';
	if (gitName) queryString += "user:" + gitName;
	const pagingCB = (requestedPage)=>showSearchResults(gitName, searchTerms, pagingContainerId, requestedPage, resultComponent)
	cwrcGit.search(queryString, 20, requestedPage)
		.done(function (results) {
			populateResultList(results, requestedPage, pagingContainerId, pagingCB, resultComponent)
		}).fail(function(errorMessage) {
		console.log('in the fail of the call to search in showRepos')
		$('#cwrc-message').text(`Couldn't find anything for your query.  Please try again.`).show()
	})
}

function showTemplates() {
	cwrcGit.getTemplates()
		.done(function( templates ) {
			populateTemplateList(templates, '#template-list')
		}).fail(function(errorMessage) {
		$('#cwrc-message').text(`Couldn't find the templates. Please check your connection or try again.`).show();
	});
}

function populateTemplateList(templates, listGroupId) {
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
			loadTemplate($templateName);

			$('#githubLoadModal').modal('hide');
		});

	});
}



function showLoadModal() {
	if ($('#githubLoadModal').length) {
		$('#githubLoadModal').modal('show');
	} else {
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
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#upload" role="tab">Load File or Text</a>
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

							 <!-- UPLOAD PANE -->
                            <div class="tab-pane" id="upload" role="tabpanel">
                                <div id="github-upload-form" class="list-group" style="padding-top:1em"></div>
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
			if (isCurrentDocValid()) {
				$('#githubLoadModal').modal('hide');
			} else {
				$('#cwrc-message').text('You must either load a document from GitHub or choose "Blank Document"').show()
			}
		});

		$('#blank-doc-btn').click(function (event) {
			$('#githubLoadModal').modal('hide');
			setBlankDocumentInEditor();
		});

		$('#github-new-form').submit(function (event) {
			event.preventDefault();
			var repoName = $('#git-doc-name').val();
			var repoDesc = $('#git-doc-description').val();
			var isPrivate = $('#git-doc-private').checked;
			$('#githubLoadModal').modal('hide');
			createRepoWithBlankDoc(repoName, repoDesc, isPrivate);
		});

		initializePrivatePanel();

		initializePublicPanel();

		initializeUploadPanel();

		showTemplates();

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


function load(_writer, _state, shouldOverwrite = false) {
	if (writer === undefined && state === undefined) {
		writer = _writer;
		state = _state;
	}

	if (writer.isDocLoaded && !shouldOverwrite) {
		showExistingDocModal(writer)
	} else {
		showLoadModal()
	}
}

export default load
