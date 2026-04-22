import dotenv from "dotenv";

dotenv.config();

const cleanEnv = value => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/^["']|["']$/g, "");
};

const sendGridApiKey = cleanEnv(process.env.SENDGRID_API_KEY);
const sendGridFrom = cleanEnv(process.env.SENDGRID_FROM);

const normalizeRecipients = value => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
        return [value.trim()];
    }

    return [];
};

export const isMailerConfigured = () => Boolean(sendGridApiKey && sendGridFrom);

export const transporter = {
    async sendMail({ from, to, subject, html, text }) {
        if (!isMailerConfigured()) {
            throw new Error("SendGrid no esta configurado. Revisa SENDGRID_API_KEY y SENDGRID_FROM.");
        }

        const recipients = normalizeRecipients(to);

        if (recipients.length === 0) {
            throw new Error("No se especifico un destinatario para el correo.");
        }

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sendGridApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: recipients.map(email => ({ email })),
                        subject
                    }
                ],
                from: {
                    email: from || sendGridFrom
                },
                content: [
                    {
                        type: "text/html",
                        value: html || text || ""
                    }
                ]
            })
        });

        if (response.ok) {
            return { ok: true };
        }

        const data = await response.json().catch(() => ({}));
        const message = data?.errors?.[0]?.message || `SendGrid respondio con estado ${response.status}`;
        throw new Error(message);
    }
};

export const verifyMailer = async () => {
    if (!isMailerConfigured()) {
        console.log("Mailer omitido: faltan SENDGRID_API_KEY o SENDGRID_FROM");
        return false;
    }

    console.log("Mailer listo (SendGrid)");
    return true;
};
