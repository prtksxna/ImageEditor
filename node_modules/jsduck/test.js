// Copyright © 2015 Bob W. Hogg. All Rights Reserved.
//
// This file is part of jsduck.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var JSDuck = require("./jsduck.js");
var jsduck = new JSDuck(["--version"]);
console.log(jsduck.doc().output.toString());

// test: generate documentation for jsduck itself
jsduck = new JSDuck(["--out", "doc"]);
var result = jsduck.doc(["jsduck.js"]);
if(result.status != 0)
{
    console.error("Generating JSDuck's own documentation failed.");
    process.exit(result.status);
}

// test: generate documentation for a dummy test file
jsduck = new JSDuck(["--out", "tmp"]);
result = jsduck.doc(["test/dummy.js"]);
if(result.status != 0)
{
    console.error("Generating the dummy docs failed.");
    process.exit(result.status);
}
