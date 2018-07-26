'use strict';

var prevJQuery = window.jQuery;
var $ = require('jquery');
window.jQuery = $;
require('bootstrap');
window.jQuery = prevJQuery;

function showExistingDocModal(writer) {
	var el = writer.dialogManager.getDialogWrapper();
	$(el).append($.parseHTML(
		`<div id="existing-doc-modal" class="modal fade">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div id="menu" class="modal-body">
                            <div style="margin-bottom:2em">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                                <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Existing Document</h4>
                            </div>
                            <div style="margin-top:1em">
                                <div id="cwrc-message" style="margin-top:1em">
                                    You have a document loaded into the editor.  Would you like to load a new document, and close your existing document?
                                    </a>
                                </div>
                            </div>
                            <div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
                                <div class="input-group" >
                                        <button type="button" class="btn btn-default" data-dismiss="modal" id="existing-doc-cancel-btn">Return to Existing Document</button>                                
                                        <button type="button" class="btn btn-default" id="existing-doc-continue-btn" >Continue to Load New Document</button>
                                    </div>
                                </div> <!--input group -->
                            </div>
                        </div><!-- /.modal-body --> 
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->`
	))

	$('#existing-doc-continue-btn').click(function(event){
		$('#existing-doc-modal').modal('hide');
		removeDocFromEditor(writer)
		dialogs.load(writer)
	})

	$('#existing-doc-modal').modal('show').
	on('shown.bs.modal', function () {
		$(".modal").css('display', 'block');
	}).
	on('hidden.bs.modal', function() {
		$(this).remove()
	})

	var data = $('#existing-doc-modal').data('bs.modal');
	data.$backdrop.detach().appendTo(el);
}

export default showExistingDocModal;
