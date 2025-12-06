// src/controllers/wa.webhook.js
import { WhatsAppConnection } from "../../models/WhatsAppConnection.js";

// GET /wa/webhooks
export async function verifyWebhook(req, res) {
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
}

// POST /wa/webhooks
export async function handleWebhook(req, res) {
    try {
        const body = req.body;

        // Typical structure: body.entry[0].changes[0].value.metadata.phone_number_id
        const entry = body?.entry?.[0];
        const change = entry?.changes?.[0];
        const phoneNumberId = change?.value?.metadata?.phone_number_id;

        if (phoneNumberId) {
            const conn = await WhatsAppConnection.findOne({ phoneNumberId }, { businessId: 1 }).lean();
            if (conn) {
                // TODO: Use businessId to route events to the right tenant.
                // You can parse messages/status updates here and update your OutboundMessage table later.
            }
        }

        res.sendStatus(200); // Always acknowledge quickly
    } catch (e) {
        console.error("webhook error:", e);
        res.sendStatus(200);
    }
}
