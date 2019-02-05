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

var Cookies = require('js-cookie');

function authenticate() {

	if (Cookies.get('cwrc-token')) {
		return true
	} else {
		$(document.body).append($.parseHTML(
			`<div id="githubAuthenticateModal" class="modal" style="display: block;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div id="menu" class="modal-body">
                            <div style="margin-bottom:2em">
                                <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Authenticate with GitHub</h4>
                            </div>
                            <div style="margin-top:1em">
                                <div id="cwrc-message" style="margin-top:1em">
                                    <p>You must first authenticate through GitHub to allow the CWRC-GitWriter 
                                    to make calls on your behalf.</p><p>CWRC does not keep any of your GitHub 
                                    information.  The GitHub token issued by GitHub is not stored on a CWRC server, 
                                    but is only submitted as a <a href="https://jwt.io/" rel="noopener noreferrer" target="_blank">JSON Web Token</a> 
                                    for each request you make.</p>
                                </div>
                            </div>
                            <div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
                                <div class="input-group" >
                                    <div class="input-group-btn" >
                                        <button type="button" id="git-oauth-btn" class="btn btn-success">Authenticate with GitHub</button>
                                    </div>
                                </div> <!--input group -->
                            </div>
                        </div><!-- /.modal-body --> 
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->`
		));

		$('#git-oauth-btn').click(function(event){
			window.location.href = "/github/authenticate";
		});

		return false
	}

}

export default authenticate
