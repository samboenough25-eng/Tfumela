const test = require("node:test");
const assert = require("node:assert/strict");
const countries = require("../config/sadc-countries.json");

test("registry contains all 16 SADC member states", () => {
  assert.equal(countries.countries.length, 16);
});

test("country codes are unique and include Botswana and Eswatini", () => {
  const codes = countries.countries.map((c) => c.code);
  assert.equal(new Set(codes).size, 16);
  assert.ok(codes.includes("BW"));
  assert.ok(codes.includes("SZ"));
});

test("every country has canonical regional fields", () => {
  for (const country of countries.countries) {
    assert.match(country.code, /^[A-Z]{2}$/);
    assert.match(country.dialCode, /^\+\d+$/);
    assert.ok(country.name);
    assert.ok(country.fiat);
    assert.ok(["PLANNED", "TESTNET", "PILOT", "LIVE", "RESTRICTED", "DISABLED"].includes(country.status));
  }
});
