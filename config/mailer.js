import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const cleanEnv = value => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^["']|["']$/g, "");
};

const emailUser = cleanEnv(process.env.EMAIL_USER);
const emailPass = cleanEnv(process.env.EMAIL_PASS);
const smtpHost = cleanEnv(process.env.SMTP_HOST);
const smtpPort = Number(cleanEnv(process.env.SMTP_PORT) || 0);
const smtpSecure = cleanEnv(process.env.SMTP_SECURE) === "true";

const buildTransport = () => {
    if (smtpHost && smtpPort) {
        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            auth: emailUser && emailPass
                ? {
                    user: emailUser,
                    pass: emailPass
                }
                : undefined
        });
    }

    return nodemailer.createTransport({
        service: "gmail",
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

export const isMailerConfigured = () => Boolean(emailUser && emailPass);
export const transporter = buildTransport();

export const verifyMailer = async () => {
    if (!isMailerConfigured()) {
        console.log("Mailer omitido: faltan EMAIL_USER o EMAIL_PASS");
        return false;
    }

    try {
        await transporter.verify();
        console.log("Mailer listo");
        return true;
    } catch (error) {
        console.log("Error verificando mailer:", error.message);
        return false;
    }
};
