const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { onCustomEventPublished} = require("firebase-functions/v2/eventarc");

const initializeApp = require("../../DB/firebaseInitialize");
const db = getFirestore();
const checkChangesInField = async (reqData) =>{
    const bidsRef = await db.collection('bids').doc(reqData.bidId);
    const observer = bidsRef.onSnapshot(docSnapshot => {
        console.log(11111);
        return true;
      }, err => {
        console.log(222222);
        return false;
        //console.log(`Encountered error: ${err}`);
    });
};
module.exports = checkChangesInField;