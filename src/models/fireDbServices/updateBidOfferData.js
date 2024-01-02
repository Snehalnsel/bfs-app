const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const initializeApp = require("../../DB/firebaseInitialize");
const updateBidOfferData = async (reqData,bidOfferId) => {
    const db = getFirestore();
    //Insert Bid Data
    const bidsRef = await db.collection('bidOffers').doc(bidOfferId).set(reqData);
    
};
module.exports = updateBidOfferData;