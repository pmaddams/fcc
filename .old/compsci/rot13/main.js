import readline from "readline";

function main() {
  readline
    .createInterface({
      input: process.stdin
    })
    .on("line", s => console.log(rot13(s)));
}

export function rot13(s) {
  return Array.from(s)
    .map(c => rotateChar(c, 13))
    .join("");
}

export function rotateChar(c, n) {
  let base;
  if (c >= "A" && c <= "Z") {
    base = ord("A");
  } else if (c >= "a" && c <= "z") {
    base = ord("a");
  } else {
    return c;
  }
  return String.fromCharCode(base + rotateIndex(ord(c) - base, n));
}

export function rotateIndex(i, n) {
  return (i + n) % 26;
}

function ord(c) {
  return c.charCodeAt(0);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
