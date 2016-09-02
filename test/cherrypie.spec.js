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
let passId = null;
let campaign = null;
let certificates = [];
let templates = [];
let template = null;
let templateCoupon = null;
let passes = null;

const testImagePath = path.join(__dirname, "resources", "Generic.pass", "icon.png");


function logger(data) {
    if (process.env.LOG == "true")
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


    it('get campaign', function (done) {
        this.timeout(TIMEOUT);
        client.getCampaign(campaign.name, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('update campaign', function (done) {
        this.timeout(TIMEOUT);
        campaign.meta = {
            "myKey": 1234,
            "myKey2": "myData2"
        };
        client.updateCampaign(campaign.name, campaign, function (err, response) {
            logger(response.body);
            campaign = response.body;
            done(err);
        });
    });


    it('get campaign', function (done) {
        this.timeout(TIMEOUT);
        client.getCampaign(campaign.name, function (err, response) {
            logger(response.body);
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
        templateJSON.name = 'templategenerictest' + time;
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

    it('update template', function (done) {
        this.timeout(TIMEOUT);
        const data = {};
        data.meta = {
            "key1": 1234,
            "key2": "value2"
        };
        client.updateTemplate(template.name, data, function (err, response) {
            logger(response.body);
            done(err);
        });
    });

    it('get template', function (done) {
        this.timeout(TIMEOUT);
        client.getTemplate(template.name, function (err, response) {
            logger(response.body);
            done(err);
        });
    });

    it('update template with images generic', function (done) {
        this.timeout(TIMEOUT);
        const jsonBody = {};
        jsonBody.meta = {
            "key1": 12345,
            "key2": "value3"
        };
        const data = {
            jsonBody: jsonBody,
            'passbook-IconFile': path.join(__dirname, "resources", "Generic.pass", "icon.png"),
            'passbook-LogoFile': path.join(__dirname, "resources", "Generic.pass", "logo.png"),
            'passbook-ThumbFile': path.join(__dirname, "resources", "Generic.pass", "thumbnail.png"),
            'passbookRedeem-IconFile': path.join(__dirname, "resources", "Generic.pass", "icon.png"),
            'passbookRedeem-LogoFile': path.join(__dirname, "resources", "Generic.pass", "logo.png"),
            'passbookRedeem-ThumbFile': path.join(__dirname, "resources", "Generic.pass", "thumbnail.png"),
        };
        client.updateTemplateWithImages(template.name, data, function (err, response) {
            logger(response.body);
            done(err);
        });
    });

    it('get template', function (done) {
        this.timeout(TIMEOUT);
        client.getTemplate(template.name, function (err, response) {
            logger(response.body);
            done(err);
        });
    });

    it('create template coupon', function (done) {
        this.timeout(TIMEOUT);
        const time = '' + new Date().getTime();
        templateJSON.campaignName = campaign.name;
        templateJSON.name = 'templatecoupontest' + time;
        const data = {
            jsonBody: templateJSON,
            'passbook-IconFile': path.join(__dirname, "resources", "Coupon.pass", "icon.png"),
            'passbook-LogoFile': path.join(__dirname, "resources", "Coupon.pass", "logo.png"),
            'passbookRedeem-IconFile': path.join(__dirname, "resources", "Coupon.pass", "icon.png"),
            'passbookRedeem-LogoFile': path.join(__dirname, "resources", "Coupon.pass", "logo.png"),
        };
        client.createTemplate(data, function (err, response) {
            logger(response.body);
            templateCoupon = response.body;
            done(err);
        });
    });


    it('push template', function (done) {
        this.timeout(TIMEOUT);
        client.pushTemplate(template.name, function (err, response) {
            logger(response.body);
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
        const pass = {
            templateName: template.name,
            userDefinedId: userDefinedId,
            dynamicData: {
                "points": "10"
            },
            recoveryEmail: recoveryEmail
        };

        client.createPass(pass, function (err, response) {
            logger(response.body);
            if (!err)
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

    it('update pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        const pass = {
            templateName: templateCoupon.name,
            userDefinedId: userDefinedId,
            dynamicData: {
                "points": "30"
            },
            dynamicImages: {},
            dynamicBackfields: {},
            recoveryEmail: recoveryEmail,
            isVoided: false,
            isRedeemed: false,
            isInvalid: false,
            expiryDate: new Date(),
            passbook: {
                "groupId": "airline-1",
                "bgColor": "#FFFFFF",
                "labelColor": "000000",
                "fgColor": "#E4F9A0",
                "userInfo": {
                    "key": "value"
                }
            }
        };
        client.updatePass(passId, pass, function (err, response) {
            logger(response.body);
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

    it('update pass instance by userDefinedId and campaignName', function (done) {
        this.timeout(TIMEOUT);
        const pass = {
            dynamicData: {
                "points": "40"
            },
            dynamicImages: {},
            dynamicBackfields: {},
            recoveryEmail: recoveryEmail,
            isVoided: false,
            isRedeemed: false,
            isInvalid: false,
            expiryDate: new Date(),
            passbook: {
                "groupId": "airline-2",
                "bgColor": "#FFFFFF",
                "labelColor": "000000",
                "fgColor": "#E4F9A0",
                "userInfo": {
                    "key": "value"
                }
            }
        };
        client.updatePassUserDefinedId(userDefinedId, campaign.name, pass, function (err, response) {
            logger(response.body);
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


    it('get pass instance by userDefinedId', function (done) {
        this.timeout(TIMEOUT);
        client.getPassUserDefinedId(userDefinedId, campaign.name, function (err, response) {
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

    it('get pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.getPass(passId, function (err, response) {
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

    it('get pass instance by passID', function (done) {
        this.timeout(TIMEOUT);
        client.getPass(passId, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('create passes batch', function (done) {
        this.timeout(TIMEOUT);

        const batch = {
            passes: [{
                templateName: template.name,
                dynamicData: {
                    "points": "1"
                }
            }, {
                userDefinedId: "mojeID" + new Date().getTime(),
                templateName: template.name,
                dynamicData: {
                    "points": "2"
                }
            }]
        };

        client.createPassesBatch(batch, function (err, response) {
            logger(response.body);
            passes = response.body.id;
            done(err);
        });
    });


    it('update passes batch', function (done) {
        this.timeout(TIMEOUT);
        const data = {};
        data.passes = [];
        for (let id of passes) {
            data.passes.push({
                id: id,
                dynamicData: {
                    "points": "25"
                },
            })
        }
        client.updatePassesBatch(data.passes, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('get passes batch', function (done) {
        this.timeout(TIMEOUT);
        client.getPassesBatch(passes, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('search passes', function (done) {
        this.timeout(TIMEOUT);
        const query = {
            "size": 1000,
            "from": 0,
            "passFilter": {
                //   "id":"passId123",
                //    "templateName":"templateName",
                //   "campaignName":"campaignName",
                //   "userDefinedId":"myPass123",
                "isRedeemed": false,
                "isInvalid": false,
                "isVoided": false
                /*   "expiryDate":{
                 "gte":"2016-04-11T12:59:59Z"
                 },
                 "updatedAt":{
                 "eq":"2015-04-11T13:00:00Z"
                 },
                 "createdAt":{
                 "eq":"2015-04-11T13:00:00Z"
                 },
                 "firstUnregisterAt":{
                 "exists":false
                 },
                 "lastUnregisterAt":{
                 "exists":false
                 },
                 "firstRegisterAt":{
                 "exists":false
                 },
                 "lastRegisterAt":{
                 "exists":false
                 },
                 "lastRedeemAt":{
                 "exists":false
                 },
                 "recoveryEmail":{
                 "exists":false
                 },
                 "dynamicData":{
                 "name":{
                 "eq":"MrAwesome"
                 },
                 "point":{
                 "lte":12
                 },
                 "balance":{
                 "gt":900,
                 "lt":1500
                 }
                 },
                 "androidPayDevices":{
                 "gte":5000,
                 "lte":10000
                 },
                 "passbookDevices":{
                 "gte":5000,
                 "lte":10000
                 }*/
            }
        };
        client.searchPasses(query, function (err, response) {
            logger(response.body);
            done(err);
        });
    });


    it('search valid passes and invalidthem in batch', function (done) {
        this.timeout(TIMEOUT);
        const query = {
            "size": 1000,
            "from": 0,
            "passFilter": {
                "isInvalid": false,
                "isVoided": false,
            }
        };
        client.searchPasses(query, function (err, response) {
            //logger(response.body);
            let p = response.body.data;
            for (let i in p) {
                p[i].isInvalid = true;
            }
            if (p.length > 25)
                p = p.slice(0, 24);
            client.updatePassesBatch(p, function (err, response) {
                logger(response.body);
                done(err);
            });
        });
    });

});