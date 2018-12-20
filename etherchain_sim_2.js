const _ = require("lodash");
const data = require("./etherchain_data");

// simulate
const txs = [];

let num_units_owned = 0;
let cash_usd = 0;

txs.push(["init", 0, 0, num_units_owned, cash_usd, 0, true]);

for (const current_pt of data) {
  for (const tx of txs) {
    if (
      tx[7] === false &&
      tx[6].getTime() <= current_pt.ts - 7 * 24 * 60 * 60 * 1000
    ) {
      tx[7] = true;
      num_units_owned -= tx[1];
      cash_usd += current_pt.price_usd * tx[1];
      txs.push([
        "sell",
        tx[1],
        current_pt.price_usd,
        current_pt.ts,
        num_units_owned,
        cash_usd,
        current_pt.ts,
        true
      ]);
    }
  }

  if (current_pt.price_change_pct > 20) {
    let amount = 1;
    num_units_owned += amount;
    cash_usd -= current_pt.price_usd * amount;
    txs.push([
      "buy",
      amount,
      -current_pt.price_usd,
      current_pt.ts,
      num_units_owned,
      cash_usd,
      current_pt.ts,
      false
    ]);
  }
}

console.log("txs", _.takeRight(txs, 10));
console.log(
  "txs_num_units",
  txs.filter(t => t[0] === "buy").length -
    txs.filter(t => t[0] === "sell").length
);
console.log("num_units_owned", num_units_owned);
console.log("cash_usd", cash_usd);
