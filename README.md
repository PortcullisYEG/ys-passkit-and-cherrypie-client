# ys-passkit-and-cherrypie-client

Node.js clients for passkit and cherrypie API. 

# Development

## Prereq

```
npm install
```

## Run test

### NPM test
```
CHERRYPIE_API_KEY=yourApiKey CHERRYPIE_API_SECRET=yourSecret PASSKIT_API_KEY=yourApiKey PASSKIT_API_SECRET=yourApiSecret npm test;
```
### CherryPie test
```
CHERRYPIE_TEST_OFFER=SomeOffer CHERRYPIE_TEST_RECOVERY_EMAIL=example@email.com CHERRYPIE_API_KEY=apikey CHERRYPIE_API_SECRET=secret  node_modules/.bin/mocha --compilers js:babel-core/register ./test/cherrypie.spec.js;
```

# Paskit documentation
```
import {PasskitClient} from '../index.js';
let options = {
  apiKey: process.env.PASSKIT_API_KEY,
  apiSecret: process.env.PASSKIT_API_SECRET
};
const client = new PasskitClient(options);
```
## Get all your templates
```
  templateList(callback)
  templateListAsync()
```
  
## Get Fields for template
```  
  getTemplateFieldNames(templateName, callback)
  getTemplateFieldNamesAsync(templateName)
```

## Get pass for template and serial number
``` 
  getPassForTemplateSerialNumber(templateName, serialNumber, callback) 
  getPassForTemplateSerialNumberAsync(templateName, serialNumber)
``` 

## Get all passes for template
``` 
  getPassesForTemplate(templateName, callback)
  getPassesForTemplateAsync(templateName)
``` 

## Issue (create) pass for template
```
  passIssue(templateName, fieldsData, callback) 
  passIssueAsync(templateName, fieldsData)
```

## Invalidate pass by unique_id
```
  invalidate(unique_id, callback)
  invalidateAsync(unique_id) 
```
## Invalidate pass by template and serial number
```
  invalidateTemplateSerialNumber(template,serialNumber,callback)
  invalidateTemplateSerialNumberAsync(template,serialNumber)
```

## Invalidate pass by unique_id
```
  update(unique_id, newData, callback) 
  updateAsync(unique_id, newData) 
```

 ## Update pass by template and serial number
```
  updateTemplateSerialNumber(template,serialNumber, newData, callback)
  updateTemplateSerialNumberAsync(template,serialNumber, newData) 
```

# Cherry Pie documentation
```
import {CherryPieClient} from '../index.js';
let options = {
  apiKey: process.env.CHERRYPIE_API_KEY,
  apiSecret: process.env.CHERRYPIE_API_SECRET
};
const client = new CherryPieClient(options);
```
## Create pass for template (offer)
```
// Standart function with callback  
client.createPass(templateName, userDefinedId, dynamicData, recoveryEmail,callback)
 
// Promise  
client.createPassAsync(templateName, userDefinedId, dynamicData, recoveryEmail)
```
params: 
   * templateName (reqired) - string with template name
   * userDefinedId - string or null   
   * dynamicData - object,null, or empty object {}
   * recoveryEmail - object or null
   
## Get pass by passId 
``` 
// Standart function with callback  
client.getPass(passId,callback)

//Promise  
client.getPassAsync(passId)
```
params: 
   * passId (reqired) - id 
   
   
## Redeem pass by passId 
``` 
// Standart function with callback  
client.redeemPass(passId,callback)

//Promise  
client.redeemPassAsync(passId)
```
params: 
   * passId (reqired) - id    
   
## Invalidate pass by passId 
``` 
// Standart function with callback  
client.invalidatePass(passId,callback)

//Promise  
client.invalidatePassAsync(passId)
```
params: 
   * passId (reqired) - id       
  
 
 
 ## Update pass by passId 
``` 
// Standart function with callback  
client.updatePass(passId, templateName, userDefinedId, dynamicData, isInvalid, isRedeemed, recoveryEmail, callback)

//Promise  
client.updatePassAsync(passId, templateName, userDefinedId, dynamicData, isInvalid, isRedeemed, recoveryEmail) {
```
params: 
   * passId (reqired) - id   
   * templateName
   * userDefinedId
   * dynamicData
   * isInvalid
   * isRedeemed 
   * recoveryEmail    
  
