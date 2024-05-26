import mongoose from "mongoose";
const { Schema } = mongoose;

const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: false,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    ingredients: [
      {
        name: {
          type: String,
          required: false,
        },
        measure: {
          type: String,
          required: false,
        },
      },
    ],
    purchasedBy: {
      type: [{ type: String }],
      default: [],
    },
    likes: {
      type: [{ type: String }],
      default: [],
    },
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
