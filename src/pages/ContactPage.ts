import { expect, type Locator, type Page } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.getByRole('button', { name: 'New' });
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.searchInput = page.getByPlaceholder('Search this list...');
  }

  async goto(): Promise<void> {
    await this.page.goto('/lightning/o/Contact/list');
  }

  async createContact(lastName: string): Promise<void> {
    await this.newButton.click();
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
  }

  async expectContactVisible(lastName: string): Promise<void> {
    await expect(this.page.getByText(lastName, { exact: true })).toBeVisible();
  }

  async searchContact(lastName: string): Promise<void> {
    await this.searchInput.fill(lastName);
    await this.searchInput.press('Enter');
  }
}
