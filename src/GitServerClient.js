import Cookies from 'js-cookie';
// let $ = window.cwrcQuery
// if ($ === undefined) $ = require('jquery');

let baseUrl = '';
const setServerURL = (url) => baseUrl = url;

let isGitLab = false;
const useGitLab = (useIt) => isGitLab = useIt;


const callCWRCGitWithToken = async (requestOptions) => {
    const url = requestOptions.url;
    const theJWT = Cookies.get('cwrc-token');
    if (theJWT) requestOptions.headers['cwrc-token'] = theJWT;

    const response = await fetch(url, requestOptions)
        .catch((err) => {
            console.log(err)
            return err;
        });

    return await response.json();

}

const getDetailsForGithubUser = async (user) => {
    const url = `${baseUrl}/users/${user}`;
    const response = await callCWRCGitWithToken({
        url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });
    return response;
}

const getDetailsForOrg = async (org) => {
    const url = `${baseUrl}/orgs/${org}`;
    const response = await callCWRCGitWithToken({
        url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });
    return response;
}

const createRepo = async (repo, description, isPrivate) => {
    let url = `${baseUrl}/user/repos`;
    if (isGitLab) url = `${baseUrl}/projects?name=${repo}`;

    const response = await callCWRCGitWithToken({
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            repo,
            isPrivate,
            description
        })
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;

}

const createOrgRepo = async (org, repo, description, isPrivate) => {

    const response = await callCWRCGitWithToken({
        url: `${baseUrl}/orgs/${org}/repos`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            repo,
            isPrivate,
            description
        })
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;

}

const getReposForGithubUser = async (githubName, page = 1, per_page = 20) => {
    let url = `${baseUrl}/users/${githubName}/repos`;
    if (isGitLab) url = `${baseUrl}/users/${githubName}/projects`;

    let parameters = '?';
    parameters += `page=${page}`
    parameters += `&per_page=${per_page}`;

    const response = await callCWRCGitWithToken({
        url: url + parameters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;

}

const getReposForAuthenticatedGithubUser = async (page, per_page, affiliation) => {

    if (!Cookies.get('cwrc-token')) throw (new Error());

    let url = `${baseUrl}/user/repos`;
    if (isGitLab) url = `${baseUrl}/projects`;

    let parameters = '?';
    parameters += `page=${page}`
    parameters += `&per_page=${per_page}`;
    parameters += `&affiliation=${affiliation}`

    const response = await callCWRCGitWithToken({
        url: url + parameters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response

}

const getRepoContents = async (githubName) => {
    let url = `${baseUrl}/repos/${githubName}`;
    if (isGitLab) url = `${baseUrl}/projects/'${githubName}/repository/tree`;

    const response = await callCWRCGitWithToken({
        url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log('the error in gitserverclient.getRepoContents:');
        console.log(err)
        return err
    });

    return response;

}

const getRepoContentsByDrillDown = async (githubName) => {
    let url = `${baseUrl}/repos/${githubName}/full`;
    if (isGitLab) url = `${baseUrl}/projects/${githubName}/full`;

    const response = await callCWRCGitWithToken({
        url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;
}

// repoName here is the combined owner/repo, e.g., 'jchartrand/someRepoName'
const getDoc = async (repoName, branch, path) => {
    let url = `${baseUrl}/repos/${repoName}/contents`
    if (isGitLab) url = `${baseUrl}/projects/${repoName}/repository/files/${encodeURI(path)}/raw?ref=master`

    let parameters = '?';
    parameters += `branch=${branch}`
    parameters += `&path=${path}`;

    const response = await callCWRCGitWithToken({
        url: url + parameters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;
}

const getInfoForAuthenticatedUser = async () => {

    if (!Cookies.get('cwrc-token'))  throw (new Error()); //return $.Deferred().reject('login').promise();

    let url = `${baseUrl}/users`;
    if (isGitLab) url = `${baseUrl}/users`;

    const response = await callCWRCGitWithToken({
        url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return err;
    });


    return response.data;

}

const getPermissionsForGithubUser = async (owner, repo, username) => {

    const response = await callCWRCGitWithToken({
        url: `${baseUrl}/repos/${owner}/${repo}/collaborators/${username}/permission`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return 'none';
    });

    return response.data.permission;

}

// sha is optional.
// If provided, the doc will be updated against that SHA.
// If not, and there is an existing doc, the file will be updated against the latest SHA in the repo.
const saveDoc = async (repo, path, content, branch, message, sha) => {
    let url = `${baseUrl}/repos/${repo}/doc`
    if (isGitLab) url = `${baseUrl}/projects/${repo}/repository/files/${path}`

    const response = await callCWRCGitWithToken({
        url,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            sha,
            branch,
            path,
            message
        })
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;

}

const saveAsPullRequest = async (repo, path, content, branch, message, title, sha) => {

    const response = await callCWRCGitWithToken({
        url: `${baseUrl}/repos/${repo}/pr`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            sha,
            branch,
            path,
            title,
            message
        })
    }).catch((err) => {
        console.log(err)
        return err;
    });

    return response;

}

const getTemplates = async () => {
    const response = await callCWRCGitWithToken({
        url: `${baseUrl}/templates`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return 'none';
    });

    return response.data;

}

const searchCode = async (query, per_page, page) => {
    let url = `${baseUrl}/search/code`;
    if (isGitLab) url = `${baseUrl}/search?scope=projects`;

    let parameters = '?';
    parameters += `query=${query}`
    parameters += `&page=${page}`;
    parameters += `&per_page=${per_page}`;

    const response = await callCWRCGitWithToken({
        url: url + parameters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return 'none';
    });

    return response;
}

const searchRepos = async (query, per_page, page) => {

    let parameters = '?';
    parameters += `query=${query}`
    parameters += `&page=${page}`;
    parameters += `&per_page=${per_page}`;

    const response = await callCWRCGitWithToken({
        url: `${baseUrl}/search/repositories` + parameters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log(err)
        return 'none';
    });

    return response;
}

export default {
    setServerURL,
    useGitLab,
    getDetailsForGithubUser,
    getDetailsForOrg,
    getReposForGithubUser,
    getPermissionsForGithubUser,
    getReposForAuthenticatedGithubUser,
    saveDoc,
    saveAsPullRequest,
    createRepo,
    createOrgRepo,
    getRepoContents,
    getRepoContentsByDrillDown,
    getDoc,
    getInfoForAuthenticatedUser,
    getTemplates,
    searchCode,
    searchRepos,
}