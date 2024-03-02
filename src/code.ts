/*
Miscellaneous code that I don't know/care where to put.
*/

// Well this was a bit of a learning journey to get here, but I'm satisfied. I'm still building an intuition with
// unions and interfaces. It's run-of-the-mill to use a union of string (like in EnteredToken) but it's cool that I can
// union over a combination of strings and interfaces (and other types).
//
// It didn't come naturally, but I think I'm building an intuition for it.
export type TokenState = "restoring" | "empty" | EnteredToken | ValidatedToken | Error;

export interface EnteredToken {
  kind: "partial" | "entered" | "validating" | "restored" | "invalid";
  token: string;
}

export interface Error {
  kind: "error";
  error: string;
}

export interface ValidatedToken {
  kind: "valid" | "storing";
  token: string;
  login: string;
}

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  // @ts-ignore This is a legitimate option.
  fractionalSecondDigits: 3,
  timeZoneName: "short",
});

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
 *     5:12:21.266 PM CST [myLogger] - Hello world
 *
 * @param name The name of the logger.
 */
export function logger(name: string) {
  return function(...args: any[]) {
    const time = TIME_FORMATTER.format(new Date());
    console.log(`${time} [${name}] - `, ...args);
  };
}
