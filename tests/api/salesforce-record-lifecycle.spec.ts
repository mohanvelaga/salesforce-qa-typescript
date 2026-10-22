import { test, expect } from '@playwright/test';
import { SalesforceClient } from '../../src/api/SalesforceClient';

test('SalesforceClient supports create, retrieve, update and delete  @api @simulation', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method: string; body?: string }> = [];

  process.env.SF_INSTANCE_URL = 'https://example.my.salesforce.com';
  process.env.SF_API_VERSION = 'v60.0';
  process.env.SF_ACCESS_TOKEN = 'test-token';

  let currentLastName = 'Initial Name';

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const body = typeof init?.body === 'string' ? init.body : undefined;
    calls.push({ url, method, body });

    if (method === 'POST') {
      return new Response(
        JSON.stringify({ id: '003000000000001AAA', success: true, errors: [] }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (method === 'GET') {
      return new Response(
        JSON.stringify({ Id: '003000000000001AAA', LastName: currentLastName }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (method === 'PATCH') {
      currentLastName = JSON.parse(body ?? '{}').LastName;
      return new Response(null, { status: 204 });
    }

    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }

    return new Response('Unexpected method', { status: 405 });
  };

  try {
    const client = new SalesforceClient();
    const recordId = '003000000000001AAA';

    const created = await client.createRecord('Contact', {
      LastName: 'Initial Name',
    });
    expect(created.success).toBe(true);
    expect(created.id).toBe(recordId);

    const retrieved = await client.getRecord('Contact', recordId, ['Id', 'LastName']);
    expect(retrieved.Id).toBe(recordId);
    expect(retrieved.LastName).toBe('Initial Name');

    await client.updateRecord('Contact', recordId, {
      LastName: 'Updated Name',
    });

    const updated = await client.getRecord('Contact', recordId, ['Id', 'LastName']);
    expect(updated.LastName).toBe('Updated Name');

    await client.deleteRecord('Contact', recordId);

    expect(calls.map((call) => call.method)).toEqual([
      'POST', 'GET', 'PATCH', 'GET', 'DELETE',
    ]);
    expect(calls[0].url).toContain('/sobjects/Contact');
    expect(calls[2].body).toBe(JSON.stringify({ LastName: 'Updated Name' }));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
