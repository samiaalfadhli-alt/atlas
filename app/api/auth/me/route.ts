import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }

  const { users, companies } = await getCollections()
  const user = await users.findOne({ _id: session.id })
  if (!user) {
    return NextResponse.json({ user: null })
  }

  let companyStatus: string | null = null
  if (user.companyId) {
    const company = await companies.findOne({ _id: user.companyId })
    companyStatus = company?.status ?? null
  }

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyStatus,
    },
  })
}
