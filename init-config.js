const fbcli = require('firebase-tools');
const fs = require('fs');

const fileName = 'src/build/initFirebase.ts';

if (fs.existsSync("src/build/initFirebase.ts"))  {
    return false;
}

// by default, uses the current project and logged in user
fbcli.setup.web().then(config => {
    fs.writeFileSync(
        fileName,
        `
        import * as firebase from "firebase";
        
        export default () => {
            firebase.initializeApp(${JSON.stringify(config)});
        }
        `.trimLeft()
    );
});