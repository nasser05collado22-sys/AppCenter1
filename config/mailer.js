import dotenv from "dotenv";

dotenv.config();

const cleanEnv = value => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^["']|["']$/g, "");
};

const brevoApiKey = cleanEnv(process.env.BREVO_API_KEY);
const brevoSenderEmail = cleanEnv(process.env.BREVO_SENDER_EMAIL);
const brevoSenderName = cleanEnv(process.env.BREVO_SENDER_NAME) || "AppCenar";

const normalizeRecipients = value => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
        return [value.trim()];
    }

    return [];
};

export const isMailerConfigured = () => Boolean(brevoApiKey && brevoSenderEmail);

export const transporter = {
    async sendMail({ from, to, subject, html, text }) {
        if (!isMailerConfigured()) {
            throw new Error("Brevo no esta configurado. Revisa BREVO_API_KEY y BREVO_SENDER_EMAIL.");
        }

        const recipients = normalizeRecipients(to);

        if (recipients.length === 0) {
            throw new Error("No se especifico un destinatario para el correo.");
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": brevoApiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender: from
                    ? { email: from, name: brevoSenderName }
                    : { email: brevoSenderEmail, name: brevoSenderName },
                to: recipients.map(email => ({ email })),
                subject,
                htmlContent: html || text || ""
            })
        });

        if (response.ok) {
            return { ok: true };
        }

        const data = await response.json().catch(() => ({}));
        const message = data?.message || `Brevo respondio con estado ${response.status}`;
        throw new Error(message);
    }
};

export const verifyMailer = async () => {
    if (!isMailerConfigured()) {
        console.log("Mailer omitido: faltan BREVO_API_KEY o BREVO_SENDER_EMAIL");
        return false;
    }

    console.log("Mailer listo (Brevo)");
    return true;
};
