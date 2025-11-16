import axios from "axios";
const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}`;

export const isE164 = p => typeof p === "string" && /^\+\d{8,15}$/.test(p);

export async function sendTemplateMessage({ to, templateName, language, components = [] }) {
    if (!isE164(to)) { const e = new Error("Recipient must be E.164 (e.g., +91XXXXXXXXXX)"); e.status = 400; throw e; }

    const url = `${GRAPH}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    console.log("Inside sendTemplateMessage url : ", url);
    console.log("Inside sendTemplateMessage to : ", to);
    console.log("Inside sendTemplateMessage templateName : ", templateName);
    console.log("Inside sendTemplateMessage language : ", language);
    console.log("Inside sendTemplateMessage components : ", components);
    console.log("Inside sendTemplateMessage headers : ", { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` });
    console.log("Inside sendTemplateMessage headers : ", { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` });
    try {
        const { data } = await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: language },
                    ...(components.length ? { components } : {})
                }
            },
            { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
        );
        console.log("Send successfully!")
        return data; // { messages: [ { id } ] }
    } catch (e) {
        const err = new Error("Meta API error");
        err.status = e.response?.status || 500;
        err.data = e.response?.data;
        console.error("[WA SEND ERROR]", e.response?.data || e.message);
        throw err;
    }
}
