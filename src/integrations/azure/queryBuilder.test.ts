import { describe, it, expect, vi } from 'vitest';
import { QueryBuilder } from './queryBuilder';
import type { AzureFunctionsClient } from './client';

// ---------------------------------------------------------------------------
// Helper: create a mock AzureFunctionsClient
// ---------------------------------------------------------------------------

function mockFunctionsClient(
  responseBody: unknown = [],
  status = 200,
): { client: AzureFunctionsClient; calls: { name: string; options: { method: string; body?: unknown } }[] } {
  const calls: { name: string; options: { method: string; body?: unknown } }[] = [];

  const client: AzureFunctionsClient = {
    async invoke(functionName, options) {
      calls.push({ name: functionName, options });
      return new Response(JSON.stringify(responseBody), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };

  return { client, calls };
}

function mockErrorClient(status: number, body: string) {
  return mockFunctionsClient(undefined, status).client;
}

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------

describe('QueryBuilder', () => {
  describe('select', () => {
    it('sends GET to the table endpoint', async () => {
      const { client, calls } = mockFunctionsClient([{ id: '1', name: 'Hospital A' }]);
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*');

      expect(error).toBeNull();
      expect(data).toEqual([{ id: '1', name: 'Hospital A' }]);
      expect(calls).toHaveLength(1);
      expect(calls[0].name).toBe('hospitals');
      expect(calls[0].options.method).toBe('GET');
    });

    it('passes specific columns as select query param', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      await qb.select('id, name');

      expect(calls[0].name).toContain('select=');
      expect(calls[0].name).toContain('id');
    });

    it('does not add select param for wildcard *', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      await qb.select('*');

      expect(calls[0].name).toBe('hospitals');
    });
  });

  describe('table name conversion', () => {
    it('converts underscores to hyphens in endpoint', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hems_bases', client);

      await qb.select('*');

      expect(calls[0].name).toBe('hems-bases');
    });

    it('handles tables with multiple underscores', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('mission_radio_logs', client);

      await qb.select('*');

      expect(calls[0].name).toBe('mission-radio-logs');
    });
  });

  describe('insert', () => {
    it('sends POST with body wrapped in array', async () => {
      const { client, calls } = mockFunctionsClient({ id: '1', name: 'New' });
      const qb = new QueryBuilder('hospitals', client);

      await qb.insert({ name: 'New' });

      expect(calls[0].options.method).toBe('POST');
      expect(calls[0].options.body).toEqual([{ name: 'New' }]);
    });

    it('keeps array body as-is', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      await qb.insert([{ name: 'A' }, { name: 'B' }]);

      expect(calls[0].options.body).toEqual([{ name: 'A' }, { name: 'B' }]);
    });
  });

  describe('update', () => {
    it('sends PATCH with body and filters', async () => {
      const { client, calls } = mockFunctionsClient({ id: '1', active: false });
      const qb = new QueryBuilder('notams', client);

      await qb.update({ active: false }).eq('id', '123');

      expect(calls[0].options.method).toBe('PATCH');
      expect(calls[0].options.body).toEqual({ active: false });
      expect(calls[0].name).toContain('id=eq.123');
    });
  });

  describe('delete', () => {
    it('sends DELETE with filters', async () => {
      const { client, calls } = mockFunctionsClient(null);
      const qb = new QueryBuilder('downloads', client);

      const { data, error } = await qb.delete().eq('id', 'abc');

      expect(calls[0].options.method).toBe('DELETE');
      expect(calls[0].name).toContain('id=eq.abc');
      expect(error).toBeNull();
    });
  });

  describe('upsert', () => {
    it('sends PUT with onConflict param', async () => {
      const { client, calls } = mockFunctionsClient({ key: 'k', value: 'v' });
      const qb = new QueryBuilder('config', client);

      await qb.upsert({ key: 'k', value: 'v' }, { onConflict: 'key' });

      expect(calls[0].options.method).toBe('PUT');
      expect(calls[0].name).toContain('on_conflict=key');
      expect(calls[0].options.body).toEqual([{ key: 'k', value: 'v' }]);
    });
  });

  describe('filters', () => {
    it('eq adds filter param', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('missions', client);

      await qb.select('*').eq('status', 'active');

      expect(calls[0].name).toContain('status=eq.active');
    });

    it('in adds filter param with parenthesized values', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('missions', client);

      await qb.select('*').in('mission_id', ['m1', 'm2']);

      expect(calls[0].name).toContain('mission_id=in.%28m1%2Cm2%29');
    });

    it('gt adds filter param', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('live_pilot_status', client);

      await qb.select('*').gt('last_seen', '2024-01-01');

      expect(calls[0].name).toContain('last_seen=gt.2024-01-01');
    });

    it('supports multiple filters', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('missions', client);

      await qb.select('*').eq('status', 'active').eq('user_id', 'u1');

      expect(calls[0].name).toContain('status=eq.active');
      expect(calls[0].name).toContain('user_id=eq.u1');
    });
  });

  describe('order', () => {
    it('adds ascending order param', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      await qb.select('*').order('name', { ascending: true });

      expect(calls[0].name).toContain('order=name.asc');
    });

    it('adds descending order param', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('missions', client);

      await qb.select('*').order('created_at', { ascending: false });

      expect(calls[0].name).toContain('order=created_at.desc');
    });

    it('defaults to ascending when no option given', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      await qb.select('*').order('name');

      expect(calls[0].name).toContain('order=name.asc');
    });
  });

  describe('limit', () => {
    it('adds limit param', async () => {
      const { client, calls } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      await qb.select('*').limit(10);

      expect(calls[0].name).toContain('limit=10');
    });
  });

  describe('single', () => {
    it('unwraps first element from array response', async () => {
      const { client } = mockFunctionsClient([{ id: '1', name: 'Hospital A' }]);
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*').eq('id', '1').single();

      expect(error).toBeNull();
      expect(data).toEqual({ id: '1', name: 'Hospital A' });
    });

    it('returns PGRST116 error for empty array', async () => {
      const { client } = mockFunctionsClient([]);
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*').eq('id', 'nonexistent').single();

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('PGRST116');
    });

    it('passes through single object response', async () => {
      const { client } = mockFunctionsClient({ id: '1', name: 'Hospital A' });
      const qb = new QueryBuilder('hospitals', client);

      const { data } = await qb.select('*').eq('id', '1').single();

      expect(data).toEqual({ id: '1', name: 'Hospital A' });
    });
  });

  describe('chained mutation + select + single', () => {
    it('insert().select().single() sends POST with returning and single params', async () => {
      const { client, calls } = mockFunctionsClient([{ id: '1', name: 'New Hospital' }]);
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.insert({ name: 'New Hospital' }).select().single();

      expect(error).toBeNull();
      expect(data).toEqual({ id: '1', name: 'New Hospital' });
      expect(calls[0].options.method).toBe('POST');
      expect(calls[0].name).toContain('returning=true');
      expect(calls[0].name).toContain('single=true');
    });

    it('update().select().single() sends PATCH with returning and single params', async () => {
      const { client, calls } = mockFunctionsClient([{ id: '1', name: 'Updated' }]);
      const qb = new QueryBuilder('hospitals', client);

      const { data } = await qb.update({ name: 'Updated' }).eq('id', '1').select().single();

      expect(data).toEqual({ id: '1', name: 'Updated' });
      expect(calls[0].options.method).toBe('PATCH');
    });
  });

  describe('thenable (await support)', () => {
    it('executes when awaited directly', async () => {
      const { client, calls } = mockFunctionsClient([{ id: '1' }]);
      const qb = new QueryBuilder('hospitals', client);

      const result = await qb.select('*');

      expect(result.data).toEqual([{ id: '1' }]);
      expect(result.error).toBeNull();
      expect(calls).toHaveLength(1);
    });

    it('works with destructuring pattern', async () => {
      const { client } = mockFunctionsClient([{ id: '1', name: 'Test' }]);
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*').order('name', { ascending: true });

      expect(error).toBeNull();
      expect(data).toEqual([{ id: '1', name: 'Test' }]);
    });
  });

  describe('error handling', () => {
    it('returns error for non-ok response', async () => {
      const { client } = mockFunctionsClient(undefined, 500);
      // Override to return error text
      client.invoke = async () => new Response('Internal Server Error', { status: 500 });
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('500');
    });

    it('returns error when fetch throws', async () => {
      const client: AzureFunctionsClient = {
        async invoke() {
          throw new Error('Network failure');
        },
      };
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toBe('Network failure');
    });
  });

  describe('full Supabase-style chains', () => {
    it('mirrors: supabase.from("hospitals").select("*").order("name", { ascending: true })', async () => {
      const hospitals = [{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }];
      const { client, calls } = mockFunctionsClient(hospitals);
      const qb = new QueryBuilder('hospitals', client);

      const { data, error } = await qb.select('*').order('name', { ascending: true });

      expect(error).toBeNull();
      expect(data).toEqual(hospitals);
      expect(calls[0].options.method).toBe('GET');
      expect(calls[0].name).toContain('order=name.asc');
    });

    it('mirrors: supabase.from("config").upsert(data, { onConflict: "key" }).select().single()', async () => {
      const { client, calls } = mockFunctionsClient([{ key: 'theme', value: 'dark' }]);
      const qb = new QueryBuilder('config', client);

      const { data, error } = await qb
        .upsert({ key: 'theme', value: 'dark' }, { onConflict: 'key' })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual({ key: 'theme', value: 'dark' });
      expect(calls[0].options.method).toBe('PUT');
      expect(calls[0].name).toContain('on_conflict=key');
    });

    it('mirrors: supabase.from("missions").select("*").eq("status", "active").order("created_at", { ascending: false })', async () => {
      const missions = [{ id: '1', status: 'active' }];
      const { client, calls } = mockFunctionsClient(missions);
      const qb = new QueryBuilder('missions', client);

      const { data } = await qb.select('*').eq('status', 'active').order('created_at', { ascending: false });

      expect(data).toEqual(missions);
      expect(calls[0].name).toContain('status=eq.active');
      expect(calls[0].name).toContain('order=created_at.desc');
    });
  });
});
