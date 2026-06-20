import { supabase } from './supabaseClient'
import type {
  Allocation,
  AssetItem,
  AutomationEvent,
  DashboardData,
  Invoice,
  Lead,
  Milestone,
  Partner,
  Project,
} from './types'

type InsertPayload = Record<string, string | number | string[] | null>

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }
  return supabase
}

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function loadDashboardData(): Promise<DashboardData> {
  const client = requireClient()
  const rowLimit = 100

  const [
    leads,
    projects,
    milestones,
    partners,
    allocations,
    invoices,
    assets,
    automationEvents,
  ] = await Promise.all([
    client.from('leads').select('*').order('created_at', { ascending: false }).limit(rowLimit),
    client.from('projects').select('*').order('created_at', { ascending: false }).limit(rowLimit),
    client
      .from('milestones')
      .select('*, projects(name, client)')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(rowLimit),
    client.from('partners').select('*').order('name', { ascending: true }).limit(rowLimit),
    client
      .from('allocations')
      .select('*, projects(name), partners(name)')
      .order('created_at', { ascending: false })
      .limit(rowLimit),
    client
      .from('invoices')
      .select('*, projects(name)')
      .order('created_at', { ascending: false })
      .limit(rowLimit),
    client.from('assets').select('*').order('created_at', { ascending: false }).limit(rowLimit),
    client
      .from('automation_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  ;[leads, projects, milestones, partners, allocations, invoices, assets, automationEvents].forEach(
    (result) => assertNoError(result.error),
  )

  return {
    leads: (leads.data ?? []) as Lead[],
    projects: (projects.data ?? []) as Project[],
    milestones: (milestones.data ?? []) as Milestone[],
    partners: (partners.data ?? []) as Partner[],
    allocations: (allocations.data ?? []) as Allocation[],
    invoices: (invoices.data ?? []) as Invoice[],
    assets: (assets.data ?? []) as AssetItem[],
    automationEvents: (automationEvents.data ?? []) as AutomationEvent[],
  }
}

export async function insertRow(table: string, payload: InsertPayload) {
  const client = requireClient()
  const {
    data: { user },
  } = await client.auth.getUser()
  const { error } = await client.from(table).insert({
    ...payload,
    created_by: user?.id ?? null,
  })
  assertNoError(error)
}

export async function updateRow(table: string, id: string, payload: InsertPayload) {
  const client = requireClient()
  const { error } = await client.from(table).update(payload).eq('id', id)
  assertNoError(error)
}

export async function deleteRow(table: string, id: string) {
  const client = requireClient()
  const { error } = await client.from(table).delete().eq('id', id)
  assertNoError(error)
}

export async function recordAutomationEvent(
  eventType: string,
  description: string,
  sourceTable?: string,
  sourceId?: string,
) {
  const client = requireClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  const { error } = await client.from('automation_events').insert({
    event_type: eventType,
    description,
    source_table: sourceTable ?? null,
    source_id: sourceId ?? null,
    created_by: user?.id ?? null,
  })
  assertNoError(error)
}
