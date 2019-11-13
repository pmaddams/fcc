import readline from "readline";

function main() {
  readline.createInterface({
    input: process.stdin
  }).on("line", s => {
    console.log(palindrome(s));
  });
}

export function palindrome(s) {
  const a = Array.from(s).filter(isalnum).map(c => c.toLowerCase());
  for (let i = 0; i < a.length/2; i++) {
    if (a[i] !== a[a.length-1-i]) {
      return false;
    }
  }
  return true;
}

export function isalnum(s) {
  for (const c of s) {
    if (!(c >= "0" && c <= "9" ||
          c >= "A" && c <= "Z" ||
          c >= "a" && c <= "z")) {
      return false;
    }
  }
  return true;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
