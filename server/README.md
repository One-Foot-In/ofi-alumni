# ec2-backend-test
Express app, hooked up to a mongo database that is deployed on EC2 instance with DNS --> `http://ec2-3-94-208-166.compute-1.amazonaws.com:3000`
* The server will return json response. It is not hooked up to a view engine.
* The instance will need to define environment variables to establish database connection (The EC2 instance above should have variables defined already)

**APIs**

_Test Router_
1. /testConnection (tests whether erver is up)
GET
Response sample
```
{"message":"connection is working!"}
```

2. /testPost (tests a post request - use postman)
POST
Params: param1
Response sample
```
{"param":"your_param"}
```

3. /getTestData (gets all data from the test collection set up in mongo database)
GET
Reponse sample 
```
{"response":[{"_id":"5e5ac32e7fd5f9961ebb4cf4","name":"stamiferry","profession":"psilocybin enthusiast"},{"_id":"5e5ac3397fd5f9961ebb4cf5","name":"reshad","profession":"legend the greatest"}]}
```

4. /addData/:name/:profession (get request to send params to add to the test collection, e.g. `<EC2_instance_DNS>/addData/John Doe/Minister of Finance`
GET
Reponse sample
```
{"response":[{"_id":"5e5ac32e7fd5f9961ebb4cf4","name":"stamiferry","profession":"psilocybin enthusiast"},{"_id":"5e5ac3397fd5f9961ebb4cf5","name":"reshad","profession":"legend the greatest"},{"_id":"5e5ac3d17fd5f9961ebb4cf6","name":"John Doe","profession":"Minister of Finance"}]}
```

5. /data/clear (clears all records from test collection)
GET
Reponse sample
```
{"message":"deleted all records!"}
```
