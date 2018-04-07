# Node API with JWT authentication and ECMAScript 6 syntax
## Requisites
* Install node
* Install nodemon globally **"npm install nodemon -g"** (optional)

## Getting started
* create a **config folder** in the root of the project (mkdir config)
* create a **config.js** file inside config folder with this content:

  ```
  module.exports = {
    "database": "mongodb://<user>:<password>@<url>:<port>/<database>",
    "port": process.env.PORT || 3000,
    "secretKey": "YourSecretKey"
  }
  ```
  
  * You can create a free mongo database in https://mlab.com/
* **npm install**
* type **npm start** in the command line (if you have installed nodemon, if not change the start command in the package.json by **"node server.js --exec babel-node --presets es2015,stage-2"**)
* Test the api routes with **postman**
