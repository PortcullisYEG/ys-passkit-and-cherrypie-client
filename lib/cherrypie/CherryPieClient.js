'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Requires */
var CryptoJS = require('crypto-js');
var btoa = require('btoa');
var querystring = require('querystring');
var client = require('urllib');
var Bluebird = require('bluebird');
var request = require('superagent');
var fs = require('fs');
var path = require('path');

var default_options = {
    'connection_timeout': '10000',
    'connection_readtimeout': '30000',
    'url': 'https://api-pass.passkit.net',
    'apiKey': '',
    'apiSecret': '',
    'apiVersion': 'v2'
};

var TemplateImageNamesList = ['passbook-IconFile', 'passbook-LogoFile', 'passbook-StripFile', 'passbook-FooterFile', 'passbook-ThumbFile', 'passbook-BgFile', 'passbookRedeem-IconFile', 'passbookRedeem-LogoFile', 'passbookRedeem-StripFile', 'passbookRedeem-FooterFile', 'passbookRedeem-ThumbFile', 'passbookRedeem-BgFile'];

/**
 * this is CherriPieClient class
 */

var CherriPieClient = function () {
    function CherriPieClient(options) {
        _classCallCheck(this, CherriPieClient);

        this.opt = Object.assign({}, default_options, options);
        Bluebird.promisifyAll(this);
    }

    /**
     *  Function to retrive the default options
     * */


    _createClass(CherriPieClient, [{
        key: 'get_default_options',
        value: function get_default_options() {
            return this.opt;
        }

        /**
         *  Function to initialize options on Client
         *  */

    }, {
        key: 'setOptions',
        value: function setOptions(options) {
            if (options !== undefined && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
                this.opt = Object.assign({}, default_options, options);
            }
        }

        /**
         *
         * Generate token from  pair key & secret
         *
         * @param key
         * @param secret
         * @returns {string}
         */

    }, {
        key: 'generateJWT',
        value: function generateJWT(key, secret) {
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
            token[0] = this.base64url(JSON.stringify(header));
            // second part is generated from the JSON string of the body object
            token[1] = this.base64url(JSON.stringify(body));
            // thirs part is generated from the hash of token[0] joined with token[1] by a dot "."
            token[2] = this.genTokenSign(token, secret);

            // the token itself is just the three sections joined with dots "."
            return token.join(".");
            // make sure that the Authorisation header of the HTTP request contains "PKAuth " before the token string
        }

        /**
         *
         *  generate token sign
         *
         * @param token
         * @param secret
         * @returns {*}
         */

    }, {
        key: 'genTokenSign',
        value: function genTokenSign(token, secret) {
            if (token.length != 2) {
                return;
            }
            // generate the hash of (token[0] + "." + token[1])
            var hash = CryptoJS.HmacSHA256(token.join("."), secret);
            // convert the hash to base64
            var base64Hash = CryptoJS.enc.Base64.stringify(hash);
            // both of these functions are using google's crypto-js

            // convert the base64 string into an url safe string
            return this.urlConvertBase64(base64Hash);
        }

        /**
         *
         * @param input
         * @returns {*}
         */

    }, {
        key: 'base64url',
        value: function base64url(input) {
            // Encode to normal base64
            var base64String = btoa(input);
            // convert the base64 string into an url safe string
            return this.urlConvertBase64(base64String);
        }

        /**
         *
         * Converts url to Base64
         *
         * @param input
         * @returns {XML|string|void|*}
         */

    }, {
        key: 'urlConvertBase64',
        value: function urlConvertBase64(input) {
            // Remove padding equal characters
            var output = input.replace(/=+$/, '');
            // Replace characters according to base64url specifications
            output = output.replace(/\+/g, '-');
            output = output.replace(/\//g, '_');
            return output;
        }

        /**
         *
         *  Prepare base url for API requests
         *
         * @returns {string}
         */

    }, {
        key: 'getBaseUrl',
        value: function getBaseUrl() {
            return this.get_default_options().url + '/' + this.get_default_options().apiVersion;
        }

        /**
         *
         * Returns value for Authorization header
         *
         * @returns {string}
         */

    }, {
        key: 'getAuthorization',
        value: function getAuthorization() {
            return 'PKAuth ' + this.generateJWT(this.get_default_options().apiKey, this.get_default_options().apiSecret);
        }

        /**
         *
         * @param http_method
         * @param endpoint
         * @param req_data
         * @param http_options
         * @param callback
         */

    }, {
        key: 'doQuery',
        value: function doQuery(http_method, endpoint, req_data, http_options, callback) {
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
            if (!http_options.headers) {
                http_options.headers = {};
            }
            http_options.headers.Authorization = this.getAuthorization();
            http_options.headers.timeout = 30000;
            // Method
            http_options.method = http_method;

            // If method POST then append data
            if (http_method === 'POST' || http_method === 'PUT') {
                http_options.data = data;
            }

            client.request(this.getBaseUrl() + endpoint, http_options, function (err, data, res) {
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

        /**
         *
         * Create new campaign in cherry pie
         *
         * @param data {object} - Object with campaigns contains these props:
         * - name  {string} (required)  Your campaign’s unique identifier. The name must only contain letters, numbers or the underscore character. and cannot contain any spaces (e.g. Happy_birthday_2018). Please note, this identifier cannot be changed after the campaign is created.
         * - passbookCertId {string} (required)    This is the certificate ID that is generated by PassKit when you upload a certificate, you can check which certificates you have uploaded with the list certificates endpoint. Please note, the Certificate ID cannot be changed after the campaign is created.
         * - status {string} The value must be either ACTIVE, FROZEN, or INVALID. Default is ACTIVE.  The campaign status controls whether passes can be issued or not. ACTIVE - Enables passes to be issued.FROZEN - Passes cannot be issued, existing passes are not affected and this value can be changed back to ACTIVE. INVALID - Passes cannot be issued and all existing passes will be set to invalid. Once the INVALID value is set, it cannot be changed.
         * - displayName {string}    This is the human friendly version of your campaign name, this will be displayed to customers when they are looking to download their pass.
         * - description {string}    This is your campaign description. The description will be displayed when customers are downloading their pass. This value should detail the campaign offers and customer benefits.
         * - startDate {ISO8601 datetime} (required) The campaign start date. Passes cannot be issued before this time and date.
         * - meta    {JSONObject} Metadata to store in campaign level. This data is invisiable to users.
         * - endDate    {ISO8601 datetime}    The campaign end date. Passes cannot be issued after this date and time, and all existing passes will be set to voided.
         * - maxIssue    {integer}
         * @param callback {function} standart callback function(error,response);
         *
         */

    }, {
        key: 'createCampaign',
        value: function createCampaign(data, callback) {
            this.doQuery('POST', escape('/campaigns'), data, {}, callback);
        }

        /**
         *
         * Return all campaigns in Cherry Pie
         * @param callback {function} standart callback function(error,response);
         *
         */

    }, {
        key: 'getCampaigns',
        value: function getCampaigns(callback) {
            this.doQuery('GET', escape('/campaigns'), {}, {}, callback);
        }

        /**
         *
         * Return all templates for campaign with name
         * @param campaigName {string} campaign name
         * @param callback {function} standart callback function(error,response);
         *
         */

    }, {
        key: 'getCampaignTemplates',
        value: function getCampaignTemplates(campaignName, callback) {
            this.doQuery('GET', escape('/campaigns/' + campaignName + '/templates'), {}, {}, callback);
        }

        /**
         *
         * Return all certificates for client
         * @param callback {function} standart callback function(error,response);
         *
         */

    }, {
        key: 'getCetificates',
        value: function getCetificates(callback) {
            this.doQuery('GET', escape('/passbookCerts'), {}, {}, callback);
        }

        /**
         *
         * @param image  {string} (required)  Your campaign’s unique identifier. The name must only contain letters, numbers or the underscore character. and cannot contain any spaces (e.g. Happy_birthday_2018). Please note, this identifier cannot be changed after the campaign is created.
         * @param callback {function} standart callback function(error,response);
         *
         */

    }, {
        key: 'uploadImage',
        value: function uploadImage(image, callback) {
            var tmpFile = null;
            var agent1 = request.agent();
            agent1 = agent1.post(this.getBaseUrl() + '/images');

            if (typeof image === "string") agent1 = agent1.attach('image', image);
            /*
             if (image instanceof Buffer)
             fs.writeFileSync("/tmp/test", "Hey there!", function(err) {
             if(err) {
             return console.log(err);
             }
              console.log("The file was saved!");
             });
              agent1 = agent1.field('image', image);
             */

            agent1 = agent1.set("Authorization", this.getAuthorization());
            agent1 = agent1.end(function (err, res) {
                //  if (tmpFile)
                //     fs.unlinkSync(tmpFile);
                callback(err, res);
            });
            return agent1;
        }

        /**
         *
         * create template for campaign
         * @param data
         *
         *
         *
         *
         *
         * @param callback {function} standart callback function(error,response);
         *
         */

    }, {
        key: 'createTemplate',
        value: function createTemplate(data, callback) {

            var tmpFile = null;
            var agent1 = request.agent();
            agent1 = agent1.post(this.getBaseUrl() + '/templates');
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = TemplateImageNamesList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    if (typeof data[key] === "string") agent1 = agent1.attach(key, data[key]);
                }
                //agent1 = agent1.send(data.jsonBody);
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            agent1.field('jsonBody', JSON.stringify(data.jsonBody));
            agent1 = agent1.set("Authorization", this.getAuthorization());
            agent1 = agent1.end(function (err, res) {
                callback(err, res);
            });
            return agent1;
        }
    }, {
        key: 'getTemplate',
        value: function getTemplate(templateName, callback) {
            this.doQuery('GET', escape('/templates/' + templateName), {}, {}, callback);
        }

        /* PASS API */

    }, {
        key: 'createPass',
        value: function createPass(templateName, userDefinedId, dynamicData, recoveryEmail, callback) {

            /* TODO - browse images data and upload them in to  uploadImage and set paths */
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

            /* TODO - browse images data and upload them in to  uploadImage and set paths */

            var data = { templateName: templateName };
            if (userDefinedId) data.userDefinedId = userDefinedId;
            if (dynamicData) data.dynamicData = dynamicData;
            if (recoveryEmail) data.recoveryEmail = recoveryEmail;
            if (isInvalid) data.isInvalid = true;else data.isInvalid = false;

            if (isRedeemed) data.isRedeemed = true;else data.isRedeemed = false;

            this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
        }
    }, {
        key: 'redeemPass',
        value: function redeemPass(passId, callback) {
            var data = {};
            data.isRedeemed = true;
            this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
        }
    }, {
        key: 'invalidatePass',
        value: function invalidatePass(passId, callback) {
            var data = {};
            data.isInvalid = true;
            this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
        }
    }]);

    return CherriPieClient;
}();

module.exports = CherriPieClient;