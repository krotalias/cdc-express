/** @module */

/**
 * @file
 *
 * Summary.
 * <p>CDC router.</p>
 *
 * @requires express
 *
 * @author Paulo Roma
 * @since 01/11/2023
 * @see <a href="../routes/routes.js">source</a>
 * @see <a href="https://cdc-express.vercel.app">link</a>
 * @see https://expressjs.com/en/guide/routing.html#express-router
 */

"use strict";

var express = require("express");
var router = express.Router();
const rational = require("../public/rational.cjs");

// for POST
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/**
 * Returns an HTML page with the CDC calculation results.
 *
 * @param {Array<Number>} arr
 *  [parcelas, taxa, preço à vista, preço a prazo, valor a voltar, meses a voltar].
 * @param {Boolean} prt whether print output.
 * @returns {String} HTML code.
 */
function createHTML(arr, prt = false) {
    let [np, t, pv, pp, pb, nb] = arr;
    t *= 0.01;
    let [ti, i] = rational.getInterest(pp, pv, np);
    if (t === 0) t = ti * 0.01;
    let cf = rational.CF(t, np);
    let pmt = cf * pv;
    let ptb = rational.priceTable(np, pv, t, pmt);
    let hpt = rational.htmlPriceTable(ptb);
    let val = rational.getDownPayment()
        ? ` + \$${pmt.toFixed(2)} = \$${(ptb.slice(-1)[0][1] + pmt).toFixed(2)}`
        : "";

    return `<html>
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
      <h4>Valor Pago com Juros: \$${ptb.slice(-1)[0][1].toFixed(2)} ${val}</h4>
      <h4>Taxa Real (${i} iterações): ${ti.toFixed(4)}% ao mês</h4>
      <h4>Valor Corrigido: \$${
          pb > 0 && nb > 0 ? rational.presentValue(pb, nb, t)[1].toFixed(2) : 0
      }</h4>
    </div>

    <div id="redBox" class="rectangle">
      <h4>${hpt}</h4>
    </div>
    <script>
      ${prt ? "print()" : ""};
    </script>
  </body>
  </html>`;
}

/**
 * Route displaying CDC calculation results.
 * @name post/api
 * @function
 * @memberof module:routes/routes
 * @inner
 * @param {String} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/", (req, res) => {
    let arr = [
        +req.body.np,
        +req.body.tax,
        +req.body.pv,
        +req.body.pp,
        +req.body.pb,
        +req.body.nb,
    ];
    let dp = typeof req.body.dp !== "undefined";
    let prt = typeof req.body.pdf !== "undefined";
    rational.setDownPayment(dp);
    res.send(createHTML(arr, prt));
});

/**
 * Route displaying CDC calculation results.
 * @name get/api
 * @function
 * @memberof module:routes/routes
 * @inner
 * @param {String} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/", (req, res) => {
    let arr = [
        +req.query.np,
        +req.query.tax,
        +req.query.pv,
        +req.query.pp,
        +req.query.pb,
        +req.query.nb,
    ];
    let dp = typeof req.query.dp !== "undefined";
    let prt = typeof req.query.pdf !== "undefined";
    rational.setDownPayment(dp);
    res.send(createHTML(arr, prt));
});

/**
 * Route serving CDC main form.
 * @name get/api/cdc
 * @function
 * @memberof module:routes/routes
 * @inner
 * @param {String} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.all("/cdc", (req, res) => {
    res.sendFile("cdc.html", { root: "public" });
});

/**
 * Route displaying favicon.ico.
 * @name get/api/favicon
 * @function
 * @memberof module:routes/routes
 * @inner
 * @param {String} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/favicon.ico", (req, res) => {
    res.sendFile("favicon.ico", { root: "public" });
});

module.exports = router;
