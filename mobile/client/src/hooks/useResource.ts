import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from 'expo-router';
import { request } from '../api/client';
import { useWorkspace } from '../state/Workspace';

/** A screen's private data belongs to one session and one foreground visit. */
export function useResource<T>(path: string) {
  const { live, me, getScope } = useWorkspace();
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(!AppState.currentState || AppState.currentState === 'active');
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ owner: string; scope: number; rows: T[] }>();
  const [status, setStatus] = useState<{ owner: string; scope: number; loading: boolean; busy: boolean; error: string }>();
  const controller = useRef<AbortController | null>(null);
  const owner = me?.id ?? '';
  const scope = getScope();
  const available = live && !!owner && focused && foreground;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next !== 'active') controller.current?.abort();
      setForeground(next === 'active');
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => () => { controller.current?.abort(); }, [available, owner, scope, path]);
  useEffect(() => {
    if (!available) { controller.current?.abort(); return; }
    const current = new AbortController(); controller.current = current;
    void (async () => {
      await Promise.resolve();
      if (current.signal.aborted) return undefined;
      setStatus({ owner, scope, loading: true, busy: false, error: '' });
      return request<T[]>(path, 'GET', undefined, current.signal);
    })().then(rows => {
      if (rows && !current.signal.aborted && getScope() === scope) setResult({ owner, scope, rows });
    }).catch(error => {
      if (!current.signal.aborted && getScope() === scope) setStatus({ owner, scope, loading: false, busy: false, error: error.message });
    }).finally(() => {
      if (controller.current === current) controller.current = null;
      if (!current.signal.aborted && getScope() === scope) setStatus(value => value && { ...value, loading: false });
    });
    return () => current.abort();
  }, [available, owner, scope, path, revision, getScope]);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  async function mutate(endpoint: string, method: string, body?: unknown) {
    if (!available || controller.current) return false;
    const current = new AbortController(); controller.current = current;
    setStatus({ owner, scope, loading: false, busy: true, error: '' });
    let saved = false;
    try {
      await request(endpoint, method, body, current.signal); saved = true;
      const rows = await request<T[]>(path, 'GET', undefined, current.signal);
      if (!current.signal.aborted && getScope() === scope) setResult({ owner, scope, rows });
      return !current.signal.aborted && getScope() === scope;
    } catch (error) {
      if (getScope() === scope) setStatus({ owner, scope, loading: false, busy: false, error: current.signal.aborted ? 'The request was interrupted. Refresh to check whether it was saved before trying again.' : saved ? 'Saved, but the list could not refresh. Refresh before making another change.' : error instanceof Error ? error.message : 'Could not save. Refresh before trying again.' });
      return false;
    } finally {
      if (controller.current === current) controller.current = null;
      if (getScope() === scope) setStatus(value => value && { ...value, busy: false });
    }
  }
  const visible = status?.owner === owner && status.scope === scope ? status : undefined;
  return { rows: result?.owner === owner && result.scope === scope && !!owner ? result.rows : [], loading: available && (visible?.loading ?? true), busy: visible?.busy ?? false, error: visible?.error ?? '', reload, mutate, available, owner };
}
