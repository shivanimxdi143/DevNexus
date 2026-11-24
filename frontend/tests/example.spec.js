
import { test, expect } from '@playwright/test';

test('User should be able to login successfully', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  expect(email).toBeTruthy();
  expect(password).toBeTruthy();

  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/feed/);
});

test('User should not be able to login with incorrect password', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill('WrongPassword123!');

  // Listen for the error alert
  const dialogPromise = page.waitForEvent('dialog');

  await page.getByRole('button', { name: 'Login' }).click();

  const dialog = await dialogPromise;

  expect(dialog.message()).not.toBe('Login successful!');

  await dialog.accept();

  // User should remain on login page
  await expect(page).toHaveURL(/\/login/);
});

test('Unauthenticated user should not access protected routes', async ({ page }) => {
  // Try accessing profile without logging in
  await page.goto('/profile');

  // Should be redirected to login
  await expect(page).toHaveURL(/\/login/);
});

test('Logged-in user should be able to edit profile', async ({ page }) => {
  // Login first
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/feed/);

  // Open profile
  await page.goto('/profile');

  await expect(
    page.getByRole('heading', { name: 'My Profile' })
  ).toBeVisible();

  // Update About section
  const updatedAbout = 'I am testing DevNexus profile editing using Playwright.';

  await page.locator('textarea[name="about"]').fill(updatedAbout);

  // Save profile
  await page.getByRole('button', { name: 'Save Profile' }).click();

  // Verify success notification
  await expect(
    page.getByText('Profile saved successfully!')
  ).toBeVisible();
});


test('User should be able to upload a profile photo', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/feed/);

  // Open profile
  await page.goto('/profile');

  await expect(
    page.getByRole('heading', { name: 'My Profile' })
  ).toBeVisible();

  // Select image
  await page.locator('#profilePhoto').setInputFiles(
    'C:\\Users\\Shivani\\Downloads\\photo_6208221389689393413_y (1).jpg'
  );

  // Upload image
  await page.getByRole('button', { name: 'Upload New Photo' }).click();

  // Verify successful upload
  await expect(
    page.getByText('Profile photo uploaded successfully!')
  ).toBeVisible({ timeout: 15000 });
});


test('Logged-in user should be able to view the feed', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/feed/);

  // Verify feed is loaded
  await expect(page.getByRole('button', { name: 'Ignore' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Interested' })).toBeVisible();
});


test('User should be able to send an interested request', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/feed/);

  // Wait for feed profile
  await expect(page.getByRole('button', { name: 'Interested' })).toBeVisible();

  // Click Interested
  await page.getByRole('button', { name: 'Interested' }).click();

  // Verify next profile appears or feed is exhausted
  await expect(
    page.getByRole('button', { name: 'Interested' })
      .or(page.getByText('No more users!'))
  ).toBeVisible();
});


test('User should be able to ignore a profile', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/feed/);

  // Wait for a profile
  await expect(page.getByRole('button', { name: 'Ignore' })).toBeVisible();

  // Click Ignore
  await page.getByRole('button', { name: 'Ignore' }).click();

  // Verify next profile appears or feed is exhausted
  await expect(
    page.getByRole('button', { name: 'Ignore' })
      .or(page.getByText('No more users!'))
  ).toBeVisible();
});


test('Requests page should load correctly', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/feed/);
  await page.goto('/requests');

  await expect(
    page.getByRole('heading', { name: 'Connection Requests' })
  ).toBeVisible();

  await expect(
    page.getByText('No pending requests')
      .or(page.getByRole('button', { name: 'Accept' }))
  ).toBeVisible();
});


test('User should be able to accept a connection request', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/requests');

  const acceptButton = page.getByRole('button', { name: 'Accept' });

  if (!(await acceptButton.isVisible().catch(() => false))) {
    test.skip(true, 'No incoming request available to accept');
  }

  await acceptButton.first().click();

  await expect(
    page.getByText('Connection request accepted!')
  ).toBeVisible();
});


test('User should be able to reject a connection request', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/requests');

  const rejectButton = page.getByRole('button', { name: 'Reject' });

  if (!(await rejectButton.isVisible().catch(() => false))) {
    test.skip(true, 'No incoming request available to reject');
  }

  await rejectButton.first().click();

  await expect(
    page.getByText('Connection request rejected!')
  ).toBeVisible();
});


test('Connections page should load correctly', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

// Wait until login is completed
await expect(page).toHaveURL(/\/feed/);

// Now open Connections
await page.goto('/connections');

  await expect(
    page.getByRole('heading', { name: 'My Connections' })
  ).toBeVisible();

  await expect(
    page.getByText("You don't have any connections yet.")
      .or(page.getByRole('button', { name: 'Remove Connection' }))
  ).toBeVisible();
});


test('User should be able to remove a connection', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

   await expect(page).toHaveURL(/\/feed/);

   await page.goto('/connections');

// Wait for connections data to finish loading
await expect(
  page.getByRole('heading', { name: 'My Connections' })
).toBeVisible({ timeout: 10000 });

const removeButton = page.getByRole('button', {
  name: 'Remove Connection'
});

  if (!(await removeButton.isVisible().catch(() => false))) {
    test.skip(true, 'No connection available to remove');
  }

  page.once('dialog', dialog => dialog.accept());

  await removeButton.first().click();

  await expect(
    page.getByText('Connection removed successfully.')
  ).toBeVisible();
});


test('User should be able to logout successfully', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(process.env.TEST_EMAIL);
  await page.getByPlaceholder('Enter your password').fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/feed/);

  // Open navbar dropdown
  await page.getByRole('button', { name: 'User Profile' }).click();

  // Logout
  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL(/\/login/);

  // Verify protected route is no longer accessible
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login/);
});
