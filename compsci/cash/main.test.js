import {
  checkCashRegister,
  zip,
  sum
} from "./main.js";

test.each([
  [
   19.5,
   20,
   [
     ["PENNY", 1.01],
     ["NICKEL", 2.05],
     ["DIME", 3.1],
     ["QUARTER", 4.25],
     ["ONE", 90],
     ["FIVE", 55],
     ["TEN", 20],
     ["TWENTY", 60],
     ["ONE HUNDRED", 100]
   ],
   {
     status: "OPEN",
     change: [
       ["QUARTER", 0.5],
     ]
   }
  ],
  [
   3.26,
   100,
   [
     ["PENNY", 1.01],
     ["NICKEL", 2.05],
     ["DIME", 3.1],
     ["QUARTER", 4.25],
     ["ONE", 90],
     ["FIVE", 55],
     ["TEN", 20],
     ["TWENTY", 60],
     ["ONE HUNDRED", 100]
   ],
   {
     status: "OPEN",
     change: [
       ["TWENTY", 60],
       ["TEN", 20],
       ["FIVE", 15],
       ["ONE", 1],
       ["QUARTER", 0.5],
       ["DIME", 0.2],
       ["PENNY", 0.04],
     ]
   }
  ],
  [
   19.5,
   20,
   [
     ["PENNY", 0.01],
     ["NICKEL", 0],
     ["DIME", 0],
     ["QUARTER", 0],
     ["ONE", 0],
     ["FIVE", 0],
     ["TEN", 0],
     ["TWENTY", 0],
     ["ONE HUNDRED", 0]
   ],
   {
     status: "INSUFFICIENT_FUNDS",
     change: []
   }
  ],
  [
   19.5,
   20,
   [
     ["PENNY", 0.01],
     ["NICKEL", 0],
     ["DIME", 0],
     ["QUARTER", 0],
     ["ONE", 1],
     ["FIVE", 0],
     ["TEN", 0],
     ["TWENTY", 0],
     ["ONE HUNDRED", 0]
   ],
   {
     status: "INSUFFICIENT_FUNDS",
     change: []
   }
  ],
  [
   19.5,
   20,
   [
     ["PENNY", 0.5],
     ["NICKEL", 0],
     ["DIME", 0],
     ["QUARTER", 0],
     ["ONE", 0],
     ["FIVE", 0],
     ["TEN", 0],
     ["TWENTY", 0],
     ["ONE HUNDRED", 0]
   ],
   {
     status: "CLOSED",
     change: [
       ["PENNY", 0.5],
       ["NICKEL", 0],
       ["DIME", 0],
       ["QUARTER", 0],
       ["ONE", 0],
       ["FIVE", 0],
       ["TEN", 0],
       ["TWENTY", 0],
       ["ONE HUNDRED", 0]
     ]
   }
  ],
  [
   0.7,
   1,
   [
     ["PENNY", 0.04],
     ["NICKEL", 0],
     ["DIME", 0.3],
     ["QUARTER", 0.25],
     ["ONE", 0],
     ["FIVE", 0],
     ["TEN", 0],
     ["TWENTY", 0],
     ["ONE HUNDRED", 0]
   ],
   {
     status: "OPEN",
     change: [
       ["DIME", 0.3],
     ]
   }
  ],
])("checkCashRegister(%d, %d, %p)", (price, cash, cid, expected) =>
  expect(checkCashRegister(price, cash, cid)).toStrictEqual(expected)
);

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
])("zip(%p, %p)", (a1, a2, expected) =>
  expect(zip(a1, a2)).toStrictEqual(expected)
);

test.each([
  [[], 0],
  [[1], 1],
  [[1, 2, 3], 6]
])("sum(%p)", (a, expected) =>
  expect(sum(a)).toBe(expected)
);
