import { test, expect } from '@playwright/test';
import { SalesforceClient } from '../../src/api/SalesforceClient';

test('SalesforceClient reports API errors clearly  @api @roles @simulation', async () => {
  const originalFetch = globalThis.fetch;

  process.env.SF_INSTANCE_URL = 'https://example.my.salesforce.com';
  process.env.SF_API_VERSION = 'v60.0';
  process.env.SF_ACCESS_TOKEN = 'test-token';

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify([
        {
          message: 'Insufficient access rights on object id',
          errorCode: 'INSUFFICIENT_ACCESS_OR_READONLY',
        },
      ]),
      {
        status: 403,
        statusText: 'Forbidden',
        headers: { 'Content-Type': 'application/json' },
      },
    );

  try {
    const client = new SalesforceClient();

    await expect(
      client.createRecord('Contact', { LastName: 'Permission Test' }),
    ).rejects.toThrow(/403 Forbidden/);

    await expect(
      client.createRecord('Contact', { LastName: 'Permission Test' }),
    ).rejects.toThrow(/INSUFFICIENT_ACCESS_OR_READONLY/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
