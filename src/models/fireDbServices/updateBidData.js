const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const initializeApp = require("../../DB/firebaseInitialize");
const updateBidData = async (reqData,bidId) => {
    //console.log("reqData", reqData);
    //console.log("bidId", bidId);
    const db = getFirestore();
    //Insert Bid Data
    const bidsRef = await db.collection('bids').doc(bidId).update(reqData);
    
};
module.exports = updateBidData;