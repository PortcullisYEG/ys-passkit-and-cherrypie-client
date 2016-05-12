# ys-passkit-and-cherrypie-client

Node.js clients for passkit and cherrypie API.

# Development

## Prereq

```
npm install
```

## Run test
```
CHERRYPIE_API_KEY=yourApiKey CHERRYPIE_API_SECRET=yourSecret PASSKIT_API_KEY=yourApiKey PASSKIT_API_SECRET=yourApiSecret npm test;
```

# Paskit documentation

## Get all your templates
```
  templateList(callback)
  templateListPromise()
```
  
## Get Fields for template
```  
  getTemplateFieldNames(templateName, callback)
  getTemplateFieldNamesPromise(templateName)
```

## Get pass for template and serial number
``` 
  getPassForTemplateSerialNumber(templateName, serialNumber, callback) 
  getPassForTemplateSerialNumberPromise(templateName, serialNumber)
``` 

## Get all passes for template
``` 
  getPassesForTemplate(templateName, callback)
  getPassesForTemplatePromise(templateName)
``` 

## Issue (create) pass for template
```
  passIssue(templateName, fieldsData, callback) 
  passIssuePromise(templateName, fieldsData)
```

## Invalidate pass by unique_id
```
  invalidate(unique_id, callback)
  invalidatePromise(unique_id) 
```
## Invalidate pass by template and serial number
```
  invalidateTemplateSerialNumber(template,serialNumber,callback)
  invalidateTemplateSerialNumberPromise(template,serialNumber)
```

## Invalidate pass by unique_id
```
  update(unique_id, newData, callback) 
  updatePromise(unique_id, newData) 
```

 ## Update pass by template and serial number
```
  updateTemplateSerialNumber(template,serialNumber, newData, callback)
  updateTemplateSerialNumberPromise(template,serialNumber, newData) 
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
getPass(passId,callback)

//Promise  
client.getPassAsync(passId)
```
params: 
   * passId (reqired) - id 
  
 
