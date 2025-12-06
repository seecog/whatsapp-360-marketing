// src/utils/wa.graph.js
import axios from "axios";
import { decrypt } from "./cripto.utils.js";

const G = process.env.META_GRAPH_VERSION;

export function waAxios(token) {
    return axios.create({
        baseURL: `https://graph.facebook.com/${G}`,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
    });
}

// Fetch pretty phone number
export async function getDisplayPhone(phoneNumberId, encToken) {
    const token = decrypt(encToken);
    const api = waAxios(token);
    const { data } = await api.get(`/${phoneNumberId}`, { params: { fields: "display_phone_number" } });
    return data?.display_phone_number || null;
}

// Send a simple template message
export async function sendTemplate({ phoneNumberId, encToken, to, templateName, language, components }) {
    const token = decrypt(encToken);
    const api = waAxios(token);
    return api.post(`/${phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: { code: language },
            components: components || []
        }
    });
}
