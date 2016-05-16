import PasskitSDK from '../lib/passkit';
import {expect} from 'chai';
const TIMEOUT = 20000;
let templates = [];
let options = {
  apiKey: process.env.PASSKIT_API_KEY,
  apiSecret: process.env.PASSKIT_API_SECRET
};

const passkitSDK = new PasskitSDK(options);
let pass;

describe('test passkit', () => {

  it('list templates', function (done) {
      this.timeout(TIMEOUT);
      passkitSDK.templateList(function (err, response) {
        if (err) {
          console.error(err);
        } else {
          //console.log(response);
          templates = response.body.templates;
        }
        done(err);
      });
    }
  );


  it('list field names for template', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getTemplateFieldNames(templates[templates.length-1], function (err, response) {
        if (err) {
          console.error(err);
          done(err);
        } else {
          //console.log(JSON.stringify(response));
          done();
        }

      });
    }
  );


  it('list field names for template promise', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getTemplateFieldNamesAsync(templates[templates.length-1]).then((e) => {
        //console.log(JSON.stringify(e));
        done();
      }, done);
    }
  );


  it('list passes for template', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getPassesForTemplate(templates[templates.length-1], function (err, response) {
        if (err) {
          console.error(err);
        } else {
          //console.log(JSON.stringify(response));
        }
        done(err);
      });
    }
  );

  it('issue ticket', function (done) {
      this.timeout(TIMEOUT);
      passkitSDK.passIssue(templates[templates.length-1], {}, function (err, response) {
        if (err) {
          console.error(err);
        } else {
          //console.log(response);
          pass = response.body;
        }
        done(err);
      });
    }
  );

  it('invalidate ticket', function (done) {
      this.timeout(TIMEOUT);
      passkitSDK.invalidate(pass.uniqueID, function (err, response) {
        if (err) {
          console.error(err);
        } else {
          //console.log(response);
          //pass = response.body;
        }
        done(err);
      });
    }
  );
});
