// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  config: {
    apiKey: "AIzaSyDcwSD78uqn1jIuvsCZZdmIKDLj5qvm-ZQ",
    authDomain: "oscon-2017-workshop.firebaseapp.com",
    databaseURL: "https://oscon-2017-workshop.firebaseio.com",
    projectId: "oscon-2017-workshop",
    storageBucket: "oscon-2017-workshop.appspot.com",
    messagingSenderId: "939560207287"
  },
  api: 'http://localhost:5000'
};
