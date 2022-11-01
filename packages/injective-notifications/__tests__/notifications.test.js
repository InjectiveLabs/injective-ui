'use strict';

const notifications = require('..');
const assert = require('assert').strict;

assert.strictEqual(notifications(), 'Hello from notifications');
console.info("notifications tests passed");
