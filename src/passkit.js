/* Requires */
import  querystring from 'querystring';
import  client from  'urllib';
import  Bluebird from  'bluebird';
const version = '0.1.9';

/* Create our default options */
let default_options = {
  'connection_timeout': '10000',
  'connection_readtimeout': '30000',
  'url': 'https://api.passkit.com',
  'apiKey': '',
  'apiSecret': '',
  'apiVersion': 'v1',
};

/* Main */
export default class PasskitSDK {

  constructor(options) {
    if (options !== undefined && typeof options === 'object') {
      let opt = default_options;
      for (var key in options) {
        opt[key] = options[key];
      }
      this.opt = opt;
    }
    Bluebird.promisifyAll(this);
  }

  /* User-Agent to be send into Headers request */
  //static user_agent = 'PassKIT/rest-sdk-nodejs ' + version + ' (node ' + process.version + '-' + process.arch + '-' + process.platform + ')';


  /* Function to retrive the default options */
  get_default_options() {
    return this.opt;
  }

  /* Function to initialize options on SDK */
  setOptions(options) {
    if (options !== undefined && typeof options === 'object') {
      this.opt = this.update_options(default_options, options);
    }
  }

  doQuery(http_method, endpoint, req_data, http_options_param, callback) {

    // Add version to resource
    var endpoint = '/' + this.get_default_options().apiVersion + endpoint;

    // Empty http_options (declare)
    var http_options = {};

    // JSON or QueryString
    var data = req_data;

    // If method is GET then encode as query string, otherwise as JSON-RPC
    if (http_method === 'GET') {
      if (typeof data !== 'string') {
        data = querystring.stringify(data);
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

    http_options.timeout=30000;

    client.request(this.get_default_options().url + endpoint, http_options, function (err, data, res) {
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


  configure(options) {
    this.setOptions(options);
  }

  // Templates
  templateList(callback) {
    this.doQuery('GET', '/template/list', {}, {}, callback);
  }

  // Templates
  getTemplateFieldNames(template_id, callback) {
    this.doQuery('GET', '/template/' + template_id + '/fieldnames', {}, {}, callback);
  }

  getTemplateFieldNamesFull(template_id, callback) {
    this.doQuery('GET', '/template/' + template_id + '/fieldnames/full', {}, {}, callback);
  }

  getPassForTemplateSerialNumber(template_id, serialNumber, callback) {
    this.doQuery('GET', escape('/template/' + template_id + '/serial/'+ serialNumber), {}, {}, callback);
  }

  getPassesForTemplate(template_id, callback) {
    //"https://api.passkit.com/v1/template/{templateName}/passes"
    this.doQuery('GET', escape('/template/' + template_id + '/passes/'), {}, {}, callback);
  }

  passIssue(template_id, req_data, callback) {
    this.doQuery('POST', escape('/pass/issue/template/' + template_id), req_data, {}, callback);
  }

  invalidate(passId, callback) {
    this.doQuery('POST', escape('/pass/invalidate/passid/' + passId), {}, {}, callback);
  }

  invalidateTemplateSerialNumber(template, serialNumber, callback) {
    this.doQuery('GET', escape('/pass/invalidate/template/' + template + '/serial/' +serialNumber), {}, {}, callback);
  }

  getPassByTemplateSerialNumber(template_id, serialNumber, callback) {
    this.doQuery('GET', escape('/pass/get/template/' + template_id + '/serial/'+ serialNumber), {}, {}, callback);
  }

  getPassByShareID(shareid, callback) {
    this.doQuery('GET', escape('/pass/shareid/' + shareid), {}, {}, callback);
  }

  getPassByID(passid, callback) {
    this.doQuery('GET', escape('/pass/get/passid/' + passid ), {}, {}, callback);
  }




  update(unique_id, req_data, callback) {
    this.doQuery('PUT', escape('/pass/update/passid/' + unique_id + '/push'), req_data, {}, callback);
  }


  updateTemplateSerialNumber(template,serialNumber, req_data, callback) {
    this.doQuery('PUT', escape('/pass/update/template/' + template + '/serial/' +serialNumber+ '/push'), req_data, {}, callback);
  }
};
