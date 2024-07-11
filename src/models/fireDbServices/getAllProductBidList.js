const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const initializeApp = require("../../DB/firebaseInitialize");
const getAllProductBidList = async (reqData) => {
    const db = getFirestore();
    //Get all bid data as a buyer/seller
    const bidsRef = await db.collection('bids');
    const snapshot = await bidsRef.orderBy("createdAt", "desc").limit(15).get();
    let allaData = [];
    snapshot.forEach(doc => {
        allaData.push(doc.data());
    });
    return allaData;
};
module.exports = getAllProductBidList;