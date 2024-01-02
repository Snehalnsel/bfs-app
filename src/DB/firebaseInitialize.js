const serviceAccount = require("./service_account.json");
const { initializeApp, cert } = require('firebase-admin/app');
initializeApp({
    credential: cert(serviceAccount),
    ignoreUndefinedProperties:true
});