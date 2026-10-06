const BPS = 10_000n;

function calculateFee(amountUnits, fixedFeeUnits, feeBps = 50n, maxFeeUnits = null) {
  const amount = BigInt(amountUnits);
  const fixed = BigInt(fixedFeeUnits);
  const bps = BigInt(feeBps);
  if (amount < 0n || fixed < 0n || bps < 0n) throw new Error("Fee inputs must be non-negative");
  if (bps > 1000n) throw new Error("Fee rate exceeds protocol ceiling");
  const variable = (amount * bps) / BPS;
  const fee = fixed + variable;
  if (maxFeeUnits !== null && fee > BigInt(maxFeeUnits)) throw new Error("Fee exceeds configured maximum");
  return fee;
}

function quote(amountUnits, fixedFeeUnits, feeBps = 50n, maxFeeUnits = null) {
  const amount = BigInt(amountUnits);
  if (amount <= 0n) throw new Error("Amount must be greater than zero");
  const fee = calculateFee(amount, fixedFeeUnits, feeBps, maxFeeUnits);
  return Object.freeze({ amount, fee, total: amount + fee });
}

module.exports = { BPS, calculateFee, quote };
