import readline from "readline";

function main() {
  readline.createInterface({
    input: process.stdin
  }).on("line", s => {
    console.log(convertToRoman(parseInt(s)));
  });
}

export function convertToRoman(n) {
  const a = [];
  while (n > 0) {
    if (n >= 1000) {
      a.push("M");
      n -= 1000;
    } else if (n >= 900) {
      a.push("CM");
      n -= 900;
    } else if (n >= 500) {
      a.push("D");
      n -= 500;
    } else if (n >= 400) {
      a.push("CD");
      n -= 400;
    } else if (n >= 100) {
      a.push("C");
      n -= 100;
    } else if (n >= 90) {
      a.push("XC");
      n -= 90;
    } else if (n >= 50) {
      a.push("L");
      n -= 50;
    } else if (n >= 40) {
      a.push("XL");
      n -= 40;
    } else if (n >= 10) {
      a.push("X");
      n -= 10;
    } else if (n >= 9) {
      a.push("IX");
      n -= 9;
    } else if (n >= 5) {
      a.push("V");
      n -= 5;
    } else if (n >= 4) {
      a.push("IV");
      n -= 4;
    } else if (n >= 1) {
      a.push("I");
      n -= 1;
    }
  }
  return a.join("");
}

if (process.env.NODE_ENV !== "test") {
  main();
}
