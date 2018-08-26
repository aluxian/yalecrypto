const _ = require('lodash');
const moment = require('moment');

// config
const LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

// load from disk
let data = require('./eth.json');
console.log('data:', _.takeRight(data, 10));

// parse
data = data.map((d) => ({ ts: new Date(d.time * 1000), price_usd: parseFloat(d.value) }));
console.log('data with ts+price_usd:', _.takeRight(data, 10));

// round up to the hour
data = data.map((d) => {
  let ts = moment(d.ts);
  ts = ts.minute() || ts.second() || ts.millisecond() ? ts.add(1, 'hour').startOf('hour') : ts.startOf('hour');
  return { ts: ts.toDate(), price_usd: d.price_usd };
});
console.log('data rounded up to hour:', _.takeRight(data, 10));

// deduplicate
data = _.uniqBy(data.reverse(), (d) => d.ts.getTime()).reverse();
console.log('deduplicated data:', _.takeRight(data, 10));

// start/end ts
const dataset_start_ts = data[0].ts;
const dataset_end_ts = data[data.length - 1].ts;
console.log({ dataset_start_ts, dataset_end_ts });

// calculate window values
data = data
  .map(({ ts, price_usd }) => {
    const ts_lookedback = ts.getTime() - LOOKBACK_MS;
    const prev_pt = _.findLast(data, (d) => d.ts.getTime() <= ts_lookedback);
    if (!prev_pt) {
      return null;
    }

    const lookedback_ts = prev_pt.ts;
    const lookedback_price_usd = prev_pt.price_usd;

    const price_change_pct = ((price_usd - lookedback_price_usd) / lookedback_price_usd) * 100;

    return { ts, price_usd, lookedback_ts, lookedback_price_usd, price_change_pct };
  })
  .filter((d) => d);
console.log('lookedback data:', _.takeRight(data, 10));

// skip some data points so the ts_diff_mean is less than 3 min
data = _.takeRight(data, data.length - 1000);

// lookedback data ts diff to actual ts
const lookedback_ts_diffs = data.map((d) => {
  const accurate_prev_ts = d.ts.getTime() - LOOKBACK_MS;
  const actual_prev_ts = d.lookedback_ts.getTime();
  if (actual_prev_ts > accurate_prev_ts) {
    console.log('actual_prev_ts > accurate_prev_ts', d);
  }
  return accurate_prev_ts - actual_prev_ts;
});
console.log('lookedback data ts diff to actual ts', _.takeRight(lookedback_ts_diffs, 10));
console.log('ts_diff_mean =', _.mean(lookedback_ts_diffs) / 1000 / 60, 'mins');
console.log('ts_diff_median =', lookedback_ts_diffs[parseInt(lookedback_ts_diffs.length / 2, 10)] / 1000 / 60, 'mins');

// check there are no gaps
let found_any_gaps = false;
for (let i = 0, expected = data[0].ts.getTime(); i < data.length; i++, expected += 60 * 60 * 1000 /* 1h */) {
  if (data[i].ts.getTime() === expected) {
    // ok
  } else {
    console.log('found gap:', [data[i - 1], data[i]]);
    found_any_gaps = true;
    break;
  }
}
if (!found_any_gaps) {
  console.log('no gaps found');
}

// export
module.exports = data;
