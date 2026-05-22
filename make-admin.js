const mongoose = require('mongoose');

// Grab URL from .env.local if possible, or use the direct URI we set earlier
const MONGODB_URI = "mongodb://rsj_db:%40Windows8@ac-q87jhku-shard-00-00.vumnwrq.mongodb.net:27017,ac-q87jhku-shard-00-01.vumnwrq.mongodb.net:27017,ac-q87jhku-shard-00-02.vumnwrq.mongodb.net:27017/RSJ?ssl=true&replicaSet=atlas-r1vbpe-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// Minimal User Schema
const userSchema = new mongoose.Schema({
    email: String,
    role: String
}, { collection: 'users' });

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

async function elevateToAdmin() {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully.");

        // IMPORTANT: Replace 'elegance@ratna.com' with the email you registered with
        const EMAIL_TO_UPGRADE = "manandharishan188@gmail.com"; 

        const user = await UserModel.findOne({ email: EMAIL_TO_UPGRADE });

        if (!user) {
            console.log(`User with email ${EMAIL_TO_UPGRADE} not found.`);
        } else {
            user.role = 'admin';
            await user.save();
            console.log(`Successfully upgraded ${EMAIL_TO_UPGRADE} to ADMIN status!`);
        }
    } catch (err) {
        console.error("Error connecting or updating:", err);
    } finally {
        await mongoose.disconnect();
    }
}

elevateToAdmin();
