import mongoose from "mongoose";

// key-value সেটিংস (যেমন key: "general")
const settingSchema = new mongoose.Schema({ key: { type: String, required: true, unique: true }, value: { type: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true });

export default mongoose.models.Setting || mongoose.model("Setting", settingSchema);
