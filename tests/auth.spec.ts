import { expect, test } from '@playwright/test';
import { BookingClient } from '../src/api/BookingClient';

test.describe('Authentication', () => {
  test('returns a token for valid credentials', async ({ request }) => {
    const client = new BookingClient(request);
    const token = await client.createToken();

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  test('rejects invalid credentials', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'wrong-password' }
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});
