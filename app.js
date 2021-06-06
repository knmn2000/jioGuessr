// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;
var cors_proxy = require('cors-anywhere');
cors_proxy
  .createServer({
    origin: 'https://jioguessr.netlify.app/',
    originWhitelist: [],
    removeHeaders: ['cookie', 'cookie2'],
  })
  .listen(port, host, function () {
    console.log('knmn2000 cors service running on' + host + ':' + port);
  });
