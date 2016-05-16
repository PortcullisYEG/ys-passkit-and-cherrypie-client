
import {CherryPieClient} from '../index.js';
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
let passId = null;

describe(`CherryPie for templateName=${templateName} and recoveryEmail ${recoveryEmail}`, () => {


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
    client.createPassAsync(templateName, userDefinedId, {}, recoveryEmail).then((result) => {
      passId = result.body.id;
      done();
    }, (err) => {
      {
        //console.error(err);
        done(err);
      }
    });
  });

  if (passId) {
    it('get pass instance by passID', function (done) {
      this.timeout(TIMEOUT);
      client.getPass(passId, function (err, response) {
        if (err) {
          //console.error(err);
        } else {
          console.log(response);
        }
        done(err);
      });
    });

    it('get pass instance by passID async', function (done) {
      this.timeout(TIMEOUT);
      client.getPassAsync(passId).then((result) => {
        passId = result.body.id;
        done();
      }, (err) => {
        {
          // console.error(err);
          done(err);
        }
      });
    });
  }
});