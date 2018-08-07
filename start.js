/*
Copyright 2018 New Vector Ltd

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

const assert = require('assert');
const RiotSession = require('./src/session');

const signup = require('./src/tests/signup');
const join = require('./src/tests/join');
const createRoom = require('./src/tests/create-room');
const acceptServerNoticesInviteAndConsent = require('./src/tests/server-notices-consent');

const homeserver = 'http://localhost:8008';
const riotserver = 'http://localhost:5000';

let consoleLogs = null;
let xhrLogs = null;
let globalPage = null;

async function runTests() {
  console.log("running tests ...");
  const options = {};
  if (process.env.CHROME_PATH) {
    const path = process.env.CHROME_PATH;
    console.log(`(using external chrome/chromium at ${path}, make sure it's compatible with puppeteer)`);
    options.executablePath = path;
  }

  const alice = await RiotSession.create("alice", options, riotserver);

  consoleLogs = alice.logConsole();
  xhrLogs = alice.logXHRRequests();
  
  process.stdout.write(`* signing up as ${alice.username} ... `);
  await signup(alice, alice.username, 'testtest');
  process.stdout.write('done\n');

  const noticesName = "Server Notices";
  process.stdout.write(`* accepting "${noticesName}" and accepting terms & conditions ... `);
  await acceptServerNoticesInviteAndConsent(alice, noticesName);
  process.stdout.write('done\n');

  const room = 'test';
  process.stdout.write(`* creating room ${room} ... `);
  await createRoom(alice, room);
  process.stdout.write('done\n');

  await alice.close();
}

function onSuccess() {
  console.log('all tests finished successfully');
}

async function onFailure(err) {

  let documentHtml = "no page";
  if (globalPage) {
    documentHtml = await globalPage.content();
  }

  console.log('failure: ', err);
  console.log('console.log output:');
  console.log(consoleLogs.logs());
  console.log('XHR requests:');
  console.log(xhrLogs.logs());
  console.log('document html:');
  console.log(documentHtml);
  
  process.exit(-1);
}

runTests().then(onSuccess, onFailure);