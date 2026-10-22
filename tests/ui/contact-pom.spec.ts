import { test, expect } from '@playwright/test';
import { ContactPage } from '../../src/pages/ContactPage';

test('ContactPage creates a contact through reusable page actions', async ({ page }) => {
  await page.setContent(`
    <button>New</button>
    <form id="contact-form" hidden>
      <label for="lastName">Last Name</label>
      <input id="lastName" name="lastName" />
      <button type="submit">Save</button>
    </form>
    <div id="contacts"></div>
    <script>
      document.querySelector('button').addEventListener('click', () => {
        document.querySelector('#contact-form').hidden = false;
      });

      document.querySelector('#contact-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const lastName = document.querySelector('#lastName').value;
        document.querySelector('#contacts').textContent = lastName;
      });
    </script>
  `);

  const contacts = new ContactPage(page);
  await contacts.createContact('QA Automation');
  await expect(page.locator('#contacts')).toHaveText('QA Automation');
});
