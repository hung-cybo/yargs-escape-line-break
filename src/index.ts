import yargs from "yargs";

// eslint-disable-next-line no-unused-expressions
yargs
  .option("foo", {
    describe: "Foo option\nThe description for foo option\nShould be aligned with foo option",
    type: "string",
  })
  .option("bar", {
    describe: "Bar option",
    type: "string",
  })
  .completion()
  .help().argv;
