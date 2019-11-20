const fbcli = require('firebase-tools');
const fs = require('fs');

const fileName = 'src/build/initFirebase.ts';

if (fs.existsSync("src/build/initFirebase.ts"))  {
    return false;
}

fs.mkdirSync("src/build")

// by default, uses the current project and logged in user
fbcli.setup.web().then(config => {
    fs.writeFileSync(
        fileName,
        `
        import firebase from "firebase/app";
        import "firebase/auth"
        
        export default () => {
            firebase.initializeApp(${JSON.stringify(config)});
        }
        `.trimLeft()
    );
});