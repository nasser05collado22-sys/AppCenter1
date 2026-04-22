import mongoose from "mongoose";
import { CommerceType } from "../models/CommerceType.model.js";
import { Config } from "../models/Config.model.js";

const defaultCommerceTypes = [
    {
        nombre: "Restaurante",
        descripcion: "Comidas preparadas y menus",
        icono: "/images/commerce-type-placeholder.svg"
    },
    {
        nombre: "Supermercado",
        descripcion: "Compras del hogar y viveres",
        icono: "/images/commerce-type-placeholder.svg"
    },
    {
        nombre: "Farmacia",
        descripcion: "Medicinas y productos de cuidado",
        icono: "/images/commerce-type-placeholder.svg"
    }
];

export const connectDB = async () => {
    try {
        const env = process.env.APP_ENV || process.env.NODE_ENV || "development";
        const mongoUri = env === "qa"
            ? process.env.MONGO_URI_QA || process.env.MONGO_URI
            : process.env.MONGO_URI_DEV || process.env.MONGO_URI;

        await mongoose.connect(mongoUri);
        await Config.findOneAndUpdate(
            {},
            { $setOnInsert: { itbis: 18 } },
            { upsert: true, returnDocument: "after" }
        );
        const typesCount = await CommerceType.countDocuments();

        if (typesCount === 0) {
            await CommerceType.insertMany(defaultCommerceTypes);
        }

        console.log("MongoDB conectado");
        return mongoUri;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
