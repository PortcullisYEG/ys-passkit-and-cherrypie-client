# ys-passkit-and-cherrypie-client

Node.js clients for passkit and cherrypie API.

# Development

## Prereq

```
npm install
```

## Run test
```
CHERRYPIE_API_KEY=yourApiKey CHERRYPIE_API_SECRET=yourSecret PASSKIT_API_KEY=yourApiKey PASSKIT_API_SECRET=yourApiSecret/RG npm test;
```

# Paskit documentation

-- TODO --

# Cherry Pie documentation
```
import {CherryPieClient} from '../index.js';
let options = {
  apiKey: process.env.CHERRYPIE_API_KEY,
  apiSecret: process.env.CHERRYPIE_API_SECRET
};
const client = new CherryPieClient(options);
```
## Create Pass for template (offer)
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
   
## Get Pass bat passId 
``` 
// Standart function with callback  
getPass(passId,callback)

//Promise  
client.getPassAsync(passId)
```
params: 
   * passId (reqired) - id 
  
 
