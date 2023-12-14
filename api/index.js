/**
 * @file
 *
 * Summary.
 * <p><a href="../PDFs/refman.pdf#page=7">Desconto Racional por Dentro</a> versão nodejs/Express/Vercel.</p>
 *
 * Usage:
 * <ul>
 *  <li>npm init</li>
 *  <li>npm install express</li>
 *  <li>npm install serve-favicon</li>
 *  <li>npm start</li> or
 *  <li>vercel dev</li>
 *  <li>https://cdc-express.vercel.app</li>
 * </ul>
 *
 * @requires module:routes/routes
 * @requires module:external:express
 *
 * @author Paulo Roma
 * @since 01/11/2023
 * @see <a href="../api/index.js">source</a>
 * @see <a href="../package.json">package.json</a>
 * @see <a href="../vercel.json">vercel.json</a>
 * @see <a href="https://cdc-express.vercel.app">link</a>
 * @see <a href="https://vercel.com/krotalias/cdc-express">vercel</a>
 * @see https://expressjs.com
 * @see https://expressjs.com/en/guide/using-middleware.html
 * @see https://expressjs.com/en/starter/static-files.html
 * @see https://expressjs.com/en/resources/middleware/cors.html
 * @see https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b
 * @see https://vercel.com/guides/using-express-with-vercel
 * @see https://stackoverflow.com/questions/72584745/having-problem-deploying-express-server-on-vercel-404-page-not-found
 * @see https://www.youtube.com/watch?v=JlgKybraoy4
 */

"use strict";

const vercel = true;

/**
 * Express module.
 * @external express
 * @see https://expressjs.com
 */
const express = require("express");

/**
 * @var {module:routes/routes} indexRouter module for routing.
 */
const indexRouter = require("../routes/routes.js");

/**
 * CORS is a node.js package for providing a Connect/Express middleware
 * that can be used to enable CORS with various options.
 * @external cors
 * @see https://expressjs.com/en/resources/middleware/cors.html
 */
const cors = require("cors");

/**
 * Creates an Express application.
 * The express() function is a top-level function exported by the express module.
 * @class express
 * @memberof external:express
 * @see https://expressjs.com/en/4x/api.html
 */

/**
 * @var {external:express.express} app an express application.
 */
const app = express();

app.set("port", process.env.PORT || 3000);
app.use(cors());
app.use(express.static("public"));

if (!vercel) {
  const favicon = require("serve-favicon");
  const path = require("path");
  app.use(favicon(path.join("public", "favicon.ico")));

  // middleware
  app.use((req, res, next) => {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    console.log("Time: ", today.toISOString());
    console.log(`${req.method}: url: ${req.url}, path: ${req.path}`);
    console.log(req.get("referer"));
    next();
  });
}

let root = "/api";

// The app will now be able to handle requests to /root and /root/cdc,
// as well as call the timeLog middleware function that is specific to the route.
app.use(root, indexRouter);

// this should not be used with vercel !!!!
if (!vercel) {
  app.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")}`);
  });
}

module.exports = app;
