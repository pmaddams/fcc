function main() {
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
    const n = c.charCodeAt(0);
    const numeric = n >= 48 && n <= 57;
    const uppercase = n >= 65 && n <= 90;
    const lowercase = n >= 97 && n <= 122;
    if (!(numeric || lowercase || uppercase)) {
      return false;
    }
  }
  return true;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
