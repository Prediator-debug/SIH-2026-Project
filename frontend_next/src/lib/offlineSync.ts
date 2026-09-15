export interface OfflineInspection {
  client_offline_id: string;
  product_id: string;
  product_name: string;
  offline_captured_at: string;
  officer_remarks: string;
  base64_image?: string | null;
  manual_declarations?: Record<string, any>;
  sync_status: 'PENDING_SYNC' | 'SYNCED' | 'SYNC_FAILED';
  server_inspection_id?: string;
  synced_at?: string;
  compliance_status?: string;
}

const OFFLINE_STORAGE_KEY = 'lmd_offline_inspections_queue';

/**
 * Returns all locally stored offline inspection drafts.
 */
export const getOfflineQueue = (): OfflineInspection[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline queue:', err);
    return [];
  }
};

/**
 * Saves a new field inspection captured while offline.
 */
export const saveOfflineInspection = (draftData: Partial<OfflineInspection>): OfflineInspection => {
  const queue = getOfflineQueue();
  const newRecord: OfflineInspection = {
    client_offline_id: `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    product_id: draftData.product_id || 'p1',
    product_name: draftData.product_name || 'Field Inspected Commodity',
    offline_captured_at: new Date().toISOString(),
    officer_remarks: draftData.officer_remarks || 'Field inspection captured in offline mode',
    base64_image: draftData.base64_image || null,
    manual_declarations: draftData.manual_declarations || {},
    sync_status: 'PENDING_SYNC'
  };

  queue.unshift(newRecord);
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return newRecord;
};

import { fetchBackend } from '@/lib/api-client';

/**
 * Syncs all PENDING_SYNC inspections to backend central server when internet restores.
 */
export const syncOfflineInspections = async () => {
  const queue = getOfflineQueue();
  const pending = queue.filter(item => item.sync_status === 'PENDING_SYNC');

  if (pending.length === 0) {
    return { synced_count: 0, failed_count: 0, message: 'No pending offline inspections to sync.' };
  }

  try {
    const res = await fetchBackend('/api/inspections/batch_sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspections: pending.map(p => ({
          client_offline_id: p.client_offline_id,
          product_id: p.product_id,
          offline_captured_at: p.offline_captured_at,
          officer_remarks: p.officer_remarks,
          base64_image: p.base64_image,
          manual_declarations: p.manual_declarations
        }))
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const result = await res.json();
    const syncedMap: Record<string, any> = {};
    (result.records || []).forEach((r: any) => {
      syncedMap[r.client_offline_id] = r;
    });

    const updatedQueue = queue.map(item => {
      if (syncedMap[item.client_offline_id]) {
        const syncMeta = syncedMap[item.client_offline_id];
        return {
          ...item,
          sync_status: syncMeta.sync_status as 'SYNCED',
          server_inspection_id: syncMeta.server_inspection_id,
          synced_at: syncMeta.synced_at,
          compliance_status: syncMeta.compliance_status
        };
      }
      return item;
    });

    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedQueue));
    return result;
  } catch (err: any) {
    console.error('Batch sync failed:', err);
    throw err;
  }
};
