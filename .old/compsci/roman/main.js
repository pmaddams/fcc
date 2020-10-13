import readline from "readline";

function main() {
  readline
    .createInterface({
      input: process.stdin
    })
    .on("line", s => console.log(convertToRoman(parseInt(s))));
}

export function convertToRoman(n) {
  const a = [];
  while (n > 0) {
    for (const [decimal, roman] of [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"]
    ]) {
      if (n >= decimal) {
        a.push(roman);
        n -= decimal;
        break;
      }
    }
  }
  return a.join("");
}

if (process.env.NODE_ENV !== "test") {
  main();
}
