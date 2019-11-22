import {
  palindrome,
  isalnum
} from "./main.js";

test.each([
  ["eye", true],
  ["_eye", true],
  ["race car", true],
  ["not a palindrome", false],
  ["A man, a plan, a canal. Panama", true],
  ["never odd or even", true],
  ["nope", false],
  ["almostomla", false],
  ["My age is 0, 0 si ega ym.", true],
  ["1 eye for of 1 eye.", false],
  ["0_0 (: /-\ :) 0-0", true],
  ["five|\_/|four", false],
])("palindrome(%p)", (s, expected) =>
  expect(palindrome(s)).toBe(expected)
);

test.each([
  ["", true],
  [" ", false],
  ["abc123", true],
  ["abc,123", false],
  ["AaBbCc", true],
])("isalnum(%p)", (s, expected) =>
  expect(isalnum(s)).toBe(expected)
);
