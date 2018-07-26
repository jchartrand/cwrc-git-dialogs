'use strict';

var prevJQuery = window.jQuery;
var $ = require('jquery');
window.jQuery = $;
require('bootstrap');
window.jQuery = prevJQuery;

var Cookies = require('js-cookie');
const parseLinks = require('parse-link-header');
var cwrcGit = require('cwrc-git-server-client');

var cwrcAppName = "CWRC-GitWriter" + "-web-app";

function createRepoForCurrentDoc(writer, repoName, repoDesc, isPrivate) {
	writer.event('savingDocument').publish();
	var annotations = "some annotations";
	var versionTimestamp = Math.floor(Date.now() / 1000);
	var docText = writer.converter.getDocumentContent(true);
	return cwrcGit.createCWRCRepo(repoName, repoDesc, isPrivate, docText, annotations, versionTimestamp)
		.done(function(result){
			setDocInEditor(writer, result);
			writer.event('documentSaved').publish(true)
		})
		.fail(function(errorMessage){
			writer.event('documentSaved').publish(false)
		})
}

function processSuccessfulSave(writer) {
	writer.dialogManager.show('message', {
		title: 'Document Save',
		msg: 'Saved successfully.'
	});
	writer.event('documentSaved').publish(true);
};

function saveDoc(writer) {
	writer.event('savingDocument').publish();
	var versionTimestamp = Math.floor(Date.now() / 1000);
	var docText = writer.converter.getDocumentContent(true);

	//  1.  MAYBE PUT THE VALIDATION CHECK HERE, BUT MAYBE PUT IT IN CWRCGIT?  PROBABLY BETTER HERE SINCE I ALREADY HAVE THE
	//  CALL TO THE VALIDATOR HERE VIA THE WRITER.  AND DONT' WANT TO PUT THAT INTO THE CWRCGIT.

	return cwrcGit.saveDoc(writer.repoName, writer.repoOwner, writer.parentCommitSHA, writer.baseTreeSHA, docText, versionTimestamp)
		.done(function(result){
			setDocInEditor(writer, result);
			processSuccessfulSave(writer)
			// writer.event('documentSaved').publish(true)
		})
		.fail(function(errorMessage){
			writer.event('documentSaved').publish(false)
		})
}



function save(writer){
	var el = writer.dialogManager.getDialogWrapper();
	$(el).append($.parseHTML(

		`<div id="githubSaveModal" class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                
                <div id="menu" class="modal-body">
                    
                    <div style="margin-bottom:2em">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                        <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Save</h4>
                    </div>

                    <div style="well" style="margin-top:1em;text-align:center">
                        <h5 id="save-cwrc-message">
                            This document is associated with the ${writer.repoOwner}/${writer.repoName} GitHub repository.  You may save to it, or save to a new repository.
                        </h5>
                    </div>

                    <form id="github-save-new-form" class="well collapse" style="margin-top:1em">
                                
                                    <div class="form-group">
                                        <label for="save-git-doc-name">Document Name</label>
                                        <small id="new-document-name-help" class="text-muted" style="margin-left:1em">
                                        The name for the document and also for the new Github repository that will be created for the document.
                                        </small>
                                        <input id="save-git-doc-name" type="text" class="form-control" aria-describedby="new-document-name-help"/>
                                    </div><!-- /form-group -->
                                
                                    <div class="form-group">
                                        <label for="save-git-doc-description">Description of document</label>
                                        <small id="new-document-description-help" class="text-muted" style="margin-left:1em">
                                              A short description of the document that will appear on the github page.
                                        </small>
                                        <textarea class="form-control" id="save-git-doc-description" rows="3" aria-describedby="new-document-description-help"></textarea>    
                                     </div><!-- /form-group -->
                                
                                    <div class="form-group">
                                        <div class="form-check">
                                            <label class="form-check-label">
                                                <input id="save-git-doc-private" type="checkbox" class="form-check-input" aria-describedby="new-document-private-help">
                                                Private
                                            </label>
                                            <small id="new-document-private-help" class="text-muted" style="margin-left:1em">
                                                  You may create a private repository if you have a paid Github account.
                                            </small>
                                        </div>
                                     </div><!-- /form-group -->
                                
                                    <div class="form-group">
                                        <button id="dismiss-save-new-btn" type="button" class="btn btn-default"  >Cancel</button>
                                        <button type="submit" value="Submit" id="create-doc-btn" class="btn btn-default">Create</button>
                                    </div>
                            
                    </form> 

                </div><!-- /.modal-body -->
                <div class="modal-footer">
                    <form id="github-save-form" style="margin-top:1em">
                            <div class="form-group">
                                <button id="save-doc-btn" class="btn btn-default">Save</button>
                                <button id="open-save-new-doc-btn" href="#github-save-new-form" class="btn btn-default"  data-toggle="collapse">Save to a new repository</button>
                                <button class="btn btn-default" data-dismiss="modal">Cancel</button>
                                
                            </div>              
                    </form>
                </div><!-- /.modal-footer -->
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->`));

	$(function () {
		$('[data-toggle="popover"]').popover()
	});

	$('#github-save-form').submit(function(event){
		event.preventDefault();
	});

	$('#github-save-new-form').submit(function(event){
		event.preventDefault();
		var repoName = $('#save-git-doc-name').val();
		var repoDesc = $('#save-git-doc-description').val();
		var isPrivate = $('#save-git-doc-private').checked;
		$('#githubSaveModal').modal('hide');
		createRepoForCurrentDoc(writer, repoName, repoDesc, isPrivate).then(
			function(success){
				//alert(success);
				// $('#githubSaveModal').modal('hide');
				$('#save-cwrc-message').text(`This document is associated with the ${writer.repoOwner}/${writer.repoName} GitHub repository.  You may save to it, or save to a new repository.`);
			},
			function(failure){
				console.log(failure);
				$('#save-cwrc-message').text("Couldn't save.").show()
			});
	});

	if (Cookies.get('cwrc-token')) {
		// the user should already be logged in if they've edited a doc.
		// So, don't need this check.  what I really want to check is if they've
		// already selected a repository.  if so, show the save button.  if not, hide the save button
		// and only show the save to new repo button.
		$('#open-save-new-doc-btn').show();
	} else {
		$('#open-save-new-doc-btn').hide();
	}

	$('#open-save-new-doc-btn').click(function(ev){$('#github-save-form').hide()});

	$('#dismiss-save-new-btn').click(function(ev){
		$('#github-save-form').show();
		$('#github-save-new-form').hide();
	});

	$('#githubSaveModal').modal({backdrop: 'static', keyboard: false}).on('hidden.bs.modal', function() {
		$(this).remove()
	});

	var data = $('#githubSaveModal').data('bs.modal');
	data.$backdrop.detach().appendTo(el);

	if (!writer.repoName) {
		$('#save-doc-btn').hide();
		$('#save-cwrc-message').text("This document isn't yet associated with a GitHub repository.");
	}
	$('#save-doc-btn').click(function(event){
		$('#githubSaveModal').modal('hide');
		saveDoc(writer).then(
			function(success){
				//$('#githubSaveModal').modal('hide');
			},
			function(failure){
				console.log("save failed, and the return value is: ");
				console.log(failure);
				//alert(failure);
			}
		);
	});
};

export default save
