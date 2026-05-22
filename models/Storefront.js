import mongoose from 'mongoose';

const storefrontSchema = new mongoose.Schema({
    heroHeadline: { type: String, default: "Elegance \n Redefined" },
    heroSubtext: { type: String, default: "Discover breathtaking craftsmanship and unparalleled brilliance curated exclusively for you." },
    heroBgImage: { type: String, default: "https://images.unsplash.com/photo-1599643478524-fb66f7ca31df?q=80&w=2574&auto=format&fit=crop" },
    
    categoryLeftTitle: { type: String, default: "Exquisite Rings" },
    categoryLeftImage: { type: String, default: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=2670&auto=format&fit=crop" },
    
    categoryTopRightTitle: { type: String, default: "Necklaces" },
    categoryTopRightImage: { type: String, default: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=2574&auto=format&fit=crop" },
    
    categoryBottomRightTitle: { type: String, default: "Bespoke Bracelets" },
    categoryBottomRightImage: { type: String, default: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop" }
}, { timestamps: true });

const StorefrontModel = mongoose.models.Storefront || mongoose.model('Storefront', storefrontSchema);
export default StorefrontModel;
