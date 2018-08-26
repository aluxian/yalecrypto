const _ = require('lodash');
const data = require('./etherchain_data.json');

function noopStrategy(params, state) {
  return null;
}

function randomStrategy(constraints, params, state) {
  const maxCashAvailable = state.cash - constraints.MIN_CASH;
  const maxUnitsCanBuy = parseInt(maxCashAvailable / params.price, 10);

  const buy = Math.random() >= 0.5;
  const units = Math.min(maxUnitsCanBuy, (buy ? 1 : -1) * parseInt(Math.random() * 10, 10));
  state.units += units;
  state.cash -= units * params.price;
  return {
    params,
    state,
    trade: buy ? 'buy' : 'sell',
    amount: units,
  };
}

function runStrategy(strategyFn) {
  const constraints = {
    MIN_CASH: -1000,
  };

  const state = {
    units: 0,
    cash: 0,
  };

  const txs = data
    .map((d) =>
      strategyFn(
        constraints,
        {
          date: d.ts,
          price: d.price_usd,
          prev: {
            date: d.lookedback_ts,
            price: d.lookedback_price_usd,
            change: d.price_change_pct,
          },
        },
        state,
      ),
    )
    .filter((tx) => tx);

  return { state, log: _.takeRight(txs, 10) };
}

console.log('noop strategy results', runStrategy(noopStrategy));
console.log('random strategy results', runStrategy(randomStrategy));
