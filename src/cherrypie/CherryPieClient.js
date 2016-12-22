/* Requires */
const CryptoJS = require('crypto-js');
const btoa = require('btoa');
const querystring = require('querystring');
const client = require('urllib');
const Bluebird = require('bluebird');
const request = require('superagent');
const fs = require('fs');
const path = require('path');

const default_options = {
    'connection_timeout': '10000',
    'connection_readtimeout': '30000',
    'url': 'https://api-pass.passkit.net',
    'apiKey': 'VGfNlpqJfIWXJrHiWIHtsHlRJvHHZILc',
    'apiSecret': '8lLDXQ5wVlUq1lrvfYUgSHltnSeukbd1Gs7IOxxB1A4wwy7Pty2GP7sPzn7Ismqk8aHR8CNsTNUCsSbR03jYwRR0RcgCuwvCKEdplX8ibKLDj0iUSUOFdLLuAK66UWtp',
    'apiVersion': 'v2',
};


const TemplateImageNamesList = [
    'passbook-IconFile',
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

/**
 * this is CherryPieClient class
 */
class CherryPieClient {

    constructor(options) {
        this.opt = Object.assign({}, default_options, options);
        Bluebird.promisifyAll(this);
    }


    /**
     *  Function to retrive the default options
     * */
    get_default_options() {
        return this.opt;
    }


    /**
     *  Function to initialize options on Client
     *  */
    setOptions(options) {
        if (options !== undefined && typeof options === 'object') {
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
    generateJWT(key, secret) {
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
    genTokenSign(token, secret) {
        if (token.length != 2) {
            return
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
    base64url(input) {
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
    urlConvertBase64(input) {
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
    getBaseUrl() {
        return this.get_default_options().url + '/' + this.get_default_options().apiVersion;
    }

    /**
     *
     * Returns value for Authorization header
     *
     * @returns {string}
     */
    getAuthorization() {
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
    doQuery(http_method, endpoint, req_data, http_options, callback) {
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

        const url = this.getBaseUrl() + endpoint;
        const start = new Date();
        const self = this;
        this.log(`${http_method} ${url} start`);

        client.request(url, http_options, function (err, data, res) {
            if (err) {
                callback(err, null);
            } else {
                let response = {};
                self.log(`${http_method} ${url} end with status ${res.statusCode} in (${new Date().getTime() - start.getTime()}ms)`);
                response.httpStatusCode = res.statusCode;
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
    createCampaign(data, callback) {
        this.doQuery('POST', escape('/campaigns'), data, {}, callback);
    }


    /**
     *
     * Return campaign
     * @param campaigName {string} campaign name
     * @param callback {function} standart callback function(error,response);
     *
     */
    getCampaign(campaignName, callback) {
        this.doQuery('GET', escape('/campaigns/' + campaignName), {}, {}, callback);
    }


    /**
     *
     * Update campaign
     * @param campaigName {string} campaign name
     * @param data {object}
     * @param callback {function} standart callback function(error,response);
     *
     */
    updateCampaign(campaignName, data, callback) {
        this.doQuery('PUT', escape('/campaigns/' + campaignName), data, {}, callback);
    }

    /**
     *
     * Return all campaigns in Cherry Pie
     * @param callback {function} standart callback function(error,response);
     *
     */
    getCampaigns(callback) {
        this.doQuery('GET', escape('/campaigns'), {}, {}, callback);
    }

    /**
     *
     * Return all templates for campaign with name
     * @param campaigName {string} campaign name
     * @param callback {function} standart callback function(error,response);
     *
     */
    getCampaignTemplates(campaignName, callback) {
        this.doQuery('GET', escape('/campaigns/' + campaignName + '/templates'), {}, {}, callback);
    }

    /**
     *
     * Return all certificates for client
     * @param callback {function} standart callback function(error,response);
     *
     */
    getCetificates(callback) {
        this.doQuery('GET', escape('/passbookCerts'), {}, {}, callback);
    }

    /**
     *
     * @param image  {string} (required)  Your campaign’s unique identifier. The name must only contain letters, numbers or the underscore character. and cannot contain any spaces (e.g. Happy_birthday_2018). Please note, this identifier cannot be changed after the campaign is created.
     * @param callback {function} standart callback function(error,response);
     *
     */
    uploadImage(image, callback) {

        const url = this.getBaseUrl() + '/images';
        this.log(`POST ${url} start`);
        const start = new Date();
        const self = this;

        let agent1 = request.agent();
        agent1 = agent1.post(url);

        if (typeof image === "string")
            agent1 = agent1.attach('image', image);
        agent1 = agent1.set("Authorization", this.getAuthorization());
        agent1 = agent1.end((err, res)=> {
            self.log(`POST ${url} end with status ${res.statusCode} in (${new Date().getTime() - start.getTime()}ms)`);
            callback(err, res);
        });
        return agent1;
    }

    /**
     *
     * create template for campaign
     * @param data
     * @param callback {function} standart callback function(error,response);
     *
     */
    createTemplate(data, callback) {
        let agent1 = request.agent();
        const url = this.getBaseUrl() + '/templates';
        this.log(`POST ${url} start`);
        const start = new Date();
        const self = this;
        agent1 = agent1.post(url);
        for (let key of TemplateImageNamesList) {
            if (typeof data[key] === "string")
                agent1 = agent1.attach(key, data[key]);
        }
        agent1.field('jsonBody', JSON.stringify(data.jsonBody));
        agent1 = agent1.set("Authorization", this.getAuthorization());
        agent1 = agent1.end((err, res)=> {
            self.log(`POST ${url} end with status ${res.statusCode} in (${new Date().getTime() - start.getTime()}ms)`);
            callback(err, res);
        });
        return agent1;
    }

    updateTemplateWithImages(templateName, data, callback) {
        let agent1 = request.agent();
        const url = this.getBaseUrl() + '/templates/' + templateName
        this.log(`PUT ${url} start`);
        const start = new Date();

        agent1 = agent1.put(url);
        for (let key of TemplateImageNamesList) {
            if (typeof data[key] === "string")
                agent1 = agent1.attach(key, data[key]);
        }
        const body = JSON.stringify(data.jsonBody);
        agent1.field('jsonBody', body);
        agent1 = agent1.set("Authorization", this.getAuthorization());
        agent1 = agent1.end((err, res)=> {
            this.log(`PUT ${url} end with status ${res.statusCode} in (${new Date().getTime() - start.getTime()}ms)`);
            callback(err, res);
        });
        return agent1;
    }

    getTemplate(templateName, callback) {
        this.doQuery('GET', escape('/templates/' + templateName), {}, {}, callback);
    }

    updateTemplate(templateName, data, callback) {
        this.doQuery('PUT', escape('/templates/' + templateName), data, {}, callback);
    }

    pushTemplate(templateName, callback) {
        this.doQuery('PUT', escape('/templates/' + templateName + '/push'), {}, {}, callback);
    }

    /* PASS API */
    createPass(passData, callback) {
        /* TODO - browse images data and upload them in to  uploadImage and set paths */
        this.doQuery('POST', escape('/passes'), passData, {}, callback);
    }


    getPass(passId, callback) {
        this.doQuery('GET', escape('/passes/' + passId), {}, {}, callback);
    }

    getPassUserDefinedId(userDefinedId, campaignName, callback) {
        this.doQuery('GET', escape('/passes'), {
            userDefinedId: userDefinedId,
            campaignName: campaignName
        }, {}, callback);
    }

    updatePass(passId, passData, callback) {
        /* TODO - browse images data and upload them in to uploadImage and set paths */
        this.doQuery('PUT', escape('/passes/' + passId), passData, {}, callback);
    }

    updatePassUserDefinedId(userDefinedId, campaignName, passData, callback) {
        /* TODO - browse images data and upload them in to uploadImage and set paths */
        this.doQuery('PUT', escape('/passes?' + `userDefinedId=${userDefinedId}&campaignName=${campaignName}`), passData, {}, callback);
    }


    redeemPass(passId, callback) {
        this.doQuery('PUT', escape('/passes/' + passId + '/redeem'), {}, {}, callback);
    }

    invalidatePass(passId, callback) {
        let data = {};
        data.isInvalid = true;
        this.doQuery('PUT', escape('/passes/' + passId), data, {}, callback);
    }

    createPassesBatch(passesData, callback) {
        this.doQuery('POST', escape('/passesBatch'), passesData, {}, callback);
    }

    updatePassesBatch(passesBatch, callback) {
        this.doQuery('PUT', escape('/passesBatch'), passesBatch, {}, callback);
    }

    getPassesBatch(passIds, callback) {
        let ids = '';
        for (let id of passIds) {
            ids = ids + (ids !== '' ? ',' : '') + id;
        }
        this.doQuery('GET', escape(`/passesBatch?id=${ids}`), {}, {}, callback);
    }


    searchPasses(query, callback) {
        let agent1 = request.agent();

        const start = new Date();
        const self = this;
        const url = 'https://search.passkit.net/v1/passes';
        this.log(`POST ${url} start`);



        agent1 = agent1.post(url);
        agent1 = agent1.set("Authorization", this.getAuthorization());
        agent1 = agent1.send(query);
        agent1 = agent1.end((err, res)=> {
            this.log(`POST ${url} end with status ${res.statusCode} in (${new Date().getTime() - start.getTime()}ms)`);
            callback(err, res);
        });
        return agent1;

    }

    log(message) {
        if (process.env.CHERRYPIE_DEBUG === "true") {
            console.log(`CHERRY_PIE_CLIENT - [${new Date().toISOString()}] - ${message}`)
        }
    }

}
module.exports = CherryPieClient;
