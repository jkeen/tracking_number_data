# trackingnumber.fyi

Decodes tracking numbers in the browser using the `couriers/*.json` in this repository. The data is imported at build time, so a change to a courier file rebuilds the site that explains it.

```sh
npm install
npm run dev
npm test
```

`npm test` runs every documented test number in `couriers/*.json` through this implementation. A data change that breaks the decoder fails the build rather than the deployed site.
