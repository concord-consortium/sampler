# CODAP Plugin Starter Project

This is a bare-bones React project, created with the `--typescript` version of [Create React App](https://github.com/facebook/create-react-app), and left un-ejected. This is simply a trivial React view with the libraries for using the [CODAP Plugin API](https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API).

## Development

### Initial steps

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement

## Testing the plugin in CODAP

Currently there is no trivial way to load a plugin running on a local server with `http` into the online CODAP, which forces `https`. One simple solution is to download the latest `build_[...].zip` file from https://codap.concord.org/releases/zips/, extract it to a folder and run it locally. If CODAP is running on port 8080, and this project is running by default on 3000, you can go to

http://127.0.0.1:8080/static/dg/en/cert/index.html?di=http://localhost:3000

to see the plugin running in CODAP.

# Updating translations

The translations are maintained in POEditor.  To update the translation strings stored in `src/utils/pulled-strings.json` run:

`npm run strings:pull -- APITOKEN` where `APITOKEN` is visible for your account at https://poeditor.com/account/api.


