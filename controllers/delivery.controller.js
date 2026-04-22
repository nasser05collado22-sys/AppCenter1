import { Order } from "../models/Order.model.js";

export const deliveryHome = async (req, res) => {
    const [availableCount, activeOrder] = await Promise.all([
        Order.countDocuments({
            estado: { $in: ["pendiente", "listo"] },
            delivery: null
        }),
        Order.findOne({
            delivery: req.session.user.id,
            estado: "en camino"
        }).lean()
    ]);

    res.render("delivery/home", {
        availableCount,
        hasActiveOrder: Boolean(activeOrder)
    });
};

export const availableOrders = async (req, res) => {
    const orders = await Order.find({
        estado: { $in: ["pendiente", "listo"] },
        delivery: null
    })
        .populate("cliente")
        .populate("comercio")
        .sort({ createdAt: -1 })
        .lean();

    res.render("delivery/orders", { orders });
};

export const myOrders = async (req, res) => {
    const orders = await Order.find({
        delivery: req.session.user.id
    })
        .populate("comercio")
        .sort({ createdAt: -1 })
        .lean();

    res.render("delivery/myOrders", { orders });
};

export const acceptOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.redirect("/delivery/orders");
    }

    if (order.delivery || !["pendiente", "listo"].includes(order.estado)) {
        return res.send("Este pedido ya no está disponible");
    }

    const existing = await Order.findOne({
        delivery: req.session.user.id,
        estado: "en camino"
    });

    if (existing) {
        return res.send("Ya tienes un pedido en proceso");
    }

    order.estado = "en camino";
    order.delivery = req.session.user.id;

    await order.save();

    res.redirect("/delivery/myOrders");
};

export const completeOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.delivery?.toString() !== req.session.user.id) {
        return res.redirect("/delivery/myOrders");
    }

    order.estado = "entregado";
    await order.save();

    res.redirect("/delivery/myOrders");
};

export const leaveOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.delivery?.toString() !== req.session.user.id) {
        return res.redirect("/delivery/myOrders");
    }

    order.estado = "listo";
    order.delivery = null;

    await order.save();

    res.redirect("/delivery/orders");
};
