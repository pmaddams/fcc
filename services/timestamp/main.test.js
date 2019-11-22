import { timestamp } from "./main.js";

test("timestamp(undefined)", () => {
  const n = Date.now();
  const saved = Date.now;
  global.Date.now = () => n;

  expect(timestamp(undefined)).toBe(n);

  global.Date.now = saved;
});

test.each([
  ["0", 0],
  ["1451001600000", 1451001600000],
  ["2015-12-25", 1451001600000]
])("timestamp(%p)", (s, n) => expect(timestamp(s)).toBe(n));

test.each(["foo", "1bar", "baz2015-12-25"])("timestamp(%p)", s =>
  expect(timestamp(s)).toBeNaN()
);
