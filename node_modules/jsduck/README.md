# jsduck

[![Build Status](https://travis-ci.org/rwhogg/jsduck.svg?branch=feature%2Ftravis)](https://travis-ci.org/rwhogg/jsduck)

This is a Node.js-compatible wrapper for [jsduck](https://github.com/senchalabs/jsduck).

*NOTE* This package used to be called jsduck-from-js; the old name is deprecated, but this is a compatible upgrade.

## Installing
Add jsduck as a dev (probably) dependency:

```bash
$ npm install --save-dev jsduck;
```

## Usage

```js
var JSDuck = require("jsduck");
jsduck = new JSDuck(["--out", "tmp"]);
jsduck.doc(["test/dummy.js"]);
```

## License
Copyright © 2015 Bob W. Hogg. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
