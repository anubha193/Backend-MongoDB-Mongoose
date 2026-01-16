import moongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema({
    subscriber: {
        typeof: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        typeof: Schema.Types.ObjectId,
        ref: "User"
    }
});

const Subscription = moongoose.model("Subscription", subscriptionSchema);
export default Subscription;