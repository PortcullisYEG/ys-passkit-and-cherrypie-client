const {CherryPieClient} =require('../src/index.js');
const {expect} = require('chai');
const path = require('path');
const fs = require('fs');
const TIMEOUT = 20000;

const options = {
    apiKey: process.env.CHERRYPIE_API_KEY,
    apiSecret: process.env.CHERRYPIE_API_SECRET
};

const templateName = process.env.CHERRYPIE_TEST_OFFER;
const recoveryEmail = process.env.CHERRYPIE_TEST_RECOVERY_EMAIL ? process.env.CHERRYPIE_TEST_RECOVERY_EMAIL : null;
const client = new CherryPieClient(options);
const userDefinedId = `USER_${new Date().getTime()}`;
const userDefinedIdAsync = `USER_ASYNC_${new Date().getTime()}`;
let passId = null;
let passIdAsync = null;
let campaign = null;
let certificates = [];

const testImagePath = path.join(__dirname, "resources", "Generic.pass", "icon.png");

describe(`CherryPie for templateName=${templateName} and recoveryEmail ${recoveryEmail}`, () => {

    it('get certificates', function (done) {
        this.timeout(TIMEOUT);
        client.getCetificates(function (err, response) {
            console.log(JSON.stringify(response.body));
            certificates = response.body;
            done(err);
        });
    });

    it('upload image as file', function (done) {
        this.timeout(TIMEOUT);
        client.uploadImage(testImagePath, function (err, response, res) {
            console.log(JSON.stringify(err),null,2);
            console.log(JSON.stringify(response.body),null,2);
            console.log(JSON.stringify(res),null,2);
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
        client.createCampaign('TestCampaign', certificates[0].id, 'ACTIVE', 'TestCampaign', 'Some test campaigns', new Date(), {}, null, null, function (err, response) {
            campaign = response.body;
            done(err);
        });
    });


    it('get campaigns', function (done) {
        this.timeout(TIMEOUT);
        client.getCampaigns(function (err, response) {
            done(err);
        });
    });


    it('get templates for campaigns', function (done) {
        this.timeout(TIMEOUT);
        client.getCampaingTemplates(campaign.name, function (err, response) {
            if (err) {
                //console.error(err);
            } else {
                // console.log(JSON.stringify(response))
            }
            done(err);
        });
    });


    it('create pass', function (done) {
        this.timeout(TIMEOUT);
        client.createPass(templateName, userDefinedId, {}, recoveryEmail, function (err, response) {
            if (err) {
                //console.error(err);
            } else {
                //console.log(response.body)
                passId = response.body.id;
            }
            done(err);
        });
    });

    it('create pass async', function (done) {
        this.timeout(TIMEOUT);
        client.createPassAsync(templateName, userDefinedIdAsync, {}, recoveryEmail).then((result) => {
            //console.log(result)
            passIdAsync = result.body.id;
            done();
        }, (err) => {
            {
                //console.error(err);
                done(err);
            }
        });
    });

    it('get pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.getPass(passId, function (err, response) {
            if (err) {
                //console.error(err);
            } else {
                //console.log(response);
            }
            done(err);
        });
    });

    it('get pass instance by passID async', function (done) {
        this.timeout(TIMEOUT);
        client.getPassAsync(passIdAsync).then((result) => {
            //passId = result.body.id;
            done();
        }, (err) => {
            {
                // console.error(err);
                done(err);
            }
        });
    });


    it('redeem pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.redeemPass(passId, function (err, response) {
            if (err) {
                //console.error(err);
            } else {
                //console.log(response);
            }
            done(err);
        });
    });

    it('redeem pass instance by passID async', function (done) {
        this.timeout(TIMEOUT);
        client.redeemPassAsync(passIdAsync).then((result) => {
            //passId = result.body.id;
            //console.log(result)
            done();
        }, (err) => {
            {
                // console.error(err);
                done(err);
            }
        });
    });

    it('invalidate pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.invalidatePass(passId, function (err, response) {
            if (err) {
                //console.error(err);
            } else {
                //console.log(response);
            }
            done(err);
        });
    });

    it('invalidate pass instance by passID async', function (done) {
        this.timeout(TIMEOUT);
        client.invalidatePassAsync(passIdAsync).then((result) => {
            //passId = result.body.id;
            //console.log(result)
            done();
        }, (err) => {
            {
                // console.error(err);
                done(err);
            }
        });
    });

});