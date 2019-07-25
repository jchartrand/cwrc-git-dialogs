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
<!---
1. [Development](#development)
1. [Testing](#testing)
-->

### Overview

A suite of dialogs for loading, saving, and listing files.  Meant to be used in conjunction with [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter).  Relies upon an instance of [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) to make calls to GitHub.

### Demo 

The [CWRC-GitWriter Sandbox](https://cwrc-writer.cwrc.ca) is running an instance of [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter), which uses the NPM package published from this repository along with the code in [CWRC-WriterBase](https://github.com/cwrc/CWRC-WriterBase). There is a corresponding server component running [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) and [CWRC-Git](https://github.com/cwrc/CWRC-Git). The same code is easily (for someone with modest development experience) installed on any server to run your own instance.  If you are looking to put together your own CWRC-Writer, [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter) is a good place to start.

### Installation

`npm install cwrc-git-dialogs`

### API

This module exports an object with the following methods:

###### save(CWRC-WriterBase writer)
*Spawns a popup prompting the user to save the current document to a GitHub repository.*

###### load(CWRC-WriterBase writer)
*Spawns a popup prompting the user to load a document from a GitHub repository.*

###### getUserInfo()
*Returns an object with the following properties: userId, userName, userUrl.*

###### logOut()
*Removes the GitHub OAuth token and reloads the page.*

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


<!---

### Development

A development.html and test/development.js are provided along with a browserify/watchify script (called 'browserify') in the package.json to allow working with the dialogs in a local browser.  Browserify bundles up the development.js script (and all code that it references) and puts the result in build/development.js which the development.html file loads. 

Run ```npm run browserify``` to trigger the browserify build. 

The gitServer has to be running at http://localhost/dialogstest, and the development.html
also has to be served from http://localhost/dialogstest.
    
One way to do that is to start the gitserver at localhost:3000 using `npm run start` and 
add the following to the local apache config:

```
    ProxyPass /dialogstest/github http://localhost:3000/github
    ProxyPassReverse /dialogstest/github http://localhost:3000/github
```

and then symlink the test directory from this project into the apache home directory,for example:

`sudo ln -s /Users/jc/cwrc/github/cwrc-git-dialogs dialogstest`

Now you can hit ```http://localhost/dialogstest/development.html``` in your browser and code away.

Browser-run is another way to work with the dialogs while developing, by running browser-run on a simple js file that loads the dialogs.  See [Testing](#testing) for more information about browser-run.

When you've got some changes to commit, please use `npm run cm` rather than `git commit`.  `npm run cm` will invoke [Commitizen](https://github.com/commitizen) to structure the commit messages using this standard: [conventional-changelog-angular](https://github.com/conventional-changelog-archived-repos/conventional-changelog-angular/blob/master/index.js).

### Testing

There are [TAPE](https://github.com/substack/tape) tests in the test directory that can be browserified and run in a spawned web browser via [browser-run](https://github.com/juliangruber/browser-run).  The following npm script, defined in package.json, will run browser-run with the Electron headless web browser that is packaged with browser-run:

```
npm run test:browser
```

or to rebuild the browserify build when source files change:

```
npm run watch:browse
```

You can force browser-run to use specific browsers (chrome, firefox, ie, phantom, safari  [default: "electron"]) with the b switch, like in the test:firefox script in package.json with:

```
npm run test:chrome
```

 Or have browser-run start listening on a given port so that you can then open any web browser you like to that port (e.g., http://localhost:2222):

```
npm run test:browser
```
## Code coverage

We generate code coverage statistics with [Istanbul](https://www.npmjs.com/package/istanbul) and publish them to [codecov.io] when our Travis build runs.  Hopefully you won't need to get into the mechanics of the code coverage generation, but if ever you do, read on...

Generating code coverage reports when running tests in the browser is slightly tricky.  Take a look at test:browser script in package.json:

"test:browser": "browserify -t browserify-istanbul test/browser.js | browser-run  -p 2222 --static .  | node test/extract-coverage.js | faucet",

You can see that we've inserted a browserify transform called [browserify-istanbul](https://www.npmjs.com/package/browserify-istanbul) which invokes the code coverage tool [Istanbul](https://www.npmjs.com/package/istanbul) to 'instrument' the code we're browserifying.  [Instrumentation](https://en.wikipedia.org/wiki/Instrumentation_(computer_programming)) adds instcructions to the original source code. In this case to allow the code coverage tool to determine which parts of the original source code are called by the tests, and which aren't (which leds us then calculate percentages of lines covered by tests).

After the tests run (in a browser via [browser-run](https://github.com/juliangruber/browser-run)), browserify-istanbul has put the code coverage information in a property of the global window object of the browser:

``` window.__coverage__```

To get that out after the tests have finished, we use the onFinish event provided by TAPE, which is run after ALL tests have run:

test.onFinish(()=>{
        console.log('# coverage:', JSON.stringify(window.__coverage__))
        window.close()
    })

By sending the coverage data to the console, the coverage data is attached to the output from our TAPE tests, but delineated with '# coverage:'  so that we can pull it out later.

Just after logging the coverage, we close the browser window (window.close()), which takes us back to our test:browser script, just after the browser-run command, where we now pipe the output to 'node test/extract-coverage.js'.  extract-coverage is gratefully borrowed from https://github.com/davidguttman/cssify/blob/master/test/extract-coverage.js.  It simply separates the code coverage information from the TAPE output (using the '# coverage;' marker we inserted earlier), writes the code coverage data to coverage/coverage.json, and sends the TAPE output along the pipe.

Now we've got code coverage information, but we have one more step to convert it to the lcov format that we can send to codecov.io (and that we can also browse in our own local web browser using the nice formatted version in coverage/lcov/index.html).  We convert with:

``` 
npm generate-coverage 
```

which for now is invoked in test:single after running test:electron

```
"test": "npm run test:electron && npm generate-coverage",
```

`test` is what we ask Travis to run when checking our build.  Note that Travis can only run the test against the headless browser Electron.

Finally we publish the coverage at codecov.io:

```
"report-coverage": "cat ./coverage/lcov.info | codecov"
```

-->


