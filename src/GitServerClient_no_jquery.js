'use strict';

const Cookies = require('js-cookie');

let baseUrl = '';
function setServerURL(url) {
    baseUrl = url;
}

let isGitLab = false;
function useGitLab(useIt) {
    isGitLab = useIt;
}

function callCWRCGitWithToken(path, fetchOptions={}, params) {
    var url = new URL(`${baseUrl}${path}`);
    if (params !== undefined) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    if (fetchOptions.method === undefined) {
        fetchOptions.method = 'GET';
    }

    fetchOptions.mode = 'cors';
    fetchOptions.redirect = 'follow';

    fetchOptions.credentials = 'include';
    if (fetchOptions.headers === undefined || fetchOptions.headers['Content-Type'] === undefined) {
        fetchOptions.headers = {
            'Content-Type': 'application/json'
        }
    }
    const theJWT = Cookies.get('cwrc-token');
    if (theJWT) {
    	fetchOptions.headers['cwrc-token'] = theJWT;
    }

    return fetch(url, fetchOptions).then((response) => {
        return response.json().then((data)=>{
            return Promise.resolve(data);
        }, (error)=>{
            return Promise.reject(response);
        })
    },(error)=>{
        return Promise.reject(error);
    })
}

function getDetailsForGithubUser(user) {
    var url = `/users/${user}`;
    return callCWRCGitWithToken(url);
}

function getDetailsForOrg(org) {
    var url = `/orgs/${org}`;
    return callCWRCGitWithToken(url);
}

function createRepo(repo, description, isPrivate) {
    var url = `/user/repos`;
    if (isGitLab) {
        url=`/projects?name=`+repo
    }
	const fetchOptions = {
        method: 'POST',
        body: {repo, isPrivate, description}
    };
  	return callCWRCGitWithToken(url, fetchOptions);
}

function createOrgRepo(org, repo, description, isPrivate) {
    var url = `/orgs/${org}/repos`;
	const fetchOptions = {
        method: 'POST',
        body: {repo, isPrivate, description}
    };
    return callCWRCGitWithToken(url, fetchOptions);
}

function getReposForGithubUser(githubName, page = 1, per_page = 20) {
    var url = `/users/${githubName}/repos`;
    if (isGitLab) {
        url=`/users/${githubName}/projects`;
    }
    return callCWRCGitWithToken(url, {}, {page, per_page});
}

function getReposForAuthenticatedGithubUser(page, per_page, affiliation) {
    if (Cookies.get('cwrc-token')) {
        var url = `/user/repos`;
        if (isGitLab) {
            url= `/projects`;
        }
        return callCWRCGitWithToken(url, {}, {page, per_page, affiliation}).then(result=>result);
    } else {
        return Promise.reject("Not logged in!");
    }
}

function getRepoContents(githubName) {
    var url = `/repos/${githubName}`;
    if (isGitLab) {
        url= `/projects/'${githubName}/repository/tree`;
    }
	return callCWRCGitWithToken(url).then(result=>{
		return result
	}, error=>{
		console.log('the error in gitserverclient.getRepoContents:');
		console.log(error)
		return error
	});
}

function getRepoContentsByDrillDown(githubName) {
    var url = `/repos/${githubName}/full`;
    if (isGitLab) {
        url = `/projects/${githubName}/full`;
    }
	return callCWRCGitWithToken(url);
}

// repoName here is the combined owner/repo, e.g., 'jchartrand/someRepoName'

function getDoc(repoName, branch, path){
    var url = `/repos/${repoName}/contents`
    if (isGitLab) {
        url = `/projects/${repoName}/repository/files/${encodeURI(path)}/raw?ref=master`
    }
    return callCWRCGitWithToken(url, {}, {branch, path});
}

function getInfoForAuthenticatedUser() {
    if (Cookies.get('cwrc-token')) {
        var url = `/users`;
        if (isGitLab) {
            url = `/users`;
        }
        return callCWRCGitWithToken(url).then(result=>result.data);
    } else {
        return Promise.reject("Not logged in!");
    }
}

function getPermissionsForGithubUser(owner, repo, username) {
    var url = `/repos/${owner}/${repo}/collaborators/${username}/permission`;
    return callCWRCGitWithToken(url).then(result=>result.data.permission,(fail)=>'none')
}

// sha is optional.
// If provided, the doc will be updated against that SHA.
// If not, and there is an existing doc, the file will be updated against the latest SHA in the repo.

// TODO this doesn't work in this non-jquery version
function saveDoc(repo, path, content, branch, message, sha) {
    var data = {content, sha, branch, path, message};
    var url = `/repos/${repo}/doc`
    if (isGitLab) {
        url = `/projects/${repo}/repository/files/${path}`
    }
    return callCWRCGitWithToken(url, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: data})
}

function saveAsPullRequest(repo, path, content, branch, message, title, sha) {
    var url = `/repos/${repo}/pr`;
	var data = {sha, branch, path, message, content, title}

	return callCWRCGitWithToken(url, {method: 'PUT', body: data})
}

function getTemplates() {
    var url = `/templates`;
    return callCWRCGitWithToken(url).then(result=>result.data)
}

function getTemplate(templateName) {
    var url = `/templates/${templateName}`;
    return callCWRCGitWithToken(url, {'Content-Type': 'text/xml'})
}

function searchCode(query, per_page, page) {
    var url = `/search/code`;
    if (isGitLab) {
        url = `/search?scope=projects`;
    }
    return callCWRCGitWithToken(url, {}, {q: query, page, per_page}).then(result=>{
        return result
    })
}

function searchRepos(query, per_page, page) {
    var url = `/search/repositories`;
    return callCWRCGitWithToken(url, {}, {q: query, page, per_page}).then(result=>{
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
   

