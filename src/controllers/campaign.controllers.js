// controllers/campaign.controllers.js
import { Campaign } from "../models/Campaign.js";
import { Template } from "../models/Template.js";
import { Business } from "../models/Business.js";
import { Customer } from "../models/Customer.js";
import { MessageLog } from "../models/MessageLog.js";
import { scheduleCampaign } from "../controllers/job/send-campaign.job.js";
import { sendTemplateMessage } from "../controllers/service/whatsapp.service.js";

/**
 * Helper: validate create/update payload supports either:
 *  - local template: { templateId }
 *  - meta template:  { metaTemplate: { name, language, category } }
 */
function extractTemplateChoice(body = {}) {
    const templateId = body.templateId ?? null;
    const metaTemplate = body.metaTemplate ?? null;

    if (!templateId && !metaTemplate) {
        throw new Error("Provide either templateId (local) OR metaTemplate {name, language, category} from Meta.");
    }
    if (metaTemplate) {
        const { name, language, category } = metaTemplate || {};
        if (!name || !language || !category) {
            throw new Error("metaTemplate requires name, language, and category.");
        }
        return { mode: 'meta', name, language, category };
    }
    return { mode: 'local', templateId };
}

export const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, businessId, customerIds, scheduleType, scheduledAt, description } = req.body;

        if (!name || !businessId || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({ ok: false, message: "name, businessId, and customerIds are required" });
        }

        // business must be owned by user
        const business = await Business.findOne({ where: { id: businessId, ownerId: userId } });
        if (!business) {
            return res.status(400).json({ ok: false, message: "Business not found or not owned by user" });
        }

        // template choice
        let tplChoice;
        try { tplChoice = extractTemplateChoice(req.body); }
        catch (err) { return res.status(400).json({ ok: false, message: err.message }); }

        // If local template, verify ownership
        let template = null;
        if (tplChoice.mode === 'local') {
            template = await Template.findOne({ where: { id: tplChoice.templateId, userId } });
            if (!template) {
                return res.status(400).json({ ok: false, message: "Template not found or not owned by user" });
            }
        }

        // Verify all customers belong to the business & user
        const customers = await Customer.findAll({
            where: { id: customerIds, businessId, userId }
        });
        if (customers.length !== customerIds.length) {
            return res.status(400).json({ ok: false, message: "Some customers not found or don't belong to the selected business" });
        }

        // Scheduling
        let finalScheduledAt = null;
        let status = "draft";
        if (scheduleType === "scheduled") {
            if (!scheduledAt) {
                return res.status(400).json({ ok: false, message: "scheduledAt is required for scheduled campaigns" });
            }
            const when = new Date(scheduledAt);
            if (isNaN(when.getTime()) || when < new Date(Date.now() + 30 * 1000)) {
                return res.status(400).json({ ok: false, message: "scheduledAt must be valid and at least 30s in future" });
            }
            finalScheduledAt = when;
            status = "scheduled";
        } else if (scheduleType === "immediate") {
            finalScheduledAt = new Date();
            status = "running";
        }

        // Create campaign
        const newCampaign = await Campaign.create({
            userId,
            name,
            businessId,
            templateId: tplChoice.mode === 'local' ? template.id : null,
            metaTemplateName: tplChoice.mode === 'meta' ? tplChoice.name : null,
            metaTemplateLanguage: tplChoice.mode === 'meta' ? tplChoice.language : null,
            metaTemplateCategory: tplChoice.mode === 'meta' ? tplChoice.category : null,
            customerIds: JSON.stringify(customerIds),
            scheduledAt: finalScheduledAt,
            description: description || null,
            status,
            recipientCount: customerIds.length
        });

        if (status === "scheduled") {
            await scheduleCampaign(newCampaign);
        }

        res.status(201).json(newCampaign);
    } catch (e) {
        console.error('Error creating campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const listCampaigns = async (req, res) => {
    try {
        const docs = await Campaign.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Template, as: 'template', required: false }, // may be null if using Meta
                { model: Business, as: 'business', required: false }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(docs);
    } catch (e) {
        console.error('Error listing campaigns:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findOne({
            where: { id, userId: req.user.id },
            include: [
                { model: Template, as: 'template', required: false },
                { model: Business, as: 'business', required: false }
            ]
        });
        if (!campaign) return res.status(404).json({ ok: false, message: "Campaign not found" });
        res.json(campaign);
    } catch (e) {
        console.error('Error getting campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, businessId, customerIds, scheduleType, scheduledAt, description } = req.body;

        const campaign = await Campaign.findOne({ where: { id, userId } });
        if (!campaign) return res.status(404).json({ ok: false, message: "Campaign not found" });

        if (!name || !businessId || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({ ok: false, message: "name, businessId, and customerIds are required" });
        }

        const business = await Business.findOne({ where: { id: businessId, ownerId: userId } });
        if (!business) return res.status(400).json({ ok: false, message: "Business not found or not owned by user" });

        let tplChoice;
        try { tplChoice = extractTemplateChoice(req.body); }
        catch (err) { return res.status(400).json({ ok: false, message: err.message }); }

        let template = null;
        if (tplChoice.mode === 'local') {
            template = await Template.findOne({ where: { id: tplChoice.templateId, userId } });
            if (!template) return res.status(400).json({ ok: false, message: "Template not found or not owned by user" });
        }

        const foundCustomers = await Customer.findAll({
            where: { id: customerIds, businessId, userId }
        });
        if (foundCustomers.length !== customerIds.length) {
            return res.status(400).json({ ok: false, message: "Some customers not found or don't belong to the selected business" });
        }

        let finalScheduledAt = campaign.scheduledAt;
        let status = campaign.status;

        if (scheduleType === "scheduled") {
            if (!scheduledAt) return res.status(400).json({ ok: false, message: "scheduledAt is required for scheduled campaigns" });
            const when = new Date(scheduledAt);
            if (isNaN(when.getTime()) || when < new Date(Date.now() + 30 * 1000)) {
                return res.status(400).json({ ok: false, message: "scheduledAt must be valid and at least 30s in future" });
            }
            finalScheduledAt = when;
            status = "scheduled";
        } else if (scheduleType === "immediate") {
            finalScheduledAt = new Date();
            status = "running";
        }

        await campaign.update({
            name,
            businessId,
            templateId: tplChoice.mode === 'local' ? template.id : null,
            metaTemplateName: tplChoice.mode === 'meta' ? tplChoice.name : null,
            metaTemplateLanguage: tplChoice.mode === 'meta' ? tplChoice.language : null,
            metaTemplateCategory: tplChoice.mode === 'meta' ? tplChoice.category : null,
            customerIds: JSON.stringify(customerIds),
            scheduledAt: finalScheduledAt,
            description: description || null,
            status,
            recipientCount: customerIds.length
        });

        if (status === "scheduled") {
            await scheduleCampaign(campaign);
        }

        res.json(campaign);
    } catch (e) {
        console.error('Error updating campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const campaign = await Campaign.findOne({ where: { id, userId } });
        if (!campaign) return res.status(404).json({ ok: false, message: "Campaign not found" });

        await campaign.destroy();
        res.json({ ok: true, message: "Campaign deleted successfully" });
    } catch (e) {
        console.error('Error deleting campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

/**
 * Send campaign now (supports local or Meta template).
 */
export const sendCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const campaign = await Campaign.findOne({
            where: { id, userId },
            include: [
                { model: Template, as: 'template', required: false },
                { model: Business, as: 'business', required: false }
            ]
        });
        if (!campaign) return res.status(404).json({ ok: false, message: "Campaign not found" });

        // customers
        const customerIds = JSON.parse(campaign.customerIds || '[]');
        const customers = await Customer.findAll({
            where: { id: customerIds, businessId: campaign.businessId, userId }
        });
        if (customers.length === 0) {
            return res.status(400).json({ ok: false, message: "No customers found for this campaign" });
        }

        // mark running
        await campaign.update({ status: 'running' });

        let total = 0, sent = 0, failed = 0;

        // Figure out which template to use
        const isMeta = !!campaign.metaTemplateName;
        const templateName = isMeta ? campaign.metaTemplateName : campaign.template?.waName;
        const templateLanguage = isMeta ? campaign.metaTemplateLanguage : (campaign.template?.language || 'en_US');
        const components = isMeta ? [] : (campaign.template?.components || []); // if needed, extend to pass params

        for (const customer of customers) {
            total++;
            try {
                const [log, created] = await MessageLog.findOrCreate({
                    where: { campaignId: campaign.id, customerId: customer.id },
                    defaults: { to: customer.phoneE164, status: "queued" }
                });
                if (!created) await log.update({ status: "queued" });

                const response = await sendTemplateMessage({
                    to: customer.phoneE164,
                    templateName,
                    language: templateLanguage,
                    components
                });

                const waMessageId = response?.messages?.[0]?.id;
                await log.update({ waMessageId, status: "sent" });
                sent++;

                await new Promise(r => setTimeout(r, 150)); // rate-limit buffer
            } catch (error) {
                console.error(`Error sending message to ${customer.phoneE164}:`, error);
                await MessageLog.update(
                    { status: "failed", error: error.data || error.message },
                    { where: { campaignId: campaign.id, customerId: customer.id } }
                );
                failed++;
            }
        }

        await campaign.update({
            status: 'completed',
            stats: { total, sent, failed, delivered: 0, read: 0 }
        });

        res.json({ ok: true, message: "Campaign sent successfully", stats: { total, sent, failed } });
    } catch (error) {
        console.error('Error sending campaign:', error);
        res.status(500).json({ ok: false, message: error.message });
    }
};
