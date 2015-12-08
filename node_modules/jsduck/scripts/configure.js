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
/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
 
var path = require("path");
var spawnSync = require("spawn-sync");
var which = require("which").sync;
var _ = require("underscore");

console.log("Configuring JSDuck");

const INSTALL_JSDUCK_MESSAGE = "Please manually install JSDuck.";

// JSDuck gem
const GEM_NAME = "jsduck";

// try to find the executable and automatically install it if not found
try
{
    var duck = which(GEM_NAME);
    console.log("JSDuck already installed.");
}
catch(e)
{
    console.log("Could not find jsduck. Attempting to install.");
    try
    {
        var gem = which("gem");
    }
    catch(f)
    {
        console.log("Could not find gem executable.");
        console.log(INSTALL_JSDUCK_MESSAGE);
        process.exit(1);
    }
    var argArray = ["install", GEM_NAME];
    var gemProcess = spawnSync(gem, argArray);
    if(gemProcess.error)
    {
        console.log("Installation process failed");
        console.log(INSTALL_JSDUCK_MESSAGE);
        throw gemProcess.error;
    }
    else if(gemProcess.status == 1)
    {
        console.log("Installation failed with status " + gemProcess.status + ".");
        console.log("Trying again with sudo.");
        // try again with sudo
        try
        {
            var sudo = which("sudo");
        }
        catch(g)
        {
            console.log("Could not find sudo.");
            console.log(INSTALL_JSDUCK_MESSAGE);
            process.exit(1);
        }
        argArray = _.union([gem], argArray);
        gemProcess = spawnSync(sudo, argArray);
        if(gemProcess.error)
        {
            console.log("Could not install with sudo.");
            console.log(INSTALL_JSDUCK_MESSAGE);
            throw gemProcess.error;
        }
        else if(gemProcess.status != 0)
        {
            console.log("Sudo installation failed with status " + gemProcess.status);
        }
        else
        {
            console.log("Sudo installation successful!");
        }
    }
    else if(gemProcess.status)
    {
        console.log("Installation failed with status " + gemProcess.status);
    }
    else
    {
        console.log("Installation successful");
    }
}
