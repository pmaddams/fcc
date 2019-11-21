import readline from "readline";

function main() {
  readline.createInterface({
    input: process.stdin
  }).on("line", s =>
    console.log(telephoneCheck(s))
  );
}

export function telephoneCheck(s) {
  return match(clean(s));
}

export function match(s) {
  // (234)567[-]8901
  const type1 = "^\\(\\d{3}\\)\\d{3}-?\\d{4}$";
  // 234-567-8901
  const type2 = "^\\d{3}-\\d{3}-\\d{4}$";
  // 2345678901
  const type3 = "^\\d{10}$";

  return new RegExp(`${type1}|${type2}|${type3}`).test(s);
}

export function clean(s) {
  const a = Array.from(s.replace(/\s/g, ""));
  if (a.length < 10) {
    return "";
  }
  if (a[0] === "1") {
    a.shift();
  } else if (a[0] === "+" && a[1] === "1") {
    a.splice(0, 2);
  }
  const i = a[0] === "(" ? 1 : 0;
  if (a[i] === "0" || a[i] === "1") {
    return "";
  }
  return a.join("");
}

if (process.env.NODE_ENV !== "test") {
  main();
}
