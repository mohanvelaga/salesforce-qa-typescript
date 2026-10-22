import { env, requireSalesforceApiConfig } from '../config/env';

export type SalesforceRecord = {
  Id: string;
  [key: string]: unknown;
};

export class SalesforceClient {
  private get baseUrl(): string {
    requireSalesforceApiConfig();

    const version = env.sfApiVersion;
    if (!/^v\d+\.\d+$/.test(version)) {
      throw new Error(`Invalid SF_API_VERSION: ${version}`);
    }

    return `${env.sfInstanceUrl.replace(/\/+$/, '')}/services/data/${version}`;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.sfAccessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Salesforce API returned ${response.status} ${response.statusText}: ${body}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async createRecord(
    objectName: string,
    fields: Record<string, unknown>,
  ): Promise<{ id: string; success: boolean; errors: string[] }> {
    return this.request(`/sobjects/${encodeURIComponent(objectName)}`, {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  }

  async getRecord<T extends SalesforceRecord>(
    objectName: string,
    recordId: string,
    fields: string[],
  ): Promise<T> {
    const query = new URLSearchParams({ fields: fields.join(',') });
    return this.request(
      `/sobjects/${encodeURIComponent(objectName)}/${encodeURIComponent(recordId)}?${query}`,
    );
  }

  async updateRecord(
    objectName: string,
    recordId: string,
    fields: Record<string, unknown>,
  ): Promise<void> {
    await this.request(
      `/sobjects/${encodeURIComponent(objectName)}/${encodeURIComponent(recordId)}`,
      { method: 'PATCH', body: JSON.stringify(fields) },
    );
  }

  async deleteRecord(
    objectName: string,
    recordId: string,
  ): Promise<void> {
    await this.request(
      `/sobjects/${encodeURIComponent(objectName)}/${encodeURIComponent(recordId)}`,
      { method: 'DELETE' },
    );
  }

  async query<T>(soql: string): Promise<{ records: T[]; totalSize: number; done: boolean }> {
    const params = new URLSearchParams({ q: soql });
    return this.request(`/query?${params}`);
  }
}
