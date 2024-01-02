const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const initializeApp = require("../../DB/firebaseInitialize");
const checkBidExist = async (reqData) => {
    const db = getFirestore();
    //Get all exist reccord for buyer id and product id and withdraw false;
    const bidsRef = await db.collection('bids');
    const snapshot  = await bidsRef.where('buyerId', '==', reqData.userId).where('productId','==',reqData.productId)
    .where('sellerId','==',reqData.sellerId).where('withdrew','==',false).get();
    let allaData = [];
    snapshot.forEach(doc => {
        allaData.push(doc.data());
    });
    return allaData;
};
module.exports = checkBidExist;