/**
 *  @license
 *    Copyright 2016 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';
const binaryCase    = require('binary-case');

module.exports = Translator;

function Translator(sansServerInstance) {
    return function (event, context, callback) {

        // define the server request
        const req = Translator.from(event);

        // make the request
        sansServerInstance.request(req)
            .then(res => {
                const event = Translator.to(res);
                console.log(event);
                callback(null, event)
            })
            .catch(err => {
                console.error(err.stack);
                callback(err, null)
            });
    };
}

Translator.from = function(event) {
    return {
        body: event.body || '',
        headers: event.headers || {},
        method: event.httpMethod || 'GET',
        path: event.path || '/',
        query: event.queryStringParameters || {}
    };
};

Translator.to = function(res) {
    const headers = {};

    if (res.error && typeof res.error === 'object') console.error(res.error.stack);

    // translate cookies into lambda headers (with unique header key case)
    res.cookies.forEach((cookie, index) => {
        const headerKey = binaryCase('set-cookie', index);
        if (headerKey === false) {
            console.error('Too many Set-Cookie headers for one AWS lambda response. Cannot set cookie: ' + cookie.name);
        } else {
            headers[headerKey] = cookie.serialized;
        }
    });

    // put response headers into lambda response headers
    Object.assign(headers, res.headers);

    return {
        body: res.body,
        headers: headers,
        statusCode: res.statusCode
    };
};