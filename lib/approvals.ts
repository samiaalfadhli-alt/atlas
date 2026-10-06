import "server-only"

import { getCollections, newId } from "@/lib/db"
import { logAction } from "@/lib/audit"
import type {
  ChangeEntityType,
  ChangeFieldValue,
  ChangeRequest,
  NotificationType,
  SessionUser,
} from "@/lib/types"

/**
 * محرّك الموافقات — القاعدة الأساسية في أطلس المنزل:
 * كل تعديل أو إعلان أو بنر يضيفه المعلن يدخل «قيد المراجعة»
 * ولا يظهر على الموقع إلا بعد اعتماد الإدارة.
 * صاحب الموقع والمديرون يطبّقون التعديلات مباشرة.
 */

export type ChangeEntry = {
  field: string
  fieldLabel: string
  oldValue: ChangeFieldValue
  newValue: ChangeFieldValue
}

export async function createChangeRequest(params: {
  advertiser: SessionUser
  entityType: ChangeEntityType
  entityId: string
  entityName: string
  companyId?: string
  changes: ChangeEntry[]
  payload?: Record<string, unknown>
}): Promise<ChangeRequest> {
  const { changeRequests } = await getCollections()
  const now = new Date().toISOString()
  const req: ChangeRequest = {
    _id: newId(),
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    companyId: params.companyId,
    advertiserId: params.advertiser.id,
    advertiserName: params.advertiser.name,
    changes: params.changes,
    payload: params.payload,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }
  await changeRequests.insertOne(req)
  return req
}

/** يطبّق التعديلات المعتمدة على الكيان المستهدف. */
async function applyChangeRequest(req: ChangeRequest): Promise<void> {
  const cols = await getCollections()
  const now = new Date().toISOString()

  if (req.entityType === "company") {
    const update: Record<string, unknown> = { updatedAt: now }
    for (const c of req.changes) {
      update[c.field] = c.newValue
    }
    await cols.companies.updateOne({ _id: req.entityId }, { $set: update })
    return
  }

  if (req.entityType === "banner") {
    const update: Record<string, unknown> = { updatedAt: now }
    for (const c of req.changes) {
      update[c.field] = c.newValue
    }
    await cols.banners.updateOne({ _id: req.entityId }, { $set: update })
    return
  }

  if (req.entityType === "campaign") {
    const update: Record<string, unknown> = { updatedAt: now }
    for (const c of req.changes) {
      update[c.field] = c.newValue
    }
    await cols.campaigns.updateOne({ _id: req.entityId }, { $set: update })
    return
  }

  if (req.entityType === "article") {
    const update: Record<string, unknown> = { updatedAt: now }
    for (const c of req.changes) {
      update[c.field] = c.newValue
    }
    await cols.articles.updateOne({ _id: req.entityId }, { $set: update })
    return
  }

  if (req.entityType === "company-project") {
    if (req.payload?.action === "delete" && req.payload?.projectId) {
      await cols.companies.updateOne(
        { _id: req.companyId ?? req.entityId },
        {
          $pull: { portfolio: { id: req.payload.projectId } },
          $set: { updatedAt: now },
        },
      )
      return
    }
    // إضافة مشروع جديد إلى معرض أعمال الشركة.
    if (req.payload?.project) {
      const project = req.payload.project as Record<string, unknown>
      await cols.companies.updateOne(
        { _id: req.companyId ?? req.entityId },
        {
          $push: { portfolio: project },
          $set: { updatedAt: now },
        },
      )
    }
    return
  }

  if (req.entityType === "media") {
    const update: Record<string, unknown> = {}
    for (const c of req.changes) {
      update[c.field] = c.newValue
    }
    if (Object.keys(update).length > 0) {
      await cols.media.updateOne({ _id: req.entityId }, { $set: update })
    }
  }
}

export async function approveChangeRequest(
  id: string,
  reviewer: SessionUser,
): Promise<ChangeRequest | null> {
  const { changeRequests } = await getCollections()
  const req = await changeRequests.findOne({ _id: id })
  if (!req || req.status !== "pending") return null

  await applyChangeRequest(req)

  const now = new Date().toISOString()
  await changeRequests.updateOne(
    { _id: id },
    {
      $set: {
        status: "approved",
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  )

  await logAction({
    actor: reviewer,
    action: "approve_change",
    entityType: req.entityType,
    entityId: req.entityId,
    details: `اعتماد تعديل على «${req.entityName}» للمعلن ${req.advertiserName}`,
  })

  await notifyAdvertiser(req, "تم اعتماد تعديلك", "ad-approved")

  return { ...req, status: "approved", reviewerId: reviewer.id, reviewerName: reviewer.name, reviewedAt: now }
}

export async function rejectChangeRequest(
  id: string,
  reviewer: SessionUser,
  reason: string,
): Promise<ChangeRequest | null> {
  const { changeRequests } = await getCollections()
  const req = await changeRequests.findOne({ _id: id })
  if (!req || req.status !== "pending") return null

  const now = new Date().toISOString()
  await changeRequests.updateOne(
    { _id: id },
    {
      $set: {
        status: "rejected",
        rejectionReason: reason,
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  )

  await logAction({
    actor: reviewer,
    action: "reject_change",
    entityType: req.entityType,
    entityId: req.entityId,
    details: `رفض تعديل على «${req.entityName}»: ${reason}`,
  })

  await notifyAdvertiser(req, `تم رفض تعديلك: ${reason}`, "change-rejected")
  return { ...req, status: "rejected", rejectionReason: reason }}

export async function requestChangesOnRequest(
  id: string,
  reviewer: SessionUser,
  reason: string,
): Promise<ChangeRequest | null> {
  const { changeRequests } = await getCollections()
  const req = await changeRequests.findOne({ _id: id })
  if (!req || req.status !== "pending") return null

  const now = new Date().toISOString()
  await changeRequests.updateOne(
    { _id: id },
    {
      $set: {
        status: "changes-requested",
        rejectionReason: reason,
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  )

  await logAction({
    actor: reviewer,
    action: "request_changes",
    entityType: req.entityType,
    entityId: req.entityId,
    details: `طلب تعديل على «${req.entityName}»: ${reason}`,
  })

  await notifyAdvertiser(req, `طلب تعديل: ${reason}`, "change-requested")
  return { ...req, status: "changes-requested", rejectionReason: reason }
}

async function notifyAdvertiser(
  req: ChangeRequest,
  message: string,
  type: NotificationType,
) {
  try {
    const { notifications } = await getCollections()
    await notifications.insertOne({
      _id: newId(),
      userId: req.advertiserId,
      type,
      title: `تحديث على تعديل «${req.entityName}»`,
      message,
      read: false,
      link: "/dashboard/changes",
      createdAt: new Date().toISOString(),
    })
  } catch {
    // الإشعارات لا تُعطّل العملية الأساسية.
  }
}

/** هل يمكن لهذه الجلسة نشر هذا المحتوى مباشرة دون مراجعة؟ */
export function canPublishDirectly(session: SessionUser | null): boolean {
  return !!session && (session.role === "admin" || session.role === "content-manager" || session.role === "ads-manager")
}
