![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

# cwrc-git-dialogs

[![Travis](https://img.shields.io/travis/cwrc/cwrc-git-dialogs.svg)](https://travis-ci.org/cwrc/cwrc-git-dialogs)
[![Codecov](https://img.shields.io/codecov/c/github/cwrc/cwrc-git-dialogs.svg)](https://codecov.io/gh/cwrc/cwrc-git-dialogs)
[![version](https://img.shields.io/npm/v/cwrc-git-dialogs.svg)](http://npm.im/cwrc-git-dialogs)
[![downloads](https://img.shields.io/npm/dm/cwrc-git-dialogs.svg)](http://npm-stat.com/charts.html?package=cwrc-git-dialogs&from=2015-08-01)
[![GPL-2.0](https://img.shields.io/npm/l/cwrc-git-dialogs.svg)](http://opensource.org/licenses/GPL-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

1. [Overview](#overview)
1. [Demo](#demo)
1. [Installation](#installation)
1. [API](#api)
1. [Use](#use)
1. [Development](#development)

### Overview

A suite of dialogs for loading, saving, and listing files.  Meant to be used in conjunction with [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter).  Relies upon an instance of [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) to make calls to GitHub.

### Demo 

The [CWRC-GitWriter Sandbox](https://cwrc-writer.cwrc.ca) is running an instance of [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter), which uses the NPM package published from this repository along with the code in [CWRC-WriterBase](https://github.com/cwrc/CWRC-WriterBase). There is a corresponding server component running [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) and [CWRC-Git](https://github.com/cwrc/CWRC-Git). The same code is easily (for someone with modest development experience) installed on any server to run your own instance.  If you are looking to put together your own CWRC-Writer, [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter) is a good place to start.

### Installation

`npm install cwrc-git-dialogs`

### API

Methods used by CWRC-WriterBase:

###### save(CWRC-WriterBase writer)
*Spawns a popup prompting the user to save the current document to a GitHub repository.*

###### load(CWRC-WriterBase writer)
*Spawns a popup prompting the user to load a document from a GitHub repository.*

###### getDocumentURI()
*Returns a string representing the URI of the current document.

###### getUserInfo()
*Returns an object with the following properties: userId, userName, userUrl.*

###### logOut()
*Removes the GitHub OAuth token and reloads the page.*

Additional configuration methods:

###### setServerURL(String url)
*Sets the URL for the location of the CWRC-GitServer instance.*

###### useGitLab(Boolean useIt)
*Whether to use GitLab API formatted calls. Defaults to false.*

### Use

When setting up CWRC-Writer, you register this module with a [CWRC-WriterBase](https://github.com/cwrc/CWRC-WriterBase) instance by passing it as a property on the `config` object used when instantiating the instance. After registering the module, CWRC-WriterBase will call this module's methods as required.

A simplified example:

```
var GitStorageDialogs = require('cwrc-git-dialogs');
var config = {
    storageDialogs: GitStorageDialogs
}
var CWRCWriter = require('cwrc-writer-base');
var writer = new CWRCWriter(config);
```

See [https://github.com/cwrc/CWRC-GitWriter/blob/master/src/js/app.js](https://github.com/cwrc/CWRC-GitWriter/blob/master/src/js/app.js) for the full example.

### Development

[CWRC-Writer-Dev-Docs](https://github.com/cwrc/CWRC-Writer-Dev-Docs) explains how to work with CWRC-Writer GitHub repositories, including this one.
