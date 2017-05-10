![Picture](http://www.cwrc.ca/wp-content/uploads/2010/12/CWRC_Dec-2-10_smaller.png)

# cwrc-git-dialogs

[![Travis](https://img.shields.io/travis/jchartrand/cwrc-git-dialogs.svg)](https://travis-ci.org/jchartrand/cwrc-git-dialogs)
[![Codecov](https://img.shields.io/codecov/c/github/jchartrand/cwrc-git-dialogs.svg)](https://codecov.io/gh/jchartrand/cwrc-git-dialogs)
[![version](https://img.shields.io/npm/v/cwrc-git-dialogs.svg)](http://npm.im/cwrc-git-dialogs)
[![downloads](https://img.shields.io/npm/dm/cwrc-git-dialogs.svg)](http://npm-stat.com/charts.html?package=cwrc-git-dialogs&from=2015-08-01)
[![GPL-2.0](https://img.shields.io/npm/l/cwrc-git-dialogs.svg)](http://opensource.org/licenses/GPL-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

1. [Overview](#overview)
1. [Demo](#demo)
1. [Installation](#installation)
1. [Use](#use)
1. [Development](#development)
1. [API](#api)

### Overview

Spawns dialogs for file listing, loading, and saving.  Meant to be used with [CWRC-GitWriter](https://github.com/jchartrand/CWRC-GitWriter).  Makes calls to [CWRC-GitServerClient](https://github.com/jchartrand/CWRC-GitServerClient), which in turn makes the actual calls to the [CWRC-GitServer](https://github.com/jchartrand/CWRC-GitServer), which then calls out to GitHub itself.

### Demo 

The [CWRC-GitWriter](https://github.com/jchartrand/CWRC-GitWriter) code bundles together the code in this repository together with the [CWRC-WriterBase](https://github.com/jchartrand/CWRC-WriterBase) and the [CWRC-GitServerClient](https://github.com/jchartrand/CWRC-GitServerClient) to make up the portion of the CWRC-Writer that runs in the web browser.  The server side code is handled by [CWRC-GitServer](https://github.com/jchartrand/CWRC-GitServer), which is an Express.js server.  Both parts are demonstrated in the [CWRC GitHub Sandbox](http://208.75.74.217/editor_github.html). The same code can be installed on any server to run your own instance.

### Installation

`npm install cwrc-git-dialogs`   

To simultaneously register as a dependency in your package.json:

`npm install cwrc-git-dialogs --save`   

or in short form:

`npm i -S cwrc-git-delegator`

### Use

The test directory contains [TAPE](https://github.com/substack/tape) tests that can help better understand the API. Also see [CWRC-GitWriter](https://github.com/jchartrand/CWRC-GitWriter) which fully uses the API.

### API

This module exports a javascript object with three methods:

```
    /**
     * Spawns a popup prompting the user to save the current document to a GitHub repository.
     */
    save(writer)

    /**
     * Spawns a popup prompting the user to load a document from a GitHub repository.
     */
    load(writer)

   /**
    * Returns true if the user is authenticated.  Redirects to Github OAuth url if not.
    */
    authenticate()
```

where the *writer* is an instance of the [CWRC-WriterBase](https://github.com/jchartrand/CWRC-WriterBase).  The constructor returns an object with the following methods:

### Development

An index.html and test/manual.js are provided along with a browserify/watchify script in the package.json to allow working with the dialogs in a local browser.  Browserify bundles up the manual.js script (and all code that it references) and puts the result in build/test.js which the index.html file loads.  

The gitServer has to be running at http://localhost/delegatortest, and the index.html
also has to be served from http://localhost/delegatortest.
    
One way to do that is to start the gitserver at localhost:3000 using `npm run start` and 
add the following to the local apache config:

```
    ProxyPass /dialogstest/github http://localhost:3000/github
    ProxyPassReverse /dialogstest/github http://localhost:3000/github
```

and then symlink the test directory from this project into the apache home directory,for example:

`sudo ln -s /Users/jc/cwrc/github/cwrc-git-dialogs dialogstest`

### Testing

There are [TAPE](https://github.com/substack/tape) tests in the test directory that can be browserified and run in a spawned web browser with [browser-run](https://github.com/juliangruber/browser-run).  This npm script will run browser-run with the Electron headless web browser that is packaged with browser-run:

```
npm run test:browser
```

or with:

```
npm run watch:browse
```

to rebuild the browserify build when source files change.

You can also force browser-run to use specific browsers (firefox, chrome, etc.) or have browser-run start listening on a given port so that you can then open any web browser you like to that port (e.g., http://localhost:2222).  This is also another way to work with the dialogs while developing, by running browser-run on a simple js file that loads the dialogs. 
