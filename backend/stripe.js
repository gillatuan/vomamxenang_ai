"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeClient = getStripeClient;
const stripe_1 = __importDefault(require("stripe"));
function getStripeClient() {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
        throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    return new stripe_1.default(secret, { apiVersion: '2026-04-22.dahlia' });
}
//# sourceMappingURL=stripe.js.map