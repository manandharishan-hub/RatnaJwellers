const mongoose = require('mongoose');
const uri = process.env.MONGODB_URL || "mongodb+srv://rsj_db:%40Windows8@cluster0.vumnwrq.mongodb.net/RSJ?appName=Cluster0";
const uriDirect ="mongodb://rsj_db:%40Windows8@ac-q87jhku-shard-00-00.vumnwrq.mongodb.net:27017,ac-q87jhku-shard-00-01.vumnwrq.mongodb.net:27017,ac-q87jhku-shard-00-02.vumnwrq.mongodb.net:27017/RSJ?ssl=true&replicaSet=atlas-r1vbpe-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function testConnection(connectionString, label) {
    try {
        console.log(`Testing ${label} connection...`);
        await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 5000 });
        console.log(`${label} connected successfully!`);
        await mongoose.disconnect();
    } catch (e) {
        console.error(`${label} failed: ${e.message}`);
    }
}

async function run() {
    await testConnection(uriDirect, "Direct (mongodb://)");
    await testConnection(uri, "SRV (mongodb+srv://)");
}

run();
