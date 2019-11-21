import readline from "readline";
import { promisify } from "util";

function main() {
  collect(readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })).then(val =>
    console.log(checkCashRegister.apply(null, val))
  ).finally(process.exit);
}

async function collect(rl) {
  const input = promisify((prompt, f) =>
    rl.question(prompt, s => {
      const n = parseFloat(s);
      return f(null, n >= 0 ? n : 0);
    })
  );

  const val = [];
  val.push(await input("price: "));
  val.push(await input("cash: "));

  const cid = [];
  for (const [s, prompt] of [
    ["PENNY", "pennies"],
    ["NICKEL", "nickels"],
    ["DIME", "dimes"],
    ["QUARTER", "quarters"],
    ["ONE", "ones"],
    ["FIVE", "fives"],
    ["TEN", "tens"],
    ["TWENTY", "twenties"],
    ["ONE HUNDRED", "hundreds"]
  ]) {
    cid.push([s, await input(`${prompt}: `)]);
  }
  val.push(cid);

  return val;
}

export function checkCashRegister(price, cash, cid) {
  let needed = Math.round(100*(cash - price));
  if (needed < 0) {
    return insufficient();
  }
  const avail = cid.map(p => Math.round(100*p[1])).reverse();
  const total = sum(avail);
  if (total < needed) {
    return insufficient();
  }
  const change = [];
  for (let [denom, amount] of zip([10000, 2000, 1000, 500, 100, 25, 10, 5, 1], avail)) {
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
        avail[6] - change[6] >= 30) {
      // Replace a quarter with three dimes.
      change[5] -= 25;
      change[6] += 30;
      needed -= 5;
      // Remove any extra pennies.
      while (needed < 0) {
        change[8]--;
        needed++;
      }
    } else {
      return insufficient();
    }
  }
  return sum(change) === total ? {
    status: "CLOSED",
    change: cid
  } : {
    status: "OPEN",
    change: zip(["ONE HUNDRED", "TWENTY", "TEN", "FIVE", "ONE", "QUARTER", "DIME", "NICKEL", "PENNY"],
              change.map(n => 0.01*n)).filter(p => p[1] !== 0)
  }
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
