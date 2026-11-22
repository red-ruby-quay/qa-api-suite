import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';
import type { Booking } from '../schemas/booking';

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async createToken(username = 'admin', password = 'password123'): Promise<string> {
    const response = await this.request.post('/auth', {
      data: { username, password }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    return body.token as string;
  }

  async createBooking(payload: Booking): Promise<{ bookingid: number; booking: Booking }> {
    const response = await this.request.post('/booking', { data: payload });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async updateBooking(id: number, payload: Booking, token: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: payload,
      headers: { Cookie: `token=${token}` }
    });
  }

  async partialUpdateBooking(
    id: number,
    payload: Partial<Booking>,
    token: string
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: payload,
      headers: { Cookie: `token=${token}` }
    });
  }

  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` }
    });
  }
}
