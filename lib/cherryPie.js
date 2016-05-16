'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* Requires */


var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _urllib = require('urllib');

var _urllib2 = _interopRequireDefault(_urllib);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _cryptoJs = require('crypto-js');

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

var _btoa = require('btoa');

var _btoa2 = _interopRequireDefault(_btoa);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function generateJWT(key, secret) {
  //header should always contain this information, our v2 api currently only accepts HS256 encryption
  var header = {
    "alg": "HS256",
    "typ": "JWT"
  };

  // get the current time in seconds
  var time_now = Math.floor(new Date().getTime() / 1000);
  /* For the expiry time, I've added 30 seconds, maximum allowed by our api is 1 minute, this is to ensure that if someone did intercept your api request, they would only be able to use your authorisation token for up to this time. 
  Feel free to make it shorter, the request should usually reach our system within a few seconds. */
  var exp = time_now + 30;

  //the body should only contain the api key and expiry time
  var body = {
    "exp": exp,
    "key": key
  };

  //create token variable
  var token = [];
  // all parts of the token need to be base 64 url encoded
  // first part is generated from the JSON string of the header object
  token[0] = base64url(JSON.stringify(header));
  // second part is generated from the JSON string of the body object
  token[1] = base64url(JSON.stringify(body));
  // thirs part is generated from the hash of token[0] joined with token[1] by a dot "."
  token[2] = genTokenSign(token, secret);

  // the token itself is just the three sections joined with dots "."
  return token.join(".");
  // make sure that the Authorisation header of the HTTP request contains "PKAuth " before the token string
}

function genTokenSign(token, secret) {
  if (token.length != 2) {
    return;
  }
  // generate the hash of (token[0] + "." + token[1])
  var hash = _cryptoJs2.default.HmacSHA256(token.join("."), secret);
  // convert the hash to base64
  var base64Hash = _cryptoJs2.default.enc.Base64.stringify(hash);
  // both of these functions are using google's crypto-js

  // convert the base64 string into an url safe string
  return urlConvertBase64(base64Hash);
}

function base64url(input) {
  // Encode to normal base64
  var base64String = (0, _btoa2.default)(input);
  // convert the base64 string into an url safe string
  return urlConvertBase64(base64String);
}

function urlConvertBase64(input) {

  // Remove padding equal characters
  var output = input.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  output = output.replace(/\+/g, '-');
  output = output.replace(/\//g, '_');

  return output;
}

/*  */
var version = '0.0.0';

/* Create our default options */
var default_options = {
  'connection_timeout': '10000',
  'connection_readtimeout': '30000',
  'url': 'https://api-pass.passkit.net',
  'apiKey': '',
  'apiSecret': '',
  'apiVersion': 'v2'
};

/* Main */

var CherriPieClient = function () {
  function CherriPieClient(options) {
    _classCallCheck(this, CherriPieClient);

    if (options !== undefined && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
      var opt = default_options;
      for (var key in options) {
        opt[key] = options[key];
      }
      this.opt = opt;
    }
    _bluebird2.default.promisifyAll(this);
  }

  /* User-Agent to be send into Headers request */
  //static user_agent = 'PassKIT/rest-sdk-nodejs ' + version + ' (node ' + process.version + '-' + process.arch + '-' + process.platform + ')';

  /* Function to retrive the default options */


  _createClass(CherriPieClient, [{
    key: 'get_default_options',
    value: function get_default_options() {
      return this.opt;
    }

    /* Function to initialize options on SDK */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
        this.opt = this.update_options(default_options, options);
      }
    }
  }, {
    key: 'doQuery',
    value: function doQuery(http_method, endpoint, req_data, http_options_param, callback) {

      // Add version to resource
      var endpoint = '/' + this.get_default_options().apiVersion + endpoint;

      // Empty http_options (declare)
      var http_options = {
        timeout: 30000
      };

      // JSON or QueryString
      var data = req_data;

      // If method is GET then encode as query string, otherwise as JSON-RPC
      if (http_method === 'GET') {
        if (typeof data !== 'string') {
          data = _querystring2.default.stringify(data);
        }
        if (data) {
          // add to resource and empty data
          endpoint = endpoint + "?" + data;
          data = "";
        }
      } else if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }

      // Auth with digest only!
      http_options.headers = { "Authorization": 'PKAuth ' + generateJWT(this.get_default_options().apiKey, this.get_default_options().apiSecret) };

      // Method
      http_options.method = http_method;

      // If method POST then append data
      if (http_method === 'POST' || http_method === 'PUT') {
        http_options.data = data;
      }

      // console.log(this.get_default_options().url + endpoint, http_options);

      _urllib2.default.request(this.get_default_options().url + endpoint, http_options, function (err, data, res) {
        if (err) {
          callback(err, null);
        } else {
          var response = {};
          response.httpStatusCode = res.statusCode;
          response.body = JSON.parse(data.toString());
          switch (res.statusCode) {
            case 400:
              return callback(new Error('Bad Request – Your request sucks'), response);
            case 401:
              return callback(new Error('Unauthorized – Your API key is wrong'), response);
            case 403:
              return callback(new Error('Forbidden – The request is for administrators only'), response);
            case 404:
              return callback(new Error('Not Found – The specified request or data could not be found'), response);
            case 500:
              return callback(new Error('Internal Server Error – We had a problem with our server.Try again later.'), response);
            case 503:
              return callback(new Error('Service Unavailable – We’re temporarially offline for maintanance.Please try again later.'), response);
            default:
              {
                response.httpStatusCode = res.statusCode;
                response.body = JSON.parse(data.toString());
                callback(null, response);
              }
          }
        }
      });
    }
  }, {
    key: 'configure',
    value: function configure(options) {
      this.setOptions(options);
    }
  }, {
    key: 'createPass',
    value: function createPass(templateName, userDefinedId, dynamicData, recoveryEmail, callback) {
      var data = { templateName: templateName };
      if (userDefinedId) data.userDefinedId = userDefinedId;
      if (dynamicData) data.dynamicData = dynamicData;
      if (recoveryEmail) data.recoveryEmail = recoveryEmail;
      this.doQuery('POST', escape('/passes'), data, {}, callback);
    }
  }, {
    key: 'getPass',
    value: function getPass(passId, callback) {
      this.doQuery('GET', escape('/passes/' + passId), {}, {}, callback);
    }
  }, {
    key: 'updatePass',
    value: function updatePass(passId, templateName, userDefinedId, dynamicData, isInvalid, isRedeemed, recoveryEmail, callback) {
      var data = { templateName: templateName };
      if (userDefinedId) data.userDefinedId = userDefinedId;
      if (dynamicData) data.dynamicData = dynamicData;
      if (recoveryEmail) data.recoveryEmail = recoveryEmail;
      this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
    }
  }]);

  return CherriPieClient;
}();

;

exports.default = CherriPieClient;