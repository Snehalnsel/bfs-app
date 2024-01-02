const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const initializeApp = require("../../DB/firebaseInitialize");
const insertBidData = async (reqData,bidId) => {
    const db = getFirestore();
    //Insert Bid Data
    const bidsRef = await db.collection('bids').doc(bidId).set(reqData);
    
};
module.exports = insertBidData;