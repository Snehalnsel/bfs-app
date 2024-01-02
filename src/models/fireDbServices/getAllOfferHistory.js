const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const initializeApp = require("../../DB/firebaseInitialize");
const getAllOfferHistory = async (reqData) => {
    const db = getFirestore();
    //Get all bid offer history data as a buyer/seller
    const bidsRef = await db.collection('bidOffers');
    const snapshot  = await bidsRef.where('bidId', '==', reqData.bidId).limit(50).get();
    let allaData = [];
    snapshot.forEach(doc => {
        allaData.push(doc.data());
    });
    return allaData;
};
module.exports = getAllOfferHistory;