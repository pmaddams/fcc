import {
  checkCashRegister,
  zip,
  sum
} from "./main.js";

/*
test.each([
])("checkCashRegister()", (price, cash, cid, expected) => {
  expect(checkCashRegister(price, cash, cid)).toStrictEqual(expected);
});
*/

test.each([
  [["a", "b", "c"],
   [1, 2, 3],
   [["a", 1], ["b", 2], ["c", 3]]],
  [["b", "c"],
   [1, 2, 3],
   [["b", 1], ["c", 2]]],
  [["a", "b", "c"],
   [2, 3],
   [["a", 2], ["b", 3]]]
])("zip(%p, %p)", (a1, a2, expected) => {
  expect(zip(a1, a2)).toStrictEqual(expected);
});

test.each([
  [[], 0],
  [[1], 1],
  [[1, 2, 3], 6]
])("sum(%p)", (a, expected) => {
  expect(sum(a)).toBe(expected);
});
