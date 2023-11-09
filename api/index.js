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
 * @requires express
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

const express = require("express");
const indexRouter = require("../routes/routes.js");
const app = express();

if (!vercel) {
    const favicon = require("serve-favicon");
    const path = require("path");
    app.use(favicon(path.join("public", "favicon.ico")));
}

const whitelist = ["*"];

app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));

// middleware
app.use((req, res, next) => {
    const origin = req.get("referer");
    const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
    if (isWhitelisted) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "X-Requested-With,Content-Type,Authorization"
        );
        res.setHeader("Access-Control-Allow-Credentials", true);
    }
    // Pass to next layer of middleware
    if (req.method === "OPTIONS") res.sendStatus(200);
    else next();
});

// middleware
if (!vercel) {
    const setContext = (req, res, next) => {
        if (!req.context) req.context = {};
        next();
    };
    app.use(setContext);

    // middleware that is specific to this router
    app.use((req, res, next) => {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        console.log("Time: ", today.toISOString());
        console.log(`${req.method}: url: ${req.url}, path: ${req.path}`);
        console.log(req.get("referer"));
        console.log(`context: ${JSON.stringify(req.context)}`);
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
