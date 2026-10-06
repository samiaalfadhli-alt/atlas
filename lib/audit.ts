import "server-only"

import { getCollections, newId } from "@/lib/db"
import type { AuditLog, SessionUser } from "@/lib/types"

/**
 * يسجّل عملية في سجل التدقيق — يُستدعى عند كل تعديل أو اعتماد أو رفض.
 * لا يطرح خطأً عند الفشل حتى لا يُعطّل العملية الأساسية.
 */
export async function logAction(params: {
  actor: SessionUser
  action: string
  entityType: string
  entityId?: string
  details?: string
}): Promise<void> {
  try {
    const { auditLogs } = await getCollections()
    const now = new Date().toISOString()
    const entry: AuditLog = {
      _id: newId(),
      actorId: params.actor.id,
      actorName: params.actor.name,
      actorRole: params.actor.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      createdAt: now,
    }
    await auditLogs.insertOne(entry)
  } catch {
    // سجل التدقيق لا يجب أن يُعطّل العملية الأساسية.
  }
}
