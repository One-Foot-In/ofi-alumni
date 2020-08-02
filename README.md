# ofi-alumni

This is the mono-repository that contains the frontend (client) React App and the backend (server) node.js app.

## Getting Started

* You need to have [node](https://nodejs.org/en/) installed locally on your machine (node ships with npm).

* In order to run both apps together, run `npm run dev` from the root-level. If you have added new packages/ have uninstalled packages in package.json, you will have to cd into `frontend/` and `server/` and run `npm i` in turn.
* In order to just run the frontend, cd into `frontend/` and run `npm start`. If you have added new packages/ have uninstalled packages in package.json, you will have to run `npm i` first.
* In order to just run the backend, cd into `server/` and run `npm start`. If you have added new packages/ have uninstalled packages in package.json, you will have to run `npm i` first.

## Client

We rely heavily on the [Semantic UI React library](https://react.semantic-ui.com/)

## Server

* We separate concerns by ROLES in the system, and each ROLE should get it's own router
* Each ROLE has a corresponding Profile schema found in `server/models` for details that can be used on the front end (Alumni, Student, etc.)
* The `util` router (in utilMongoose.js) is used to make testing easier
* The index router contains APIs that span across roles, e.g. authentication and verification end-points

## Starting mongo locally

* Use `mongod --dbpath=data/db`

## Deployments

* In a deployment environment, run `npm run build`. This should create an optimized production build of the React frontn-end app for the server directory to serve. Then `cd server` and `npm start` (or use `pm2` if you need to run the app in the background, as you would in an EC2 instance).
