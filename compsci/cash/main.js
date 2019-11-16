import readline from "readline";

function main() {
  readline.createInterface({
    input: process.stdin
  }).on("line", s => {
    console.log("");
  });
}

export function checkCashRegister(price, cash, cid) {
  // Convert dollars to cents and treat cid as an array of numbers in reverse order.
  price = Math.round(100*price);
  cash = Math.round(100*cash);
  cid = cid.map(p => Math.round(100*p[1])).reverse();

  let needed = cash - price;
  if (needed < 0) {
    return insufficient();
  }
  const avail = sum(cid);
  if (avail < needed) {
    return insufficient();
  }
  const change = [];
  for (let [amount, denom] of zip(cid, [10000, 2000, 1000, 500, 100, 25, 10, 5, 1])) {
    let n = 0;
    while (needed >= denom && amount >= denom) {
      n += denom;
      needed -= denom;
      amount -= denom;
    }
    change.push(n);
  }
  if (needed > 0) {
    // Handle case where greedy selection of quarters instead of dimes fails.
    if (needed <= 5 &&
        change[5] >= 25 &&
        cid[6] - change[6] >= 30) {
      // Replace a quarter with three dimes.
      change[5] -= 25;
      change[6] += 30;
      needed -= 5;
      // Take back any extra pennies.
      while (needed < 0) {
        change[8]--;
        needed++;
      }
    } else {
      return insufficient();
    }
  }
  return {
    status: sum(change) === avail ? "CLOSED" : "OPEN",
    // Convert cents to dollars and reverse the change array to the original order.
    change: zip(["PENNY", "NICKEL", "DIME", "QUARTER", "DOLLAR", "FIVE", "TEN", "TWENTY", "HUNDRED"],
                change.map(n => 0.01*n).reverse())
  };
}

export function zip(a1, a2) {
  const res = [];
  for (let i = 0; i < Math.min(a1.length, a2.length); i++) {
    res.push([a1[i], a2[i]]);
  }
  return res;
}

export function sum(a) {
  return a.reduce((acc, val) => acc + val, 0);
}

function insufficient() {
  return {
    status: "INSUFFICIENT_FUNDS",
    change: []
  };
}

if (process.env.NODE_ENV !== "test") {
  main();
}
