// Simple in-memory job scheduler
class SimpleScheduler {
    constructor() {
        this.jobs = new Map();
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.processJobs();
    }

    schedule(when, jobName, data) {
        const jobId = Date.now() + Math.random();
        const job = {
            id: jobId,
            name: jobName,
            data,
            scheduledFor: when,
            createdAt: new Date()
        };
        
        this.jobs.set(jobId, job);
        console.log(`Scheduled job ${jobName} for ${when}`);
        return jobId;
    }

    async processJobs() {
        if (!this.isRunning) return;

        const now = new Date();
        const readyJobs = [];

        for (const [jobId, job] of this.jobs) {
            if (job.scheduledFor <= now) {
                readyJobs.push({ jobId, job });
            }
        }

        // Process ready jobs
        for (const { jobId, job } of readyJobs) {
            try {
                await this.executeJob(job);
                this.jobs.delete(jobId);
            } catch (error) {
                console.error(`Job ${job.name} failed:`, error);
                // Keep failed jobs for retry or manual cleanup
            }
        }

        // Schedule next check in 10 seconds
        setTimeout(() => this.processJobs(), 10000);
    }

    async executeJob(job) {
        // Import job handlers dynamically to avoid circular dependencies
        if (job.name === 'send-campaign') {
            const { executeCampaignJob } = await import('./send-campaign.job.js');
            await executeCampaignJob(job.data);
        }
    }

    stop() {
        this.isRunning = false;
    }

    getJobCount() {
        return this.jobs.size;
    }
}

export const scheduler = new SimpleScheduler();