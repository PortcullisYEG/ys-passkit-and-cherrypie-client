/* Requires */
const CryptoJS = require('crypto-js');
const btoa = require('btoa');
const querystring = require('querystring');
const client = require('urllib');
const Bluebird = require('bluebird');
const request = require('superagent');

const TemplateImageNamesList = ['passbook-IconFile',
    'passbook-LogoFile',
    'passbook-StripFile',
    'passbook-FooterFile',
    'passbook-ThumbFile',
    'passbook-BgFile',
    'passbookRedeem-IconFile',
    'passbookRedeem-LogoFile',
    'passbookRedeem-StripFile',
    'passbookRedeem-FooterFile',
    'passbookRedeem-ThumbFile',
    'passbookRedeem-BgFile'
];


function generateJWT(key, secret) {
    //header should always contain this information, our v2 api currently only accepts HS256 encryption
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    // get the current time in seconds
    const time_now = Math.floor(new Date().getTime() / 1000);
    /* For the expiry time, I've added 30 seconds, maximum allowed by our api is 1 minute, this is to ensure that if someone did intercept your api request, they would only be able to use your authorisation token for up to this time.
     Feel free to make it shorter, the request should usually reach our system within a few seconds. */
    const exp = time_now + 30;

    //the body should only contain the api key and expiry time
    const body = {
        "exp": exp,
        "key": key
    };

    //create token variable
    let token = [];
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
        return
    }
    // generate the hash of (token[0] + "." + token[1])
    var hash = CryptoJS.HmacSHA256(token.join("."), secret);
    // convert the hash to base64
    var base64Hash = CryptoJS.enc.Base64.stringify(hash);
    // both of these functions are using google's crypto-js

    // convert the base64 string into an url safe string
    return urlConvertBase64(base64Hash);
}


function base64url(input) {
    // Encode to normal base64
    var base64String = btoa(input);
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


/* Create our default options */
let default_options = {
    'connection_timeout': '10000',
    'connection_readtimeout': '30000',
    'url': 'https://api-pass.passkit.net',
    'apiKey': '',
    'apiSecret': '',
    'apiVersion': 'v2',
};

/* Main */
class CherriPieClient {

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

    doQuery(http_method, endpoint, req_data, http_options, callback) {

        // Add version to resource
        var endpoint = '/' + this.get_default_options().apiVersion + endpoint;

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
        http_options.headers.Authorization = 'PKAuth ' + generateJWT(this.get_default_options().apiKey, this.get_default_options().apiSecret);
        http_options.headers.timeout = 30000;
        // Method
        http_options.method = http_method;

        // If method POST then append data
        if (http_method === 'POST' || http_method === 'PUT') {
            http_options.data = data;
        }

        // console.log(this.get_default_options().url + endpoint, http_options);

        client.request(this.get_default_options().url + endpoint, http_options, function (err, data, res) {
            if (err) {
                callback(err, null);
            } else {
                let response = {};
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
                    default: {
                        response.httpStatusCode = res.statusCode;
                        response.body = JSON.parse(data.toString());
                        callback(null, response);
                    }
                }
            }
        });
    }


    configure(options) {
        this.setOptions(options);
    }


    /* Campaigns API methods */

    /**
     *
     * @param name  {string} (required)  Your campaign’s unique identifier. The name must only contain letters, numbers or the underscore character. and cannot contain any spaces (e.g. Happy_birthday_2018). Please note, this identifier cannot be changed after the campaign is created.
     * @param passbookCertId {string} (required)    This is the certificate ID that is generated by PassKit when you upload a certificate, you can check which certificates you have uploaded with the list certificates endpoint. Please note, the Certificate ID cannot be changed after the campaign is created.
     * @param status {string} The value must be either ACTIVE, FROZEN, or INVALID. Default is ACTIVE.  The campaign status controls whether passes can be issued or not. ACTIVE - Enables passes to be issued.FROZEN - Passes cannot be issued, existing passes are not affected and this value can be changed back to ACTIVE. INVALID - Passes cannot be issued and all existing passes will be set to invalid. Once the INVALID value is set, it cannot be changed.
     * @param displayName {string}    This is the human friendly version of your campaign name, this will be displayed to customers when they are looking to download their pass.
     * @param description {string}    This is your campaign description. The description will be displayed when customers are downloading their pass. This value should detail the campaign offers and customer benefits.
     * @param startDate {ISO8601 datetime} (required) The campaign start date. Passes cannot be issued before this time and date.
     * @param meta    {JSONObject} Metadata to store in campaign level. This data is invisiable to users.
     * @param endDate    {ISO8601 datetime}    The campaign end date. Passes cannot be issued after this date and time, and all existing passes will be set to voided.
     * @param maxIssue    {integer}
     * @param callback {function} standart callback function(error,response);
     *
     */

    createCampaign(name, passbookCertId, status, displayName, description, startDate, meta, endDate, maxIssue, callback) {

        const data = {
            name, passbookCertId, status, displayName, description, startDate, meta, endDate, maxIssue
        };

        this.doQuery('POST', escape('/campaigns'), data, {}, callback);
    }

    getCampaigns(callback) {
        this.doQuery('GET', escape('/campaigns'), {}, {}, callback);
    }

    getCampaingTemplates(campaignName, callback) {
        this.doQuery('GET', escape('/campaigns/' + campaignName + '/templates'), {}, {}, callback);
    }

    /* Apple Certificates API  */
    getCetificates(callback) {
        this.doQuery('GET', escape('/passbookCerts'), {}, {}, callback);
    }


    /* images*/

    /* upload image */

    /**
     *
     * @param image  {string} (required)  Your campaign’s unique identifier. The name must only contain letters, numbers or the underscore character. and cannot contain any spaces (e.g. Happy_birthday_2018). Please note, this identifier cannot be changed after the campaign is created.
     * @param callback {function} standart callback function(error,response);
     *
     */
    uploadImage(image, callback) {
        let agent1 = request.agent();
        agent1 = agent1.post(this.get_default_options().url + '/' + this.get_default_options().apiVersion + '/images')

        if (typeof image === "string")
            agent1 = agent1.attach('image', image);

        /*
        if (image instanceof Buffer)
            agent1 = agent1.field('image', image);
        */

        agent1 = agent1.set("Authorization", 'PKAuth ' + generateJWT(this.get_default_options().apiKey, this.get_default_options().apiSecret))
            .end(callback);
    }

    /* Template API*/


    createTemplate(images, jsonBody, callback) {


        this.doQuery('POST', escape('/passes'), data, {}, callback);
    }


    /*

     https://github.com/node-modules/formstream
     var urllib = require('urllib');
     var formstream = require('formstream');

     var form = formstream();
     form.file('file', __filename);
     form.field('hello', '你好urllib');

     var req = urllib.request('http://my.server.com/upload', {
     method: 'POST',
     headers: form.headers(),
     stream: form
     }, function (err, data, res) {
     // upload finished
     }); */


    /* PASS API */


    createPass(templateName, userDefinedId, dynamicData, recoveryEmail, callback) {

        /* TODO - browse images data and upload them in to  uploadImage and set paths */
        let data = {templateName};
        if (userDefinedId)
            data.userDefinedId = userDefinedId;
        if (dynamicData)
            data.dynamicData = dynamicData;
        if (recoveryEmail)
            data.recoveryEmail = recoveryEmail;
        this.doQuery('POST', escape('/passes'), data, {}, callback);
    }


    getPass(passId, callback) {
        this.doQuery('GET', escape('/passes/' + passId), {}, {}, callback);
    }


    updatePass(passId, templateName, userDefinedId, dynamicData, isInvalid, isRedeemed, recoveryEmail, callback) {

        /* TODO - browse images data and upload them in to  uploadImage and set paths */

        let data = {templateName};
        if (userDefinedId)
            data.userDefinedId = userDefinedId;
        if (dynamicData)
            data.dynamicData = dynamicData;
        if (recoveryEmail)
            data.recoveryEmail = recoveryEmail;
        if (isInvalid)
            data.isInvalid = true;
        else
            data.isInvalid = false;

        if (isRedeemed)
            data.isRedeemed = true;
        else
            data.isRedeemed = false;

        this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
    }

    redeemPass(passId, callback) {
        let data = {};
        data.isRedeemed = true;
        this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
    }

    invalidatePass(passId, callback) {
        let data = {};
        data.isInvalid = true;
        this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
    }


}


module.exports = CherriPieClient;
