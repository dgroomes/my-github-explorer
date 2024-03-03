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
