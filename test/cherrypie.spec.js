import 'babel-polyfill';
import {CherryPieClient} from '../index.js';
import {expect} from 'chai';
const TIMEOUT = 7500;
let templates = [];
let options = {
  apiKey: process.env.CHERRYPIE_API_KEY,
  apiSecret: process.env.CHERRYPIE_API_SECRET
};

const client = new CherryPieClient(options);


let passId = null;

describe('test cherryPie', () => {

  it('create pass', function (done) {
    this.timeout(TIMEOUT);
    client.createPass('FreeBeer', '' + new Date().getTime(), {}, 'mblecek@gmail.com', function (err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(response.body)
        passId = response.body.id;
      }
      done(err);
    });
  });
  
  
  it('get pass', function (done) {
    this.timeout(TIMEOUT);
    client.getPass(passId, function (err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
      done(err);
    });
  });
  
  
});
