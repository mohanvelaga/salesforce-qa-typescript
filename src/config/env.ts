import 'dotenv/config';

export const env = {
  get sfUiUrl(): string {
    return process.env.SF_UI_URL ?? '';
  },

  get sfInstanceUrl(): string {
    return process.env.SF_INSTANCE_URL ?? '';
  },

  get sfApiVersion(): string {
    return process.env.SF_API_VERSION ?? 'v60.0';
  },

  get sfAccessToken(): string {
    return process.env.SF_ACCESS_TOKEN ?? '';
  },

  get runSalesforceTests(): boolean {
    return process.env.RUN_SALESFORCE_TESTS === 'true';
  },
};

export function requireSalesforceApiConfig(): void {
  const missing: string[] = [];

  if (!env.sfInstanceUrl) missing.push('SF_INSTANCE_URL');
  if (!env.sfAccessToken) missing.push('SF_ACCESS_TOKEN');

  if (missing.length) {
    throw new Error(
      `Missing Salesforce API configuration: ${missing.join(', ')}. Check your .env file.`,
    );
  }
}
