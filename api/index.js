/**
 * @file
 *
 * Summary.
 * <p><a href="../PDFs/refman.pdf#page=7">Desconto Racional por Dentro</a> versão nodejs/Express.</p>
 *
 * Usage:
 * <ul>
 *  <li>npm init</li>
 *  <li>npm install express</li>
 *  <li>npm install serve-favicon</li>
 *  <li>npm start</li>
 *  <li>http://localhost:3000/cdc</li>
 * </ul>
 *
 * @author Paulo Roma
 * @since 01/11/2023
 * @see <a href="../api/index.js">source</a>
 * @see <a href="http://localhost:3000/cdc">link</a>
 * @see https://expressjs.com
 * @see https://www.youtube.com/watch?v=JlgKybraoy4
 * @see https://expressjs.com/en/starter/static-files.html
 * @see https://shadowsmith.com/thoughts/how-to-deploy-an-express-api-to-vercel
 */

"use strict";

const express = require("express");
const favicon = require("serve-favicon");
const path = require("path");
const indexRouter = require("../routes/routes.js");

const app = express();

const whitelist = ["*"];

app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));
app.use(favicon(path.join("public", "favicon.ico")));

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

const setContext = (req, res, next) => {
    if (!req.context) req.context = {};
    next();
};
app.use(setContext);

let root = "/api";

// The app will now be able to handle requests to /root and /root/cdc,
// as well as call the timeLog middleware function that is specific to the route.
app.use(root, indexRouter);

app.get("/favicon.ico", (req, res) => {
    res.sendFile("favicon.ico", { root: "public" });
});

app.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")}`);
});

module.exports = app;
