import { test, expect } from '@playwright/test';
import { SalesforceClient } from '../../src/api/SalesforceClient';

test('SalesforceClient creates a record using the Salesforce REST API  @api @roles @simulation', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedMethod = '';
  let capturedBody = '';

  process.env.SF_INSTANCE_URL = 'https://example.my.salesforce.com';
  process.env.SF_API_VERSION = 'v60.0';
  process.env.SF_ACCESS_TOKEN = 'test-token';

  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedMethod = init?.method ?? 'GET';
    capturedBody = String(init?.body ?? '');

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
  };

  try {
    const client = new SalesforceClient();
    const result = await client.createRecord('Contact', {
      LastName: 'Automation Test',
    });

    expect(capturedUrl).toBe(
      'https://example.my.salesforce.com/services/data/v60.0/sobjects/Contact',
    );
    expect(capturedMethod).toBe('POST');
    expect(JSON.parse(capturedBody)).toEqual({
      LastName: 'Automation Test',
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe('003000000000001AAA');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
