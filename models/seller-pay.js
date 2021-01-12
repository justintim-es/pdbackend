const mongoose = require('mongoose');

const sellerPaySchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    isPayed: {
        type: Boolean,
        required: true
    }
});
const SellerPay = mongoose.model('SellerPay', sellerPaySchema);

async function createSellerPay() {
    
}