export type LeadStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'lost'

export type MilestoneStatus =
  | 'planned'
  | 'in_progress'
  | 'at_risk'
  | 'ready_to_invoice'
  | 'done'

export type InvoiceStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'void'
export type PartnerStatus = 'available' | 'busy' | 'reserved' | 'inactive'
export type ProjectStatus = 'active' | 'paused' | 'closed'

export type Lead = {
  id: string
  company: string
  contact_name: string | null
  owner: string | null
  stage: LeadStage
  deal_value: number
  next_step: string | null
  close_date: string | null
  created_at: string
}

export type Project = {
  id: string
  name: string
  client: string | null
  owner: string | null
  budget: number
  status: ProjectStatus
  start_date: string | null
  due_date: string | null
}

export type Milestone = {
  id: string
  project_id: string
  title: string
  status: MilestoneStatus
  progress: number
  due_date: string | null
  projects?: Pick<Project, 'name' | 'client'> | null
}

export type Partner = {
  id: string
  name: string
  role: string | null
  skills: string[]
  daily_rate: number
  availability: PartnerStatus
  email: string | null
}

export type Allocation = {
  id: string
  project_id: string
  partner_id: string
  role: string | null
  allocation_percent: number
  starts_on: string | null
  ends_on: string | null
  projects?: Pick<Project, 'name'> | null
  partners?: Pick<Partner, 'name'> | null
}

export type Invoice = {
  id: string
  invoice_no: string
  project_id: string | null
  client: string
  amount: number
  status: InvoiceStatus
  due_date: string | null
  requested_by: string | null
  approved_at: string | null
  projects?: Pick<Project, 'name'> | null
}

export type AssetItem = {
  id: string
  name: string
  asset_type: string
  category: string | null
  url: string | null
  owner: string | null
}

export type AutomationEvent = {
  id: string
  event_type: string
  description: string
  source_table: string | null
  source_id: string | null
  created_at: string
}

export type DashboardData = {
  leads: Lead[]
  projects: Project[]
  milestones: Milestone[]
  partners: Partner[]
  allocations: Allocation[]
  invoices: Invoice[]
  assets: AssetItem[]
  automationEvents: AutomationEvent[]
}

export const leadStageLabels: Record<LeadStage, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  lost: 'Lost',
}

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  ready_to_invoice: 'Ready to Invoice',
  done: 'Done',
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  void: 'Void',
}

export const partnerStatusLabels: Record<PartnerStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  reserved: 'Reserved',
  inactive: 'Inactive',
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  closed: 'Closed',
}
