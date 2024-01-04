/*
Miscellaneous code that I don't know/care where to put.
*/

// Well this was a bit of a learning journey to get here but I'm satisfied. I'm still building an intuition with
// unions and interfaces. It's run-of-the-mill to use a union of string (like in EnteredToken) but it's cool that I can
// union over a combination of strings and interfaces (and other types).
//
// It didn't come naturally, but I think I'm building an intuition for it.
export type TokenState = "restoring" | "empty" | EnteredToken | ValidatedToken;

export interface EnteredToken {
  kind: "partial" | "entered" | "restored" | "invalid";
  token: string;
}

export interface ValidatedToken {
  kind: "valid" | "storing";
  token: string;
  login: string;
}

/**
 * Create a logger function that prepends the current time and the name of the logger.
 *
 * For example if you write:
 *
 *     const log = logger("myLogger");
 *     log("Hello world");
 *
 * Then you'll see something like this in the console:
 *
 *     2024-01-01T00:00:00.000Z [myLogger] - Hello world
 *
 * @param name
 */
export function logger(name: string) {
  return function (...args: any[]) {
    const time = new Date().toISOString();
    console.log(`${time} [${name}] - `, ...args);
  };
}
