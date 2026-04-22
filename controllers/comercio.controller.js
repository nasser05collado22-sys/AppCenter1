import { Category } from "../models/Category.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";

export const comercioDashboard = async (req, res) => {
    const [productsCount, categoriesCount, activeOrders] = await Promise.all([
        Product.countDocuments({ comercio: req.session.user.id }),
        Category.countDocuments({ comercio: req.session.user.id }),
        Order.countDocuments({
            comercio: req.session.user.id,
            estado: { $in: ["pendiente", "preparando", "listo", "en camino"] }
        })
    ]);

    res.render("comercio/dashboard", {
        productsCount,
        categoriesCount,
        activeOrders
    });
};

export const getCategories = async (req, res) => {
    const categories = await Category.find({
        comercio: req.session.user.id
    })
        .sort({ nombre: 1 })
        .lean();

    res.render("comercio/categories", { categories });
};

export const createCategory = async (req, res) => {
    if (!req.body.nombre?.trim()) {
        const categories = await Category.find({ comercio: req.session.user.id }).lean();
        return res.render("comercio/categories", {
            categories,
            error: "El nombre de la categoria es requerido"
        });
    }

    await Category.create({
        nombre: req.body.nombre,
        comercio: req.session.user.id
    });

    res.redirect("/comercio/categories");
};

export const deleteCategory = async (req, res) => {
    await Category.deleteOne({
        _id: req.params.id,
        comercio: req.session.user.id
    });

    await Product.updateMany(
        { categoria: req.params.id, comercio: req.session.user.id },
        { $set: { categoria: null } }
    );

    res.redirect("/comercio/categories");
};

export const getProducts = async (req, res) => {
    const products = await Product.find({
        comercio: req.session.user.id
    })
        .populate("categoria")
        .sort({ createdAt: -1 })
        .lean();

    res.render("comercio/products", { products });
};

export const createProductView = async (req, res) => {
    const categories = await Category.find({
        comercio: req.session.user.id
    }).lean();

    res.render("comercio/createProducts", { categories });
};

export const createProduct = async (req, res) => {
    const { nombre, precio, descripcion, categoria } = req.body;

    if (!nombre?.trim() || !precio || !descripcion?.trim()) {
        const categories = await Category.find({ comercio: req.session.user.id }).lean();
        return res.render("comercio/createProducts", {
            categories,
            error: "Nombre, precio y descripcion son requeridos"
        });
    }

    let imagen = null;

    if (req.file) {
        imagen = "/uploads/" + req.file.filename;
    }

    await Product.create({
        nombre,
        precio,
        descripcion,
        imagen,
        categoria: categoria || null,
        comercio: req.session.user.id
    });

    res.redirect("/comercio/products");
};

export const deleteProduct = async (req, res) => {
    await Product.deleteOne({
        _id: req.params.id,
        comercio: req.session.user.id
    });

    res.redirect("/comercio/products");
};

export const getOrders = async (req, res) => {
    const orders = await Order.find({
        comercio: req.session.user.id
    })
        .populate("cliente")
        .sort({ createdAt: -1 })
        .lean();

    res.render("comercio/orders", { orders });
};

export const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.comercio.toString() !== req.session.user.id) {
        return res.redirect("/comercio/orders");
    }

    if (order.estado === "pendiente") {
        order.estado = "preparando";
    } else if (order.estado === "preparando") {
        order.estado = "listo";
    }

    await order.save();

    res.redirect("/comercio/orders");
};
