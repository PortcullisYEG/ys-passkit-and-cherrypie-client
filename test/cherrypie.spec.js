
import {CherryPieClient} from '../src/index.js';
import {expect} from 'chai';
import Bluebird from 'bluebird';
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
let campaignName = null;

describe(`CherryPie for templateName=${templateName} and recoveryEmail ${recoveryEmail}`, () => {


  it('get campaigns', function (done) {
    this.timeout(TIMEOUT);
    client.getCampaigns(function (err, response) {
      if (err) {
        //console.error(err);
      } else {
        //console.log(JSON.stringify(response))
        campaignName = response.body[0].name
      }
      done(err);
    });
  });
  
  
    it('get templates for campaigns', function (done) {
    this.timeout(TIMEOUT);
    client.getCampaingTemplates(campaignName, function (err, response) {
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