**APIs**

< API Documentation should live here >


**Writing and Running Unit Tests**

Add unit tests to folder `server/test` with the extension `.test.js`

From server directory, run `npm run test` to run all tests. Run `npm run test tests/<name_of_test>.test.js` to run a specific test suite.

**NOTE**

For writing tests that hit the API endpoints, auth is not correctly set up at this time.
When you want to check if tests for an endpoint are working, temporarily remove
the passport middlewhere, such as
```router.post('/opportunity/:id', async (req, res, next) => {```

instead of

```router.post('/opportunity/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {```


