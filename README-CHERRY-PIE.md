# Documentation for CherryPie API client. 

Documentation for api [https://dev.passkit.net/](https://dev.passkit.net/)

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

## Client API


```
import {CherryPieClient} from '../index.js';
let options = {
  apiKey: process.env.CHERRYPIE_API_KEY,
  apiSecret: process.env.CHERRYPIE_API_SECRET
};
const client = new CherryPieClient(options);
```
  
