const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { onCustomEventPublished} = require("firebase-functions/v2/eventarc");

const initializeApp = require("../../DB/firebaseInitialize");
const db = getFirestore();
// Declare a variable to hold the change stream
let changeStream;
const checkChangesInField = async (reqData) =>{
    const bidsRef = await db.collection('bids').doc("bid_65d32286b7cc28e479341711_65659ed980149f0cc691ccb1_1708421970111");
    const observer = bidsRef.onSnapshot(docSnapshot => {
        console.log(`Received doc snapshot: ${docSnapshot}`);
        // ...
      }, err => {
        console.log(`Encountered error: ${err}`);
    });
};
module.exports = checkChangesInField;