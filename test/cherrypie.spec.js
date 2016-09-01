const {CherryPieClient} =require('../src/index.js');
const {expect} = require('chai');
const path = require('path');
const fs = require('fs');
const TIMEOUT = 20000;
const templateJSON = require('./resources/cherrypie-template.json');
const campaignJSON = require('./resources/cherrypie-campaign.json');

const options = {
    apiKey: process.env.CHERRYPIE_API_KEY,
    apiSecret: process.env.CHERRYPIE_API_SECRET
};

const client = new CherryPieClient(options);

const recoveryEmail = process.env.CHERRYPIE_TEST_RECOVERY_EMAIL ? process.env.CHERRYPIE_TEST_RECOVERY_EMAIL : null;
const userDefinedId = `USER_${new Date().getTime()}`;
const userDefinedIdAsync = `USER_ASYNC_${new Date().getTime()}`;
let passId = null;
let passIdAsync = null;
let campaign = null;
let certificates = [];
let templates = [];
let template = null;

const testImagePath = path.join(__dirname, "resources", "Generic.pass", "icon.png");


function logger(data) {
    console.log(JSON.stringify(data, null, 2));
}


describe(`CherryPie`, () => {

    it('get certificates', function (done) {
        this.timeout(TIMEOUT);
        client.getCetificates(function (err, response) {
            logger(response.body);
            certificates = response.body;
            done(err);
        });
    });

    it('upload image as file', function (done) {
        this.timeout(TIMEOUT);
        client.uploadImage(testImagePath, function (err, response) {
            logger(response.body);
            done(err);
        });
    });

    /*
     it('upload image as buffer', function (done) {
     this.timeout(TIMEOUT);
     const buffer = fs.readFileSync(testImagePath);
     client.uploadImage(buffer, function (err, response) {
     console.log(JSON.stringify(response.body));
     done(err);
     });
     });
     */

    it('create campaign', function (done) {
        this.timeout(TIMEOUT);
        const time = '' + new Date().getTime();
        campaignJSON.passbookCertId = certificates[0].id;
        campaignJSON.name = 'campaigntest' + time;
        campaignJSON.displayName = 'campaigntest' + time;
        client.createCampaign(campaignJSON, function (err, response) {
            logger(response.body);
            campaign = response.body;
            done(err);
        });
    });


    it('get campaigns', function (done) {
        this.timeout(TIMEOUT);
        client.getCampaigns(function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('create template generic', function (done) {
        this.timeout(TIMEOUT);
        const time = '' + new Date().getTime();
        templateJSON.campaignName = campaign.name;
        templateJSON.name = 'templatetest' + time;
        const data = {
            jsonBody: templateJSON,
            'passbook-IconFile': path.join(__dirname, "resources", "Generic.pass", "icon.png"),
            'passbook-LogoFile': path.join(__dirname, "resources", "Generic.pass", "logo.png"),
            // 'passbook-StripFile': path.join(__dirname,"resources","Event.pass","logo.png"),
            // 'passbook-FooterFile',
            'passbook-ThumbFile': path.join(__dirname, "resources", "Generic.pass", "thumbnail.png"),
            //  'passbook-BgFile',
            'passbookRedeem-IconFile': path.join(__dirname, "resources", "Generic.pass", "icon.png"),
            'passbookRedeem-LogoFile': path.join(__dirname, "resources", "Generic.pass", "logo.png"),
            //  'passbookRedeem-StripFile',
            //  'passbookRedeem-FooterFile',
            'passbookRedeem-ThumbFile': path.join(__dirname, "resources", "Generic.pass", "thumbnail.png"),
            // 'passbookRedeem-BgFile'
        };


        client.createTemplate(data, function (err, response) {
            logger(response.body);
            template = response.body;
            done(err);
        });
    });


    it('get template', function (done) {
        this.timeout(TIMEOUT);
        client.getTemplate(template.name, function (err, response) {
            logger(response.body);
            // templates = response.body;
            done(err);
        });
    });



    it('get templates for campaigns', function (done) {
        this.timeout(TIMEOUT);
        client.getCampaignTemplates(campaign.name, function (err, response) {
            logger(response.body);
            templates = response.body;
            done(err);
        });
    });


    it('create pass', function (done) {
        this.timeout(TIMEOUT);
        client.createPass(template.name, userDefinedId, {
            "points": "10"
        }, recoveryEmail, function (err, response) {
            logger(response.body);
            passId = response.body.id;
            done(err);
        });
    });

    it('get pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.getPass(passId, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('redeem pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.redeemPass(passId, function (err, response) {
            logger(response.body);
            done(err);
        });
    });

    it('invalidate pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.invalidatePass(passId, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


});