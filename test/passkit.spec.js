import PasskitSDK from '../src/passkit';
import {expect} from 'chai';
const TIMEOUT = 20000;
let templates = [];
let options = {
  apiKey: process.env.PASSKIT_API_KEY,
  apiSecret: process.env.PASSKIT_API_SECRET
};

const passkitSDK = new PasskitSDK(options);
let pass;
let serialNumber;
let shareID;

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
      passkitSDK.getTemplateFieldNames("CITI3", function (err, response) {
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
      passkitSDK.getTemplateFieldNamesAsync("CITI3").then((e) => {
        //console.log(JSON.stringify(e));
        done();
      }, done);
    }
  );


  it('list all field names for template', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getTemplateFieldNamesFull("CITI3", function (err, response) {
        if (err) {
          console.error(err);
          done(err);
        } else {
          console.log(JSON.stringify(response));
          done();
        }

      });
    }
  );


  it('list all field names for template promise', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getTemplateFieldNamesFullAsync("CITI3").then((e) => {
       console.log(JSON.stringify(e,null,2));
        done();
      }, done);
    }
  );



  it('list passes for template', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getPassesForTemplate("CITI3", function (err, response) {
        if (err) {
          console.error(err);
        } else {
          //console.log(JSON.stringify(response.body.passRecords,null,2));
          serialNumber = response.body.passRecords.pass_2.passMeta.serialNumber;
          shareID = response.body.passRecords.pass_2.passMeta.shareID;
        }
        done(err);
      });
    }
  );


  it('getPassByShareID', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getPassByShareID(shareID, function (err, response) {
        if (err) {
          console.error(err);
        } else {
         // console.log(JSON.stringify(response,null,2));
        }
        done(err);
      });
    }
  );


  it('getPassByID', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getPassByID("33xUwHDW8ZZq", function (err, response) {
        if (err) {
          console.error(err);
        } else {
         // console.log(JSON.stringify(response,null,2));
        }
        done(err);
      });
    }
  );

  it('getPassByTemplateSerialNumber', function (done) {
      this.timeout(TIMEOUT * 3);
      passkitSDK.getPassByTemplateSerialNumber("CITI3",serialNumber, function (err, response) {
        if (err) {
          console.error(err);
        } else {
         // console.log(JSON.stringify(response,null,2));
        }
        done(err);
      });
    }
  );

/*
  it('issue ticket', function (done) {
      this.timeout(TIMEOUT);
      passkitSDK.passIssue("CITI3", {}, function (err, response) {
        if (err) {
          console.error(err);
        } else {
          console.log(response);
          //pass = response.body;
        }
        done(err);
      });
    }
  );

  it('invalidate ticket', function (done) {
      this.timeout(TIMEOUT);
      passkitSDK.invalidate(uniqueID, function (err, response) {
        if (err) {
          console.error(err);
        } else {
           console.log(response);
          //pass = response.body;
        }
        done(err);
      });
    }
  );
*/
});
