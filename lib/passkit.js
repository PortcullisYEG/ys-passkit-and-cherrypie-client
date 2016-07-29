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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var version = '0.1.9';

/* Create our default options */
var default_options = {
  'connection_timeout': '10000',
  'connection_readtimeout': '30000',
  'url': 'https://api.passkit.com',
  'apiKey': '',
  'apiSecret': '',
  'apiVersion': 'v1'
};

/* Main */

var PasskitSDK = function () {
  function PasskitSDK(options) {
    _classCallCheck(this, PasskitSDK);

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


  _createClass(PasskitSDK, [{
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
      var http_options = {};

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
      http_options.digestAuth = this.get_default_options().apiKey + ':' + this.get_default_options().apiSecret;

      // Method
      http_options.method = http_method;

      // If method POST then append data
      if (http_method === 'POST' || http_method === 'PUT') {
        http_options.data = data;
      }

      //console.log(this.get_default_options().url + endpoint, http_options);

      http_options.timeout = 30000;

      _urllib2.default.request(this.get_default_options().url + endpoint, http_options, function (err, data, res) {
        if (err) {
          callback(err, null);
        } else {
          var response = {};
          response.httpStatusCode = res.statusCode;
          response.body = JSON.parse(data.toString());
          callback(null, response);
        }
      });
    }
  }, {
    key: 'configure',
    value: function configure(options) {
      this.setOptions(options);
    }

    // Templates

  }, {
    key: 'templateList',
    value: function templateList(callback) {
      this.doQuery('GET', '/template/list', {}, {}, callback);
    }

    // Templates

  }, {
    key: 'getTemplateFieldNames',
    value: function getTemplateFieldNames(template_id, callback) {
      this.doQuery('GET', '/template/' + template_id + '/fieldnames', {}, {}, callback);
    }
  }, {
    key: 'getTemplateFieldNamesFull',
    value: function getTemplateFieldNamesFull(template_id, callback) {
      this.doQuery('GET', '/template/' + template_id + '/fieldnames/full', {}, {}, callback);
    }
  }, {
    key: 'updateTemplate',
    value: function updateTemplate(template_id, fields, push, callback) {
      this.doQuery('GET', '/template/update/' + template_id + (push ? '/push' : ''), fields, {}, callback);
    }
  }, {
    key: 'resetTemplate',
    value: function resetTemplate(template_id, push, callback) {
      this.doQuery('GET', '/template/' + template_id + '/reset' + (push ? '/push' : ''), {}, {}, callback);
    }
  }, {
    key: 'getPassForTemplateSerialNumber',
    value: function getPassForTemplateSerialNumber(template_id, serialNumber, callback) {
      this.doQuery('GET', escape('/template/' + template_id + '/serial/' + serialNumber), {}, {}, callback);
    }
  }, {
    key: 'getPassesForTemplate',
    value: function getPassesForTemplate(template_id, callback) {
      //"https://api.passkit.com/v1/template/{templateName}/passes"
      this.doQuery('GET', escape('/template/' + template_id + '/passes/'), {}, {}, callback);
    }
  }, {
    key: 'passIssue',
    value: function passIssue(template_id, req_data, callback) {
      this.doQuery('POST', escape('/pass/issue/template/' + template_id), req_data, {}, callback);
    }
  }, {
    key: 'invalidate',
    value: function invalidate(passId, callback) {
      this.doQuery('POST', escape('/pass/invalidate/passid/' + passId), {}, {}, callback);
    }
  }, {
    key: 'invalidateTemplateSerialNumber',
    value: function invalidateTemplateSerialNumber(template, serialNumber, callback) {
      this.doQuery('GET', escape('/pass/invalidate/template/' + template + '/serial/' + serialNumber), {}, {}, callback);
    }
  }, {
    key: 'getPassByTemplateSerialNumber',
    value: function getPassByTemplateSerialNumber(template_id, serialNumber, callback) {
      this.doQuery('GET', escape('/pass/get/template/' + template_id + '/serial/' + serialNumber), {}, {}, callback);
    }
  }, {
    key: 'getPassByShareID',
    value: function getPassByShareID(shareid, callback) {
      this.doQuery('GET', escape('/pass/shareid/' + shareid), {}, {}, callback);
    }
  }, {
    key: 'getPassByID',
    value: function getPassByID(passid, callback) {
      this.doQuery('GET', escape('/pass/get/passid/' + passid), {}, {}, callback);
    }
  }, {
    key: 'update',
    value: function update(unique_id, req_data, callback) {
      this.doQuery('PUT', escape('/pass/update/passid/' + unique_id + '/push'), req_data, {}, callback);
    }
  }, {
    key: 'updateTemplateSerialNumber',
    value: function updateTemplateSerialNumber(template, serialNumber, req_data, callback) {
      this.doQuery('PUT', escape('/pass/update/template/' + template + '/serial/' + serialNumber + '/push'), req_data, {}, callback);
    }
  }]);

  return PasskitSDK;
}();

exports.default = PasskitSDK;
;