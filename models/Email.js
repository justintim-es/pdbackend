const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true,
        unique: true
    }
});
const Email = mongoose.model('Email', emailSchema);

async function createEmail(value) {
    const email = new Email({
        value: value
    });
    await email.save();
}
module.exports.createEmail = createEmail;