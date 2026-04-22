import dotenv from "dotenv";

dotenv.config();

const cleanEnv = value => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^["']|["']$/g, "");
};

const resendApiKey = cleanEnv(process.env.RESEND_API_KEY);
const resendFrom = cleanEnv(process.env.RESEND_FROM) || "AppCenar <onboarding@resend.dev>";

const normalizeRecipients = value => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
        return [value.trim()];
    }

    return [];
};

export const isMailerConfigured = () => Boolean(resendApiKey && resendFrom);

export const transporter = {
    async sendMail({ from, to, subject, html, text }) {
        if (!isMailerConfigured()) {
            throw new Error("Resend no esta configurado. Revisa RESEND_API_KEY y RESEND_FROM.");
        }

        const recipients = normalizeRecipients(to);

        if (recipients.length === 0) {
            throw new Error("No se especifico un destinatario para el correo.");
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: from || resendFrom,
                to: recipients,
                subject,
                html,
                text
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || `Resend respondio con estado ${response.status}`);
        }

        return data;
    }
};

export const verifyMailer = async () => {
    if (!isMailerConfigured()) {
        console.log("Mailer omitido: faltan RESEND_API_KEY o RESEND_FROM");
        return false;
    }

    console.log("Mailer listo (Resend)");
    return true;
};
