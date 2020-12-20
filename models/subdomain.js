const mongoose = require('mongoose');

const subdomainSchema = new mongoose.Schema({
    subdomain: {
        type: String,
        required: true,
        unique: true
    },
    isFinal: {
        type: Boolean,
        required: true
    },
    removeDate: {
        type: Date,
        required: true
    }
});
const Subdomain = mongoose.model('Subdomain', subdomainSchema);

async function createSubdomain(domain) {
    const subdomain = new Subdomain({
        subdomain: domain,
        isFinal: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await subdomain.save();
}
async function deleteOutdated(removeDate) {
    const subdomains = await Subdomain.find();
    for(var i = 0; i < subdomains.length; i++) {
        if (subdomains[i].removeDate < new Date() && !subdomains[i].isFinal) {
            await Subdomain.deleteOne({ _id: subdomains[i]._id });
        }
    }
}
async function finalizeSubdomain(subdomain) {
    await Subdomain.updateOne({ subdomain: subdomain }, {
        $set: {
            isFinal: true
        }
    });
}
module.exports.createSubdomain = createSubdomain;
module.exports.deleteOutdated = deleteOutdated;
module.exports.finalizeSubdomain = finalizeSubdomain;