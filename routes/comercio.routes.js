import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { isAuth, hasRole } from "../middlewares/auth.middlewares.js";
import {
    comercioDashboard,
    getCategories,
    createCategory,
    deleteCategory,
    getProducts,
    createProductView,
    createProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus
} from "../controllers/comercio.controller.js";

const router = Router();

router.get("/comercio", isAuth, hasRole("comercio"), comercioDashboard);
router.get("/comercio/categories", isAuth, hasRole("comercio"), getCategories);
router.post("/comercio/categories", isAuth, hasRole("comercio"), createCategory);
router.post("/comercio/categories/delete/:id", isAuth, hasRole("comercio"), deleteCategory);

router.get("/comercio/products", isAuth, hasRole("comercio"), getProducts);

router.get("/comercio/createProducts", isAuth, hasRole("comercio"), createProductView);

router.post("/comercio/createProducts", isAuth, hasRole("comercio"), upload.single("imagen"), createProduct);

router.post("/comercio/products/delete/:id", isAuth, hasRole("comercio"), deleteProduct);

router.get("/comercio/orders", isAuth, hasRole("comercio"), getOrders);

router.post("/comercio/orders/:id", isAuth, hasRole("comercio"), updateOrderStatus);

export default router;
