import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  displayName: {
    require: true,
    type: String,
  },
  email: {
    require: true,
    type: String,
    unique: true,
  },
  photoURL: {
    require: false,
    type: String,
    default: "",
  },
  coin: {
    require: false,
    type: Number,
    default: 50,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
