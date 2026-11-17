function requireValue(condition, message) {
  if (!condition) throw new Error('Radar validation: ' + message);
}

function finiteNonnegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function nonemptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateSnapshot(snapshot) {
  requireValue(snapshot && typeof snapshot === 'object', 'snapshot must be an object');
  requireValue(nonemptyText(snapshot.as_of), 'snapshot date is missing');
  requireValue(Number.isFinite(Date.parse(snapshot.as_of)), 'snapshot date is invalid');
  requireValue(nonemptyText(snapshot.source), 'source attribution is missing');
  requireValue(Array.isArray(snapshot.protocols), 'protocols must be an array');
  requireValue(Array.isArray(snapshot.watchlist), 'watchlist must be an array');
  requireValue(snapshot.protocols.length > 0, 'snapshot contains no protocols');
  const slugs = new Set();

  for (const protocol of snapshot.protocols) {
    requireValue(protocol && typeof protocol === 'object', 'invalid protocol record');
    requireValue(nonemptyText(protocol.slug), 'protocol slug is missing');
    requireValue(!slugs.has(protocol.slug), 'duplicate protocol: ' + protocol.slug);
    slugs.add(protocol.slug);
    requireValue(nonemptyText(protocol.name), 'name is missing for ' + protocol.slug);
    requireValue(finiteNonnegative(protocol.tvl_usd), 'invalid TVL for ' + protocol.slug);
    requireValue(
      protocol.mcap_usd === null || protocol.mcap_usd === -1 || finiteNonnegative(protocol.mcap_usd),
      'invalid market capitalization for ' + protocol.slug,
    );
    requireValue(
      protocol.change_7d === null || Number.isFinite(protocol.change_7d),
      'invalid weekly change for ' + protocol.slug,
    );
    requireValue(Array.isArray(protocol.chains), 'missing chain list for ' + protocol.slug);
    requireValue(protocol.chains.every(nonemptyText), 'invalid chain name for ' + protocol.slug);
    requireValue(
      protocol.category === null || nonemptyText(protocol.category),
      'invalid category for ' + protocol.slug,
    );
  }

  const watched = new Set();
  for (const slug of snapshot.watchlist) {
    requireValue(slugs.has(slug), 'unknown watchlist protocol: ' + slug);
    requireValue(!watched.has(slug), 'duplicate watchlist protocol: ' + slug);
    watched.add(slug);
  }
  return snapshot;
}

export function validateBoard(rows, snapshot) {
  requireValue(Array.isArray(rows), 'board must be an array');
  requireValue(rows.length >= 100 && rows.length <= 4000, 'board needs 100 to 4000 rows');
  const known = new Set(snapshot.protocols.map(protocol => protocol.slug));
  const present = new Set();
  let previous = Infinity;

  rows.forEach((row, index) => {
    requireValue(row && typeof row === 'object', 'invalid board row');
    requireValue(known.has(row.slug), 'invented protocol: ' + row.slug);
    requireValue(!present.has(row.slug), 'repeated board protocol: ' + row.slug);
    present.add(row.slug);
    requireValue(row.rank === index + 1, 'ranks must be consecutive and ordered');
    requireValue(nonemptyText(row.name), 'board row name is missing');
    requireValue(
      Number.isSafeInteger(row.implied_value_usd) && row.implied_value_usd > 0,
      'estimate must be a positive safe integer for ' + row.slug,
    );
    requireValue(row.implied_value_usd <= 100000000000000, 'estimate exceeds the cap');
    requireValue(row.implied_value_usd <= previous, 'board is not sorted by implied value');
    previous = row.implied_value_usd;
    requireValue(Array.isArray(row.farm_steps), 'research steps must be an array');
    requireValue(row.farm_steps.length >= 3 && row.farm_steps.length <= 12, 'invalid step count');
    for (const step of row.farm_steps) {
      requireValue(typeof step === 'string', 'research step must be text');
      requireValue(step.trim().length >= 20 && step.trim().length <= 600, 'invalid step length');
    }
    requireValue(
      Number.isSafeInteger(row.peer_count) && row.peer_count >= 0,
      'invalid peer evidence count for ' + row.slug,
    );
    requireValue(Number.isFinite(row.multiple) && row.multiple > 0, 'invalid valuation multiple');
    requireValue(row.value_low <= row.implied_value_usd, 'scenario low exceeds central estimate');
    requireValue(row.value_high >= row.implied_value_usd, 'scenario high is below central estimate');
  });

  requireValue(new Set(rows.map(row => row.implied_value_usd)).size > 1, 'all estimates are identical');
  for (const slug of snapshot.watchlist) {
    requireValue(present.has(slug), 'watchlist protocol omitted: ' + slug);
  }
  return rows;
}
