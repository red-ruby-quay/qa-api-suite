import { expect, test } from '@playwright/test';
import { BookingClient } from '../src/api/BookingClient';
import {
  bookingSchema,
  createBookingResponseSchema,
  type Booking
} from '../src/schemas/booking';

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  const suffix = Date.now();

  return {
    firstname: `Rihan-${suffix}`,
    lastname: 'Yosral',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-12-01',
      checkout: '2026-12-05'
    },
    additionalneeds: 'Breakfast',
    ...overrides
  };
}

test.describe('Booking lifecycle', () => {
  test('creates, reads, updates, and deletes a booking', async ({ request }) => {
    const client = new BookingClient(request);
    const payload = makeBooking();

    const created = await client.createBooking(payload);
    expect(() => createBookingResponseSchema.parse(created)).not.toThrow();
    expect(created.booking.firstname).toBe(payload.firstname);

    const getResponse = await client.getBooking(created.bookingid);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(() => bookingSchema.parse(fetched)).not.toThrow();

    const token = await client.createToken();
    const updatedPayload = makeBooking({ firstname: 'Updated', additionalneeds: 'Late checkout' });
    const updateResponse = await client.updateBooking(created.bookingid, updatedPayload, token);
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated.firstname).toBe('Updated');
    expect(updated.additionalneeds).toBe('Late checkout');

    const deleteResponse = await client.deleteBooking(created.bookingid, token);
    expect(deleteResponse.status()).toBe(201);

    const afterDelete = await client.getBooking(created.bookingid);
    expect(afterDelete.status()).toBe(404);
  });

  test('supports partial updates', async ({ request }) => {
    const client = new BookingClient(request);
    const created = await client.createBooking(makeBooking());
    const token = await client.createToken();

    const response = await client.partialUpdateBooking(
      created.bookingid,
      { totalprice: 275 },
      token
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.totalprice).toBe(275);
    expect(body.firstname).toBe(created.booking.firstname);
  });

  test('rejects an update without a token', async ({ request }) => {
    const client = new BookingClient(request);
    const created = await client.createBooking(makeBooking());

    const response = await request.put(`/booking/${created.bookingid}`, {
      data: makeBooking({ firstname: 'NoToken' })
    });

    expect(response.status()).toBe(403);
  });

  test('returns 404 for a booking that does not exist', async ({ request }) => {
    const client = new BookingClient(request);
    const response = await client.getBooking(999_999_999);

    expect(response.status()).toBe(404);
  });

  test('validates the response contract with Zod', async ({ request }) => {
    const client = new BookingClient(request);
    const created = await client.createBooking(makeBooking());

    const parsed = createBookingResponseSchema.safeParse(created);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.booking.totalprice).toBeGreaterThan(0);
      expect(parsed.data.booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
