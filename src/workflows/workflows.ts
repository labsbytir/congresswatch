import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

export interface WorkflowParams {
  limit?: number;
}

export class BillIngestionWorkflow extends WorkflowEntrypoint<any, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    await step.do('sync-congress-api', async () => {
      console.log('Running bill ingestion sync step...');
      return { status: 'success', synced: 10 };
    });

    await step.do('extract-procurement-links', async () => {
      console.log('Scanning for statutory links...');
      return { status: 'success' };
    });
  }
}

export class SocialSyncWorkflow extends WorkflowEntrypoint<any, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    await step.do('sync-rsstown-feed', async () => {
      console.log('Polling rsstown.com for member tweets...');
      return { status: 'success' };
    });
  }
}

