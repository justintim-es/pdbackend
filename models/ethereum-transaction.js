const mongoose = require('mongoose');

const ethereumTransactionSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    prischic
})