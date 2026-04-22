import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { CommerceType } from "../models/CommerceType.model.js";
import { Config } from "../models/Config.model.js";
import { User } from "../models/User.model.js";

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

const bootstrapAdminFromEnv = async () => {
    const adminsCount = await User.countDocuments({ role: "admin" });

    if (adminsCount > 0) {
        return;
    }

    const {
        ADMIN_NAME,
        ADMIN_LASTNAME,
        ADMIN_EMAIL,
        ADMIN_USERNAME,
        ADMIN_PASSWORD,
        ADMIN_CEDULA
    } = process.env;

    if (!ADMIN_NAME || !ADMIN_LASTNAME || !ADMIN_EMAIL || !ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_CEDULA) {
        console.log("No se creo admin inicial: faltan variables ADMIN_*");
        return;
    }

    const exists = await User.findOne({
        $or: [
            { email: ADMIN_EMAIL.trim() },
            { username: ADMIN_USERNAME.trim() }
        ]
    });

    if (exists) {
        return;
    }

    await User.create({
        nombre: ADMIN_NAME.trim(),
        apellido: ADMIN_LASTNAME.trim(),
        cedula: ADMIN_CEDULA.trim(),
        email: ADMIN_EMAIL.trim().toLowerCase(),
        username: ADMIN_USERNAME.trim(),
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: "admin",
        activo: true
    });

    console.log("Admin inicial creado desde variables de entorno");
};

export const connectDB = async () => {
    try {
        const env = process.env.APP_ENV || process.env.NODE_ENV || "development";
        const mongoUri = env === "qa"
            ? process.env.MONGO_URI_QA || process.env.MONGO_URI
            : env === "production"
                ? process.env.MONGO_URI_PROD || process.env.MONGO_URI
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

        await bootstrapAdminFromEnv();

        console.log("MongoDB conectado");
        return mongoUri;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
