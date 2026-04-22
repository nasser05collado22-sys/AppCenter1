import { Router } from "express";
import { isAuth, hasRole } from "../middlewares/auth.middlewares.js";
import {
    adminDashboard,
    getUsers,
    toggleUser,
    configView,
    updateConfig,
    getCommerceTypes,
    createCommerceType,
    updateCommerceType,
    deleteCommerceType,
    adminsView,
    createAdmin
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/admin", isAuth, hasRole("admin"), adminDashboard);

router.get("/admin/users/:role", isAuth, hasRole("admin"), getUsers);

router.post("/admin/users/toggle/:id", isAuth, hasRole("admin"), toggleUser);

router.get("/admin/config", isAuth, hasRole("admin"), configView);
router.post("/admin/config", isAuth, hasRole("admin"), updateConfig);

router.get("/admin/commerce-types", isAuth, hasRole("admin"), getCommerceTypes);
router.post("/admin/commerce-types", isAuth, hasRole("admin"), upload.single("icono"), createCommerceType);
router.post("/admin/commerce-types/:id", isAuth, hasRole("admin"), upload.single("icono"), updateCommerceType);
router.post("/admin/commerce-types/delete/:id", isAuth, hasRole("admin"), deleteCommerceType);

router.get("/admin/admins", isAuth, hasRole("admin"), adminsView);
router.post("/admin/admins", isAuth, hasRole("admin"), createAdmin);

export default router;
