import { test, expect } from '@playwright/test';
import { SalesforceLoginPage } from '../../src/pages/SalesforceLoginPage';

test('Salesforce login page object fills credentials and submits the form', async ({ page }) => {
  await page.setContent(`
    <html>
      <body>
        <form id="loginForm">
          <label for="username">Username</label>
          <input id="username" name="username" />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" />
          <button id="Login" type="submit">Log In</button>
        </form>
        <p id="result"></p>
        <script>
          document.querySelector('#loginForm').addEventListener('submit', (event) => {
            event.preventDefault();
            document.querySelector('#result').textContent = 'Form submitted';
          });
        </script>
      </body>
    </html>
  `);

  const loginPage = new SalesforceLoginPage(page);

  await loginPage.expectLoginFormVisible();
  await loginPage.login('qa.user@example.com', 'fake-test-password');

  await expect(page.locator('#username')).toHaveValue('qa.user@example.com');
  await expect(page.locator('#password')).toHaveValue('fake-test-password');
  await expect(page.locator('#result')).toHaveText('Form submitted');
});
