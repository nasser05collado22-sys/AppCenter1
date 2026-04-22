import { Router } from "express";
import { isAuth, hasRole } from "../middlewares/auth.middlewares.js";
import {
    deliveryHome,
    availableOrders,
    myOrders,
    acceptOrder,
    completeOrder,
    leaveOrder
} from "../controllers/delivery.controller.js";

const router = Router();

router.get("/delivery", isAuth, hasRole("delivery"), deliveryHome);

router.get("/delivery/orders", isAuth, hasRole("delivery"), availableOrders);

router.get("/delivery/myOrders", isAuth, hasRole("delivery"), myOrders);

router.post("/delivery/orders/accept/:id", isAuth, hasRole("delivery"), acceptOrder);

router.post("/delivery/orders/complete/:id", isAuth, hasRole("delivery"), completeOrder);

router.post("/delivery/orders/leave/:id", isAuth, hasRole("delivery"), leaveOrder);

export default router;