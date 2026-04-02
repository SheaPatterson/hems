/**
 * QueryBuilder — Supabase-compatible fluent query builder for Azure Functions.
 *
 * Translates chained Supabase-style operations (.select(), .insert(), .eq(), etc.)
 * into REST API calls routed through AzureFunctionsClient.invoke().
 *
 * The builder is "thenable" — it implements .then() so that `await` triggers
 * execution automatically, matching Supabase's ergonomics:
 *
 *   const { data, error } = await azureClient.db.from('hospitals').select('*');
 */

import type { AzureFunctionsClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueryResult<T = unknown> {
  data: T | null;
  error: QueryError | null;
}

export interface QueryError {
  message: string;
  code?: string;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

interface FilterParam {
  type: 'eq' | 'in' | 'gt';
  column: string;
  value: unknown;
}

interface OrderParam {
  column: string;
  ascending: boolean;
}

// ---------------------------------------------------------------------------
// QueryBuilder
// ---------------------------------------------------------------------------

export class QueryBuilder<T = unknown> implements PromiseLike<QueryResult<T>> {
  private _table: string;
  private _functionsClient: AzureFunctionsClient;

  // Operation state
  private _method: HttpMethod = 'GET';
  private _columns: string | undefined;
  private _body: unknown | undefined;
  private _filters: FilterParam[] = [];
  private _order: OrderParam | undefined;
  private _limitCount: number | undefined;
  private _single = false;
  private _upsertOptions: { onConflict?: string } | undefined;
  // Whether a .select() was chained after a mutation (insert/update/upsert)
  private _returningSelect = false;

  constructor(table: string, functionsClient: AzureFunctionsClient) {
    this._table = table;
    this._functionsClient = functionsClient;
  }

  // -------------------------------------------------------------------------
  // Query operations
  // -------------------------------------------------------------------------

  select(columns?: string): QueryBuilder<T> {
    // If a mutation was already set, this is a "returning" select
    if (this._method !== 'GET') {
      this._returningSelect = true;
      this._columns = columns;
      return this;
    }
    this._method = 'GET';
    this._columns = columns;
    return this;
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]): QueryBuilder<T> {
    this._method = 'POST';
    this._body = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: Record<string, unknown>): QueryBuilder<T> {
    this._method = 'PATCH';
    this._body = data;
    return this;
  }

  delete(): QueryBuilder<T> {
    this._method = 'DELETE';
    return this;
  }

  upsert(
    data: Record<string, unknown> | Record<string, unknown>[],
    options?: { onConflict?: string },
  ): QueryBuilder<T> {
    this._method = 'PUT';
    this._body = Array.isArray(data) ? data : [data];
    this._upsertOptions = options;
    return this;
  }

  // -------------------------------------------------------------------------
  // Filter operations
  // -------------------------------------------------------------------------

  eq(column: string, value: unknown): QueryBuilder<T> {
    this._filters.push({ type: 'eq', column, value });
    return this;
  }

  in(column: string, values: unknown[]): QueryBuilder<T> {
    this._filters.push({ type: 'in', column, value: values });
    return this;
  }

  gt(column: string, value: unknown): QueryBuilder<T> {
    this._filters.push({ type: 'gt', column, value });
    return this;
  }

  // -------------------------------------------------------------------------
  // Modifiers
  // -------------------------------------------------------------------------

  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T> {
    this._order = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this._limitCount = count;
    return this;
  }

  single(): QueryBuilder<T> {
    this._single = true;
    return this;
  }

  // -------------------------------------------------------------------------
  // Execution
  // -------------------------------------------------------------------------

  /**
   * Build the endpoint path and query string from the accumulated state.
   */
  private _buildEndpoint(): string {
    // Convert table name to kebab-case endpoint (e.g. hems_bases → hems-bases)
    const endpoint = this._table.replace(/_/g, '-');
    const params = new URLSearchParams();

    // Columns
    if (this._columns && this._columns !== '*') {
      params.set('select', this._columns);
    }

    // Filters
    for (const f of this._filters) {
      if (f.type === 'eq') {
        params.set(`${f.column}`, `eq.${f.value}`);
      } else if (f.type === 'in') {
        const vals = Array.isArray(f.value) ? (f.value as unknown[]).join(',') : f.value;
        params.set(`${f.column}`, `in.(${vals})`);
      } else if (f.type === 'gt') {
        params.set(`${f.column}`, `gt.${f.value}`);
      }
    }

    // Order
    if (this._order) {
      params.set('order', `${this._order.column}.${this._order.ascending ? 'asc' : 'desc'}`);
    }

    // Limit
    if (this._limitCount !== undefined) {
      params.set('limit', String(this._limitCount));
    }

    // Upsert conflict key
    if (this._upsertOptions?.onConflict) {
      params.set('on_conflict', this._upsertOptions.onConflict);
    }

    // Prefer single
    if (this._single) {
      params.set('single', 'true');
    }

    // Returning select columns after mutation
    if (this._returningSelect) {
      params.set('returning', this._columns && this._columns !== '*' ? this._columns : 'true');
    }

    const qs = params.toString();
    return qs ? `${endpoint}?${qs}` : endpoint;
  }

  /**
   * Execute the built query against the Azure Functions API.
   */
  async execute(): Promise<QueryResult<T>> {
    try {
      const endpoint = this._buildEndpoint();

      const response = await this._functionsClient.invoke(endpoint, {
        method: this._method,
        body: this._body,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        return {
          data: null,
          error: { message: errorText, code: String(response.status) },
        };
      }

      // DELETE with no returning select has no body
      if (this._method === 'DELETE' && !this._returningSelect) {
        return { data: null, error: null };
      }

      const json = await response.json();

      // If .single() was called, unwrap the first element from the array
      if (this._single) {
        if (Array.isArray(json)) {
          if (json.length === 0) {
            return {
              data: null,
              error: { message: 'No rows found', code: 'PGRST116' },
            };
          }
          return { data: json[0] as T, error: null };
        }
        // Server already returned a single object
        return { data: json as T, error: null };
      }

      return { data: json as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }

  // -------------------------------------------------------------------------
  // Thenable — allows `await queryBuilder.from('x').select('*')`
  // -------------------------------------------------------------------------

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
