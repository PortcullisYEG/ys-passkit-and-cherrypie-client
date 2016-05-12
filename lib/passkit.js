/* Requires */
import  querystring from'querystring';
import  client from 'urllib';
import  Bluebird from 'bluebird';
import 'babel-polyfill';
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
  
 templateListPromise(template_id, req_data) {
    const _this = this;
    return new Bluebird((resolve, reject)=> {
      _this.templateList((err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }
  
  
  

  // Templates
  getTemplateFieldNames(template_id, callback) {
    this.doQuery('GET', '/template/' + template_id + '/fieldnames', {}, {}, callback);
  }

  getTemplateFieldNamesPromise(template_id) {
    const _this = this;
    return new Bluebird((resolve, reject)=> {
      _this.getTemplateFieldNames(template_id, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }



  getPassForTemplateSerialNumber(template_id, serialNumber, callback) {
    this.doQuery('GET', escape('/template/' + template_id + '/serial/'+ serialNumber), {}, {}, callback);
  }
  
  getPassForTemplateSerialNumberPromise(template_id, serialNumber) {
    const _this = this;
    return new Bluebird((resolve, reject)=> {
      _this.getPassesForTemplate(template_id, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }





  getPassesForTemplate(template_id, callback) {
    //"https://api.passkit.com/v1/template/{templateName}/passes"
    this.doQuery('GET', escape('/template/' + template_id + '/passes/'), {}, {}, callback);
  }
  
 getPassesForTemplatePromise(template_id) {
    const _this = this;
    return new Bluebird((resolve, reject)=> {
      _this.getPassesForTemplate(template_id, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }
  

  passIssue(template_id, req_data, callback) {
    this.doQuery('POST', escape('/pass/issue/template/' + template_id), req_data, {}, callback);
  }

  passIssuePromise(template_id, req_data) {
    const _this = this;
    return new Bluebird((resolve, reject)=> {
      _this.passIssue(template_id, req_data, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }

  invalidate(passId, callback) {
    this.doQuery('POST', escape('/pass/invalidate/passid/' + passId), {}, {}, callback);
  }

  invalidatePromise(passId) {
    const _this = this;
    return new Bluebird((resolve, reject) => {
      _this.invalidate(passId, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }



  invalidateTemplateSerialNumber(template, serialNumber, callback) {
    this.doQuery('GET', escape('/pass/invalidate/template/' + template + '/serial/' +serialNumber), {}, {}, callback);
  }

  invalidateTemplateSerialNumberPromise(template,serialNumber) {
    const _this = this;
    return new Bluebird((resolve, reject) => {
      _this.invalidateTemplateSerialNumber(template,serialNumber,(err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }




  update(unique_id, req_data, callback) {
    this.doQuery('PUT', escape('/pass/update/passid/' + unique_id + '/push'), req_data, {}, callback);
  }

  updatePromise(passId, data) {
    const _this = this;
    return new Bluebird((resolve, reject) => {
      _this.update(passId, data, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }

  updateTemplateSerialNumber(template,serialNumber, req_data, callback) {
    this.doQuery('PUT', escape('/pass/update/template/' + template + '/serial/' +serialNumber+ '/push'), req_data, {}, callback);
  }

  updateTemplateSerialNumberPromise(template,serialNumber, data) {
    const _this = this;
    return new Bluebird((resolve, reject) => {
      _this.updateTemplateSerialNumber(template,serialNumber, data, (err, result) => {
        if (err)
          reject(err);
        else
          resolve(result);

      });
    });
  }


  //  // Passes
  //  pass: {
  //    issue: function (template_id, req_data, callback) {
  //      doQuery('POST', escape('/pass/issue/template/' + template_id), req_data, {}, callback);
  //    },
  //
  //    invalidate: function (passId,callback) {
  //      doQuery('POST', '/pass/update/passid/' + passId, {}, {}, callback);
  //    },
  //
  //    update: function (unique_id, req_data, callback) {
  //      doQuery('PUT', escape('/pass/update/passid/' + unique_id + '/push'), req_data, {}, callback);
  //    }
  //  },
  //
  //  // Images
  //  image: {
  //    upload: function (type, req_data, callback) {
  //      doQuery('GET', escape('/image/add/' + type), req_data, {}, callback);
  //    },
  //
  //    get_details: function (id, req_data, callback) {
  //      doQuery('POST', escape('/image/' + id), req_data, {}, callback);
  //    }
  //
  //  }
  //
  //};
};
