import type { SupabaseClient } from '@supabase/supabase-js'

export async function logAudit(supabase: SupabaseClient, entry: {
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  entityLabel?: string | null
  fieldChanged?: string | null
  oldValue?: any
  newValue?: any
  category: 'learner' | 'finance' | 'staff' | 'settings' | 'comms'
}) {
  try {
    await supabase.from('audit_log').insert({
      user_id: entry.userId ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      entity_label: entry.entityLabel ?? null,
      field_changed: entry.fieldChanged ?? null,
      old_value: entry.oldValue != null ? String(entry.oldValue) : null,
      new_value: entry.newValue != null ? String(entry.newValue) : null,
      category: entry.category,
    })
  } catch { /* audit failures must not break the request */ }
}
