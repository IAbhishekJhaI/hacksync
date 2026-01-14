import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    mail: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    skills: {
        beginner: [String],
        intermediate: [String],
        advanced: [String],
    },
    interests: [String],
    wantToBeFound: { type: Boolean, default: true },
});

export const User = mongoose.model('User', userSchema);
