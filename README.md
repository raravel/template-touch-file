# template-touch-file

This can be used in place of `touch` command.
When create new source file, you can create new file with your prefix template.

## Install

```sh
npm install -g template-touch-file
```

## Usage

```sh
$ tf
Usage: tf [options...] [file]
       file:   target file path

Options
  --author               Who are author? [default: (from git config)]
  --email                What is author's email? [default: (from git config)]
  --license              File license [default: MIT]
```

```sh
tf --author=tree-some path/to/file.js
```

## Config

`.tsrc` must be exist your project source root directory.
ex) It should be in the same directory as package.json.

```json
{
	"author": "tree-some",
	"email": "youn@tree-some.dev",
	"license": "MIT"
}
```

It need not be included unconditionally.

```json
{
	"author": "tree-some"
}
```

## Custom Template

You can create template specific files as `$HOME/tf` directory.
File name form is `tf.[ext]`.
ex) `tf.js` is for `*.js` file template.

`tf.default` is for an unknown format.
Default templates can be found [here](https://github.com/tree-some/template-touch-file/tree/master/tf).
