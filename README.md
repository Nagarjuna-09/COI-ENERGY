# COI Energy BACKEND TASK

  

Welcome! 🎉


This exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile
A profile can be either a `client` or a `contractor`. 
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract
A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job
contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

  
The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

  

1. Start by cloning this repository.

  

1. In the repo root directory, run `npm install` to gather all dependencies.

  

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

  

1. Then run `npm start` which should start both the server and the React client.

  

❗️ **Make sure you commit all changes to the master branch!**

  
  

## Technical Notes

  

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

  

## APIs To Implement 

NOTE: Node is already installed on my pc, so i haven't cloned it as mentioned in the readMe file to save some time.

Below is a list of the required API's for the application.

  


1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

Solution: 

- built the API such that the logged in user can access only his own contracts. 
- Used Postman application to test the working condition
- Set the profile_id in the header section to the id of the loggedin user to test the API using Postman
- When the user inputs the contract id that is not his, nothing is returned.

1. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

Solution:

- built API such that the loggedin user can access all his non-terminated contracts (in-process and new contracts are displayed)
- No contract id is provided in the url as parameter or in the end point
- Can directly access the contracts after logging in.
- Test is performed via Postman where loggedin user is changed by altering the profile_id field in header.

1. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.

Solution: 

- built api such that the loggedin user can check his unpaid jobs
- returns only the list of jobs that have active contracts (excludes contracts that terminated or new, even though they have dues.)
- Tested using Postman similarly to the testing of /contracts api as discussed above.

1. ***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

Solution:
- only clients can pay
- When the loggedin user tries to pay for the job that is already paid for, "the job is already paid" message is returned
- When the loggedin user tries to pay for the job that is is not engaged in, there will be no output displayed and no transaction happens.
- when contractor tries to pay for his own service, you get "unauthorized message"
- when client tries to pay for the service, by choosing a specific job id,he can successfully pay if the amount in his account is greater than due amount. else "insufficient price" message is displayed.


1. ***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

Solution

- should be a loggedin user to deposit money
- only clients can deposit money
- can only deposit 25% of total jobs to pay
- when there are no jobs to pay, the max deposit amount that can be deposited is set  to zero, thereby disabling the client to deposit any money.
- max amount that can be deposited by user is printed to console just for reference
- terminated contracts dues are also considered for deciding the max amount that can be deposited and paid by the client if they are unpaid.
- while sending requests in Postman, the user:Id in the url should match with the logged in user.
- Testing was done by sending the amount in the body by setting header: content-type: application/json and sending the body raw values as: {
    "amount": 100
}
- Deposit is successful when max amount is greater than the amount provided in the above amount key value section.


1. ***GET*** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

Solution:

- No login authentication needed.
- returns the highest earning profession between the given dates.
- sample request: http://localhost:3001/admin/best-profession?start=2020-01-01&end=2023-04-19

1. ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```
Solution: 

- returns the top 2 clients who has paid highest between the start and end dates.
- sample request: http://localhost:3001/admin/best-clients?start=2020-01-01&end=2023-04-19
  

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

## Submitting the Assignment

When you have finished the assignment, create a github repository and send us the link. ytzvan.mastino@coienergy.com

Thank you and good luck! 🙏
