# sans-server-aws-lambda

An aws lambda handler function that sends requests through sans-server.

```js
const SansServer = require('sans-server');
const translator = require('sans-server-aws-lambda');

// configure the sans-server instance and add relevant middleware
const sansServer = SansServer();

// produce a lambda handler that uses the sans-server instance
exports.handler = translator(sansServer);
```