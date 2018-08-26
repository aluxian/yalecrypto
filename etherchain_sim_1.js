const _ = require('lodash');
const data = require('./etherchain_data');

// simulate
const txs = [];

let num_units_bought = 0;
let num_units_sold = 0;
let cash_usd = 0;

txs.push(['init', null, null, num_units_bought, num_units_sold, cash_usd]);

for (const current_pt of data) {
  if (current_pt.price_change_pct < -20 && current_pt.price_change_pct > -25) {
    let amount = 1;
    num_units_sold += amount;
    cash_usd += current_pt.price_usd * amount;
    txs.push(['sell', amount, current_pt.price_usd, current_pt.ts, num_units_bought, num_units_sold, cash_usd]);
  }

  if (current_pt.price_change_pct < -25) {
    let amount = num_units_sold;
    num_units_sold = 0;
    cash_usd -= current_pt.price_usd * amount;
    txs.push(['buy', amount, -current_pt.price_usd, current_pt.ts, num_units_bought, num_units_sold, cash_usd]);
  }

  if (current_pt.price_change_pct > 20 && current_pt.price_change_pct < 25) {
    let amount = 1;
    num_units_bought += amount;
    cash_usd -= current_pt.price_usd * amount;
    txs.push(['buy', amount, -current_pt.price_usd, current_pt.ts, num_units_bought, num_units_sold, cash_usd]);
  }

  if (current_pt.price_change_pct > 25) {
    let amount = num_units_bought;
    num_units_bought = 0;
    txs.push(['sell', amount, current_pt.price_usd, current_pt.ts, num_units_bought, num_units_sold, cash_usd]);
  }
}

console.log('txs', _.takeRight(txs, 10));
console.log('txs_num_units', txs.filter((t) => t[0] === 'buy').length - txs.filter((t) => t[0] === 'sell').length);
console.log('num_units_bought', num_units_bought);
console.log('num_units_sold', num_units_sold);
console.log('cash_usd', cash_usd);
