import { MessageLog } from "../models/MessageLog.js";

export const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.sendStatus(403);
};

export const receiveWebhook = async (req, res) => {
    try {
        const entry = req.body?.entry?.[0];
        const value = entry?.changes?.[0]?.value;

        if (Array.isArray(value?.statuses)) {
            for (const s of value.statuses) {
                await MessageLog.update(
                    { status: s.status },
                    { where: { waMessageId: s.id } }
                );
            }
        }
        // TODO: handle inbound messages if you need

        res.sendStatus(200);
    } catch (e) {
        console.error("webhook error:", e);
        res.sendStatus(200);
    }
};