// src/controllers/wa.controller.js
import axios from "axios";
import { WhatsAppConnection } from "../../models/WhatsAppConnection.js";
import { Business } from "../../models/Business.js";
import { encrypt } from "../../utils/cripto.utils.js";
import { getDisplayPhone } from "../../utils/wa.graph.js";

// ─────────────────────────────────────────────
// A) Embedded Signup (recommended)

// 1) Provide config for your frontend to render the Meta widget
export async function getEmbeddedSignupConfig(req, res) {
    // requireAuth + shop_owner/ admin guard should protect this route
    return res.json({
        ok: true,
        data: {
            appId: process.env.META_APP_ID,
            graphVersion: process.env.META_GRAPH_VERSION,
            redirectUri: `${process.env.APP_URL}/wa/connect/callback/client`
        }
    });
}

// 2) Exchange "code" -> access_token and save the connection
export async function embeddedSignupCallback(req, res) {
    try {
        const { businessId, code, wabaId, phoneNumberId } = req.body || {};
        if (!businessId || !code || !wabaId || !phoneNumberId) {
            return res.status(400).json({ ok: false, error: "businessId, code, wabaId, phoneNumberId required" });
        }

        // Optional: ensure caller owns this business
        const biz = await Business.findById(businessId);
        if (!biz) return res.status(404).json({ ok: false, error: "Business not found" });

        // OAuth code exchange
        const url = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}/oauth/access_token`;
        const { data } = await axios.get(url, {
            params: {
                client_id: process.env.META_APP_ID,
                client_secret: process.env.META_APP_SECRET,
                code
                // NOTE: if you used redirect_uri on the client to start signup, include the SAME redirect_uri here as well.
                // redirect_uri: `${process.env.APP_URL}/wa/connect/callback/client`
            }
        });

        const accessToken = data?.access_token;
        if (!accessToken) return res.status(400).json({ ok: false, error: "Token exchange failed" });

        // Optional: get display phone
        let phoneNumber = null;
        try { phoneNumber = await getDisplayPhone(phoneNumberId, encrypt(accessToken)); } catch { }

        const doc = await WhatsAppConnection.findOneAndUpdate(
            { businessId },
            {
                wabaId,
                phoneNumberId,
                phoneNumber,
                longLivedTokenEnc: encrypt(accessToken),
                webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
                status: "connected"
            },
            { upsert: true, new: true }
        );

        return res.json({ ok: true, data: { connectionId: doc._id, wabaId, phoneNumberId, phoneNumber } });
    } catch (e) {
        console.error("embeddedSignupCallback:", e?.response?.data || e);
        return res.status(500).json({ ok: false, error: "Server error" });
    }
}

// ─────────────────────────────────────────────
// B) Manual connect (dev-friendly)
// Use this if you already have a token, wabaId, phoneNumberId from Meta test setup.

export async function manualConnect(req, res) {
    try {
        const { businessId, wabaId, phoneNumberId, accessToken } = req.body || {};
        if (!businessId || !wabaId || !phoneNumberId || !accessToken) {
            return res.status(400).json({ ok: false, error: "businessId, wabaId, phoneNumberId, accessToken required" });
        }

        const biz = await Business.findById(businessId);
        if (!biz) return res.status(404).json({ ok: false, error: "Business not found" });

        let phoneNumber = null;
        try { phoneNumber = await getDisplayPhone(phoneNumberId, encrypt(accessToken)); } catch { }

        const doc = await WhatsAppConnection.findOneAndUpdate(
            { businessId },
            {
                wabaId,
                phoneNumberId,
                phoneNumber,
                longLivedTokenEnc: encrypt(accessToken),
                webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
                status: "connected"
            },
            { upsert: true, new: true }
        );

        return res.status(201).json({ ok: true, data: { connectionId: doc._id, phoneNumber } });
    } catch (e) {
        console.error("manualConnect:", e?.response?.data || e);
        return res.status(500).json({ ok: false, error: "Server error" });
    }
}

// ─────────────────────────────────────────────
// Small helpers for your UI/testing

export async function getConnection(req, res) {
    const { businessId } = req.query;
    const doc = await WhatsAppConnection.findOne({ businessId });
    if (!doc) return res.status(404).json({ ok: false, error: "Not connected" });
    // Never return decrypted token
    return res.json({
        ok: true,
        data: {
            businessId: doc.businessId,
            wabaId: doc.wabaId,
            phoneNumberId: doc.phoneNumberId,
            phoneNumber: doc.phoneNumber,
            status: doc.status,
            updatedAt: doc.updatedAt
        }
    });
}

export async function sendTestTemplateMessage(req, res) {
    try {
        const { businessId, to, templateName, language } = req.body || {};
        if (!businessId || !to || !templateName || !language) {
            return res.status(400).json({ ok: false, error: "businessId, to, templateName, language required" });
        }
        const conn = await WhatsAppConnection.findOne({ businessId });
        if (!conn) return res.status(404).json({ ok: false, error: "WhatsApp not connected for this business" });

        const response = await sendTemplate({
            phoneNumberId: conn.phoneNumberId,
            encToken: conn.longLivedTokenEnc,
            to,
            templateName,
            language,
            // components: [] // add header/body/button parts if your template needs variables
        });

        return res.json({ ok: true, data: { messageId: response.data?.messages?.[0]?.id || null } });
    } catch (e) {
        console.error("sendTestTemplateMessage:", e?.response?.data || e);
        return res.status(500).json({ ok: false, error: "Send failed" });
    }
}
