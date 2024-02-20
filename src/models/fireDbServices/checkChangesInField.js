const { applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { onDocumentUpdated, Change, FirestoreEvent} = require("firebase-functions/v2/firestore");

const initializeApp = require("../../DB/firebaseInitialize");
const db = getFirestore();
const checkChangesInField = onDocumentUpdated("bids/bid_65d32286b7cc28e479341711_65659ed980149f0cc691ccb1_1708421970111", (event) => {
    
});
module.exports = checkChangesInField;