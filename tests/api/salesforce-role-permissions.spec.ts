import { test, expect } from '@playwright/test';
import { SalesforceClient } from '../../src/api/SalesforceClient';

test('authorized user can create a Contact; restricted user is denied  @api @roles @simulation', async () => {
  const originalFetch = globalThis.fetch;

  process.env.SF_INSTANCE_URL = 'https://example.my.salesforce.com';
  process.env.SF_API_VERSION = 'v60.0';

  globalThis.fetch = async (_input, init) => {
    const headers = new Headers(init?.headers);
    const token = headers.get('Authorization');

    if (token === 'Bearer authorized-test-token') {
      return new Response(
        JSON.stringify({
          id: '003000000000001AAA',
          success: true,
          errors: [],
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify([
        {
          message: 'Insufficient access rights',
          errorCode: 'INSUFFICIENT_ACCESS_OR_READONLY',
        },
      ]),
      {
        status: 403,
        statusText: 'Forbidden',
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };

  try {
    const client = new SalesforceClient();

    process.env.SF_ACCESS_TOKEN = 'authorized-test-token';

    const result = await client.createRecord('Contact', {
      LastName: 'Permission Test',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('003000000000001AAA');

    process.env.SF_ACCESS_TOKEN = 'restricted-test-token';

    await expect(
      client.createRecord('Contact', {
        LastName: 'Permission Test',
      }),
    ).rejects.toThrow(/403 Forbidden/);

  } finally {
    globalThis.fetch = originalFetch;
  }
});
