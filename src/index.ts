#!/usr/bin/env node

import { delay, lastValueFrom, of, share, timeout } from "rxjs";
import { spawn } from "spawn-rx";
import * as Debug from "debug";

const d = Debug("retry-on-ci");

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main(): Promise<number> {
  const [cmd, ...args] = process.argv.slice(2);
  d("Running %s => %s", cmd, args.join(" "));

  let retries = process.env.CI_RETRIES ? parseInt(process.env.CI_RETRIES) : 3;
  let timeoutMs = process.env.CI_TIMEOUT
    ? parseInt(process.env.CI_TIMEOUT)
    : 10 * 60 * 1000;

  if (!process.env.CI) {
    d("Not in CI, not going to retry");
    retries = 1;
    timeoutMs = 8 * 60 * 60 * 1000;
  }

  let lastError: (Error & { exitCode: number }) | undefined;

  while (retries > 0) {
    const out = spawn(cmd, args).pipe(timeout({ each: timeoutMs }), share());
    out.subscribe({
      next: (x) => console.log(x),
      error: () => {},
    });

    try {
      await lastValueFrom(out);
      return 0;
    } catch (e) {
      if (!("exitCode" in e)) {
        console.error(e);
      }

      lastError = e;
    }

    retries--;
    if (retries > 0) {
      await lastValueFrom(of(0).pipe(delay(randomInt(1000, 5000))));
    }
  }

  return lastError?.exitCode ?? -1;
}

main()
  .then((x) => process.exit(x))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
