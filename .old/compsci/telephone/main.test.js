import { telephoneCheck, match, clean } from "./main.js";

test.each([
  ["1 555-555-5555", true],
  ["1 (555) 555-5555", true],
  ["5555555555", true],
  ["555-555-5555", true],
  ["(555)555-5555", true],
  ["1(555)555-5555", true],
  ["555-5555", false],
  ["5555555", false],
  ["1 555)555-5555", false],
  ["1 555 555 5555", true],
  ["1 456 789 4444", true],
  ["123**&!!asdf#", false],
  ["55555555", false],
  ["(6054756961)", false],
  ["2 (757) 622-7382", false],
  ["0 (757) 622-7382", false],
  ["-1 (757) 622-7382", false],
  ["2 757 622-7382", false],
  ["10 (757) 622-7382", false],
  ["27576227382", false],
  ["(275)76227382", false],
  ["2(757)6227382", false],
  ["2(757)622-7382", false],
  ["555)-555-5555", false],
  ["(555-555-5555", false],
  ["(555)5(55?)-5555", false]
])("telephoneCheck(%p)", (s, expected) =>
  expect(telephoneCheck(s)).toBe(expected)
);

test.each([
  ["(234)567-8901", true],
  ["", false],
  ["2345678901", true],
  ["234-567-8901", true],
  ["(234)-567-8901", false]
])("match(%p)", (s, expected) => expect(match(s)).toBe(expected));

test.each([
  ["+1 (234) 567-8901", "(234)567-8901"],
  ["0 234 567 8901", ""],
  ["234 567 8901", "2345678901"],
  ["  23 4\t- 567-89  0 1 ", "234-567-8901"],
  ["1(234)-567-8901", "(234)-567-8901"]
])("clean(%p)", (s, expected) => expect(clean(s)).toBe(expected));
