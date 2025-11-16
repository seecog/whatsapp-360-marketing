import { Customer } from "../../models/Customer.js";
import { Template } from "../../models/Template.js";
import { MessageLog } from "../../models/MessageLog.js";
import { sendTemplateMessage } from "../service/whatsapp.service.js";
import { Campaign } from "../../models/Campaign.js";
import { Op } from 'sequelize';

export async function executeCampaignJob(data) {
    const { campaignId } = data;
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign || campaign.status !== "scheduled") return;

    campaign.status = "running"; 
    await campaign.save();

    const tpl = await Template.findByPk(campaign.templateId);
    if (!tpl) { 
        campaign.status = "failed"; 
        await campaign.save(); 
        return; 
    }

    const q = { userId: campaign.userId };
    if (campaign.filters?.tags?.length) {
        q.tags = { [Op.contains]: campaign.filters.tags };
    }

    const customers = await Customer.findAll({ where: q });
    let total = 0, sent = 0, failed = 0;

    for (const cust of customers) {
        total++;
        try {
            const [log, created] = await MessageLog.findOrCreate({
                where: { campaignId, customerId: cust.id },
                defaults: { to: cust.phoneE164, status: "queued" }
            });

            if (!created) {
                await log.update({ status: "queued" });
            }

            const resp = await sendTemplateMessage({
                to: cust.phoneE164,
                templateName: tpl.waName,
                language: tpl.language,
                components: tpl.components || []
            });

            const waMessageId = resp?.messages?.[0]?.id;
            await log.update({ waMessageId, status: "sent" });
            sent++;
        } catch (e) {
            await MessageLog.update(
                { status: "failed", error: e.data || e.message },
                { where: { campaignId, customerId: cust.id } }
            );
            failed++;
        }
        await new Promise(r => setTimeout(r, 150)); // throttle to protect your WABA
    }

    campaign.status = "done";
    campaign.stats = { ...(campaign.stats || {}), total, sent, failed };
    await campaign.save();
}

export async function scheduleCampaign(campaign) {
    const { scheduler } = await import('./agenda.js');
    scheduler.start(); // Start scheduler if not already running
    return scheduler.schedule(new Date(campaign.scheduledAt), 'send-campaign', { campaignId: campaign.id });
}