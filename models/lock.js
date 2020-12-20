const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
    attempts: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
});
const Lock = mongoose.model('Lock', lockSchema);

async function createLock(email) {
    const lock = await Lock.findOne({ email: email });
    if(lock == null) {
        const l = new Lock({
            attempts: 0,
            date: new Date(new Date().getTime() + 30*60000),
            email: email,
        });
        await l.save();
    } else {
        lock.attempts += 1;
        await lock.save();
    }
}
async function getLock(email) {
    return await Lock.findOne({ email: email });
}
module.exports.createLock = createLock;
module.exports.getLock = getLock;