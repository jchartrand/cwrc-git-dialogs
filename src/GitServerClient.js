'use strict';

let $ = window.cwrcQuery
if ($ === undefined) {
    $ = require('jquery');
}

const Cookies = require('js-cookie');

let baseUrl = '';
function setServerURL(url) {
    baseUrl = url;
}

let isGitLab = false;
function useGitLab(useIt) {
    isGitLab = useIt;
}

function callCWRCGitWithToken(ajaxConfig) {
    ajaxConfig.crossDomain = true;
    ajaxConfig.xhrFields = {withCredentials: true};
    ajaxConfig.headers = {};
    const theJWT = Cookies.get('cwrc-token');
    if (theJWT) {
    	ajaxConfig.headers['cwrc-token'] = theJWT;
    }
    return $.ajax(ajaxConfig);
}

function getDetailsForGithubUser(user) {
    var url = `${baseUrl}/users/${user}`;
	var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url:  url
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function getDetailsForOrg(org) {
    var url = `${baseUrl}/orgs/${org}`;
	var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url:  url
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function createRepo(repo, description, isPrivate) {
    var url = `${baseUrl}/user/repos`;
    if (isGitLab) {
        url=`${baseUrl}/projects?name=`+repo
    }
	const ajaxConfig = {
        type: 'POST',
        dataType: 'json',
        data: {repo, isPrivate, description },
        url: url
    };
  	return callCWRCGitWithToken(ajaxConfig);
}

function createOrgRepo(org, repo, description, isPrivate) {
	const ajaxConfig = {
        type: 'POST',
        dataType: 'json',
        data: {repo, isPrivate, description },
        url:  `${baseUrl}/orgs/${org}/repos`
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function getReposForGithubUser(githubName, page = 1, per_page = 20) {
    var url = `${baseUrl}/users/${githubName}/repos`;
    if (isGitLab) {
        url=`${baseUrl}/users/${githubName}/projects`;
    }
	var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url:  url,
		data: {page, per_page}
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function getReposForAuthenticatedGithubUser(page, per_page, affiliation) {
    if (Cookies.get('cwrc-token')) {
        var url = `${baseUrl}/user/repos`;
        if (isGitLab) {
            url= `${baseUrl}/projects`;
        }
        var ajaxConfig = {
            type: 'GET',
            dataType: 'json',
            url:  url,
	        data: {page, per_page, affiliation}
        };
        return callCWRCGitWithToken(ajaxConfig).then(result=>result);
    } else {
        return $.Deferred().reject("login").promise();
    }
}

function getRepoContents(githubName) {
    var url = `${baseUrl}/repos/${githubName}`;
    if (isGitLab) {
        url= `${baseUrl}/projects/'${githubName}/repository/tree`;
    }
	var ajaxConfig = {
		type: 'GET',
		dataType: 'json',
		url:  url
	};
	return callCWRCGitWithToken(ajaxConfig).then(result=>{
		return result
	}, error=>{
		console.log('the error in gitserverclient.getRepoContents:');
		console.log(error)
		return error
	});
}

function getRepoContentsByDrillDown(githubName) {
    var url = `${baseUrl}/repos/${githubName}/full`;
    if (isGitLab) {
        url = `${baseUrl}/projects/${githubName}/full`;
    }
	var ajaxConfig = {
		type: 'GET',
		dataType: 'json',
		url:  url
	};
	return callCWRCGitWithToken(ajaxConfig);
}

// repoName here is the combined owner/repo, e.g., 'jchartrand/someRepoName'

function getDoc(repoName, branch, path){
    var url = `${baseUrl}/repos/${repoName}/contents`
    if (isGitLab) {
        url = `${baseUrl}/projects/${repoName}/repository/files/${encodeURI(path)}/raw?ref=master`
    }
    const ajaxConfig = {
        type: 'GET',
        dataType: 'json',
	    data: {branch, path},
        url: url
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function getInfoForAuthenticatedUser() {
    if (Cookies.get('cwrc-token')) {
        var url = `${baseUrl}/users`;
        if (isGitLab) {
            url = `${baseUrl}/users`;
        }
        var ajaxConfig = {
            type: 'GET',
            dataType: 'json',
            url: url
        };
        return callCWRCGitWithToken(ajaxConfig).then(result=>result.data);
    } else {
        return $.Deferred().reject("login").promise();
    }
}

function getPermissionsForGithubUser(owner, repo, username) {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: `${baseUrl}/repos/${owner}/${repo}/collaborators/${username}/permission`
    };
    return callCWRCGitWithToken(ajaxConfig).then(result=>result.data.permission,(fail)=>'none')
}

// sha is optional.
// If provided, the doc will be updated against that SHA.
// If not, and there is an existing doc, the file will be updated against the latest SHA in the repo.
function saveDoc(repo, path, content, branch, message, sha) {
    var data = {content, sha, branch, path, message};
    var url = `${baseUrl}/repos/${repo}/doc`
    if (isGitLab) {
        url = `${baseUrl}/projects/${repo}/repository/files/${path}`
    }
    var ajaxConfig = {
        type: 'PUT',
        dataType: 'json',
        data: data,
        url: url
    };
    return callCWRCGitWithToken(ajaxConfig)
}

function saveAsPullRequest(repo, path, content, branch, message, title, sha) {
	var data = {sha, branch, path, message, content, title}

	var ajaxConfig = {
		type: 'PUT',
		dataType: 'json',
		data: data,
		url:  `${baseUrl}/repos/${repo}/pr`
	};
	return callCWRCGitWithToken(ajaxConfig)
}

function getTemplates() {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: `${baseUrl}/templates`
    };
    return callCWRCGitWithToken(ajaxConfig).then(result=>result.data)
}

function getTemplate(templateName) {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'xml',
        url: `${baseUrl}/templates/${templateName}`
    };
    return callCWRCGitWithToken(ajaxConfig)
}

function searchCode(query, per_page, page) {
    var url = `${baseUrl}/search/code`;
    if (isGitLab) {
        url = `${baseUrl}/search?scope=projects`;
    }
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: url,
	    data: {q: query, page, per_page}

    };
    return callCWRCGitWithToken(ajaxConfig).then(result=>{
        return result
    })
}

function searchRepos(query, per_page, page) {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: `${baseUrl}/search/repositories`,
	    data: {q: query, page, per_page}

    };
    return callCWRCGitWithToken(ajaxConfig).then(result=>{
    	return result
	})
}

module.exports = {
    setServerURL: setServerURL,
    useGitLab: useGitLab,
    getDetailsForGithubUser: getDetailsForGithubUser,
    getDetailsForOrg: getDetailsForOrg,
    getReposForGithubUser: getReposForGithubUser,
    getPermissionsForGithubUser: getPermissionsForGithubUser,
    getReposForAuthenticatedGithubUser: getReposForAuthenticatedGithubUser,
    saveDoc: saveDoc,
    saveAsPullRequest: saveAsPullRequest,
    createRepo: createRepo,
    createOrgRepo: createOrgRepo,
    getRepoContents: getRepoContents,
    getRepoContentsByDrillDown: getRepoContentsByDrillDown,
    getDoc: getDoc,
    getInfoForAuthenticatedUser: getInfoForAuthenticatedUser,
    getTemplates: getTemplates,
    getTemplate: getTemplate,
    searchCode: searchCode,
    searchRepos: searchRepos
}
   

