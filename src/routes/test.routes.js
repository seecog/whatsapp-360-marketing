import express from "express";
import { sendTemplateMessage } from "../controllers/service/whatsapp.service.js";
import { verifyUser } from "../middleware/authMiddleware.js";

export const testRouter = express.Router();

testRouter.post("/test/send", verifyUser, async (req, res) => {
    try {
        const { to, templateName, language, components } = req.body;
        const data = await sendTemplateMessage({ to, templateName, language, components });
        return res.json(data);
    } catch (e) {
        // Map common WhatsApp errors to clear guidance
        const code = e?.data?.error?.code;
        const subcode = e?.data?.error?.error_subcode;
        const msg = e?.data?.error?.message || e.message || "Unknown error";

        // Default response body
        let advice = "Check request payload and WhatsApp Cloud API configuration.";

        // Token/permissions
        if (code === 190) {
            advice = "Your WHATSAPP_TOKEN is invalid or expired. Generate a System User token with whatsapp_business_messaging and whatsapp_business_management, update .env, then restart the server.";
        }
        // Recipient allowlist (dev mode)
        else if (code === 131030) {
            advice = "Recipient not in allowed list. In WhatsApp → API Setup, add this phone to 'Recipient phone numbers' (E.164). Or move WABA to production.";
        }
        // Template issues (common)
        else if (code === 131047 || code === 132000 || code === 100) {
            advice = "Template problem. Ensure template is APPROVED, the 'templateName' matches exactly, the 'language.code' matches the approved language, and the 'components' count/types match the template variables.";
        }
        // Phone/WABA mismatch
        else if (code === 131009) {
            advice = "Phone Number ID does not belong to the WABA for your token/app. Ensure WA_PHONE_NUMBER_ID, WABA_ID, and WHATSAPP_TOKEN are from the same Business/App.";
        }
        // Opt-out / not a WhatsApp user
        else if (code === 131026 || code === 131031) {
            advice = "Recipient may have opted out or is not a WhatsApp user. Test with your own active WhatsApp number and confirm consent.";
        }

        // Return structured error
        return res.status(e.status || 400).json({
            ok: false,
            message: msg,
            code,
            subcode,
            details: e.data?.error?.error_data || null,
            advice
        });
    }
});
