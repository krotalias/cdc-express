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
const rational = require("./rational.cjs");
const favicon = require("serve-favicon");
const path = require("path");

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));
app.use(favicon(path.join("public", "favicon.ico")));

app.get("/", (req, res) => {
    let np = +req.query.np;
    let pv = +req.query.pv;
    let pp = +req.query.pp;
    let pb = +req.query.pb;
    let nb = +req.query.nb;
    let t = +req.query.tax / 100;
    let dp = typeof req.query.dp === "undefined" ? false : true;
    rational.setDownPayment(dp);
    let [ti, i] = rational.getInterest(pp, pv, np);
    if (t === 0) t = ti * 0.01;
    var cf = rational.CF(t, np);
    let pmt = cf * pv;
    let ptb = rational.priceTable(np, pv, t, pmt);
    let hpt = rational.htmlPriceTable(ptb);
    let val = rational.getDownPayment()
        ? ` + \$${pmt.toFixed(2)} = \$${(ptb.slice(-1)[0][1] + pmt).toFixed(2)}`
        : "";
    res.send(`<html>
    <head>
        <title>CDC - Crédito Direto ao Consumidor (nodejs)</title>
        <link rel="stylesheet" href="cd.css">
    </head>
    <body style="background-image: url('/IMAGEM/stone/yell_roc.jpg')">
      <div id="greenBox" class="rectangle">
        <h4>Parcelamento: ${np} meses</h4>
        <h4>Taxa: ${(100 * t).toFixed(2)}% ao mês = ${(
        ((1 + t) ** 12 - 1) *
        100.0
    ).toFixed(2)}% ao ano</h4>
        <h4>Valor Financiado: \$${pv.toFixed(2)}</h4>
        <h4>Valor Final: \$${pp.toFixed(2)}</h4>
        <h4>Valor a Voltar: \$${pb.toFixed(2)}</h4>
        <h4>Meses a Voltar: ${nb}</h4>
        <h4>Entrada: ${rational.getDownPayment()}</h4>
      </div>

      <div id="blueBox" class="rectangle">
        <h4>Coeficiente de Financiamento: ${cf.toFixed(6)}</h4>
        <h4>Prestação: ${cf.toFixed(6)} * \$${pv.toFixed(2)} = \$${pmt.toFixed(
        2
    )} ao mês</h4>
        <h4>Valor Pago com Juros: \$${ptb
            .slice(-1)[0][1]
            .toFixed(2)} ${val}</h4>
        <h4>Taxa Real (${i} iterações): ${ti.toFixed(4)}% ao mês</h4>
        <h4>Valor Corrigido: \$${
            pb > 0 && nb > 0
                ? rational.presentValue(pb, nb, t)[1].toFixed(2)
                : 0
        }</h4>
      </div>

      <div id="redBox" class="rectangle">
        <h4>${hpt}</h4>
      </div>
    </body>
    </html>`);
});

app.get("/cdc", (req, res) => {
    res.sendFile("cdc.html", { root: "public" });
});

app.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")}`);
});

module.exports = app;
