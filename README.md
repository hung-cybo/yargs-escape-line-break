[//]: # (# Archived)

[//]: # (The issue was closed in .)

# yargs-generate-broken-completion-with-line-break

minimal reproduction of https://github.com/yargs/yargs/issues/2268 .

## Summary

When we generate the completion script for zsh, with the description of option having line break, the completion shown is incorrect.

```shell
--bar          -- Bar option
--foo          -- Foo option
--help         -- Show help
--version      -- Show version number
Should be aligned with foo option  The description for foo option
```

## Reproduction

The minimum reproduction in https://github.com/hung-cybo/yargs-escape-line-break

```shell
# If you don't enable zsh-completion, you need to enable it first.
# Clone and configure repository
$ git clone git@github.com:hung-cybo/yargs-escape-line-break.git
$ cd yargs-escape-line-break
$ npm ci
$ npm run build
$ ./cli.js completion > /path/to/your/fpath/_cli.js
# Reload the shell
```

In the repository, I specified the options as follows.

```javascript
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
```

With the line break, the option `--help` display the description easier to read.

```shell
Options:
  --version  Show version number                                       [boolean]
  --foo      Foo option
             The description for foo option
             Should be aligned with foo option                          [string]
  --bar      Bar option                                                 [string]
  --help     Show help                                                 [boolean]
```

### Expected Behavior

The output when I strike the **TAB** should be the following.

```shell
./cli.js completion #Strike TAB
--bar      -B  -- Bar option
--foo      -F  -- Foo option The description for foo option Should be aligned with foo option
--help         -- Show help
--version      -- Show version number
```

The line break should be converted to whitespace.

### Actual Behavior

The actual output is the following.

The description of `--foo` option is displayed at the end of the output.

```shell
./cli.js completion #Strike TAB
 -- values --
--bar          -- Bar option
--foo          -- Foo option
--help         -- Show help
--version      -- Show version number
Should be aligned with foo option  The description for foo option
```

## Cause

When requesting a completion by striking the **TAB** key, the completion function calls the original file with `--get-yargs-completions` option.
It is specified in the completion script as follows.

```shell
_cli.js_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'
' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" ./cli.js --get-yargs-completions "${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _cli.js_yargs_completions cli.js
```

With the current version of yargs, the output is the following.

```shell
$ node ./lib/index.js --get-yargs-completions -
--version:Show version number
--foo:Foo option
The description for foo option
Should be aligned with foo option
--bar:Bar option
--help:Show help
```

The description of `--foo` option is displayed in multi-lines.

And with the current behavior of zsh-completion, each line will be evaluated:
- If It meets the format `key:desc` => mark it as an option
- If It does not meet the format `key:desc` => move it to the bottom

That's why the description of `--foo` option is displayed incorrectly.

## Lisence

This project is licensed under the [MIT license.](./LICENSE)
