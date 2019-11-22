import { rot13, rotateChar, rotateIndex } from "./main.js";

test.each([
  ["SERR PBQR PNZC", "FREE CODE CAMP"],
  ["SERR CVMMN!", "FREE PIZZA!"],
  ["SERR YBIR?", "FREE LOVE?"],
  [
    "GUR DHVPX OEBJA SBK WHZCF BIRE GUR YNML QBT.",
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG."
  ]
])("rot13(%p)", (s, expected) => expect(rot13(s)).toBe(expected));

test.each([
  ["A", 1, "B"],
  ["c", 3, "f"],
  ["Z", 1, "A"],
  ["b", 26, "b"],
  ["b", 53, "c"],
  ["M", 13, "Z"],
  ["Z", 13, "M"],
  ["?", 10, "?"]
])("rotateChar(%p, %p)", (c, n, expected) =>
  expect(rotateChar(c, n)).toBe(expected)
);

test.each([
  [0, 1, 1],
  [2, 3, 5],
  [25, 1, 0],
  [1, 26, 1],
  [1, 53, 2],
  [12, 13, 25],
  [25, 13, 12]
])("rotateIndex(%p, %p)", (i, n, expected) =>
  expect(rotateIndex(i, n)).toBe(expected)
);
