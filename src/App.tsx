import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  FileStack,
  Handshake,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  UsersRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import './App.css'
import {
  deleteRow,
  insertRow,
  loadDashboardData,
  recordAutomationEvent,
  updateRow,
} from './dataApi'
import { getActiveSession, isSupabaseConfigured, supabase } from './supabaseClient'
import type {
  AssetItem,
  DashboardData,
  Invoice,
  Lead,
  LeadStage,
  Milestone,
  MilestoneStatus,
  Partner,
  Project,
  ProjectStatus,
} from './types'
import {
  invoiceStatusLabels,
  leadStageLabels,
  milestoneStatusLabels,
  partnerStatusLabels,
  projectStatusLabels,
} from './types'

type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  panelId: string
  description: string
}

type Notice = {
  tone: 'ok' | 'error' | 'info'
  message: string
}

const emptyData: DashboardData = {
  leads: [],
  projects: [],
  milestones: [],
  partners: [],
  allocations: [],
  invoices: [],
  assets: [],
  automationEvents: [],
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    panelId: 'overview',
    description: 'Live operating dashboard from Supabase.',
  },
  {
    id: 'crm',
    label: 'CRM & Sales',
    icon: Handshake,
    panelId: 'crm',
    description: 'Create leads and move pipeline stages.',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: BriefcaseBusiness,
    panelId: 'projects',
    description: 'Projects, milestones, and delivery status.',
  },
  {
    id: 'partners',
    label: 'Partners',
    icon: UsersRound,
    panelId: 'partners',
    description: 'Freelance roster and resource allocation.',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: ReceiptText,
    panelId: 'finance',
    description: 'Invoices, approvals, and payment status.',
  },
  {
    id: 'documents',
    label: 'Assets',
    icon: FileStack,
    panelId: 'documents',
    description: 'SOPs, code, prompts, blueprints, and templates.',
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Workflow,
    panelId: 'automation',
    description: 'Recorded events for n8n or Make integration.',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    panelId: 'settings',
    description: 'Database and deployment setup.',
  },
]

const bahtFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
})

const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [session, setSession] = useState<Session | null>(null)
  const [data, setData] = useState<DashboardData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>({
    tone: 'info',
    message: 'Connect Supabase to start with a real empty ERP database.',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const sessionRef = useRef<Session | null>(null)
  const loadInFlightRef = useRef<Promise<void> | null>(null)
  const loadTokenRef = useRef<symbol | null>(null)

  const activeNav = navItems.find((item) => item.id === activeView) ?? navItems[0]

  const refreshData = useCallback(async (
    activeSession: Session | null = sessionRef.current,
    options: { force?: boolean } = {},
  ) => {
    if (!activeSession || !supabase) {
      setData(emptyData)
      setLoading(false)
      loadInFlightRef.current = null
      loadTokenRef.current = null
      return
    }

    if (loadInFlightRef.current && !options.force) {
      return loadInFlightRef.current
    }

    setLoading(true)
    const loadToken = Symbol('dashboard-load')
    loadTokenRef.current = loadToken
    const loadPromise = loadDashboardData()
      .then((nextData) => {
        setData(nextData)
        setNotice({ tone: 'ok', message: 'Live data synced from Supabase.' })
      })
      .catch((error) => {
        setNotice({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to load live data.',
        })
      })
      .finally(() => {
        if (loadTokenRef.current === loadToken) {
          loadInFlightRef.current = null
          setLoading(false)
        }
      })

    loadInFlightRef.current = loadPromise
    return loadPromise
  }, [])

  useEffect(() => {
    let mounted = true

    async function boot() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false)
        return
      }

      const activeSession = await getActiveSession()
      if (!mounted) return
      sessionRef.current = activeSession
      setSession(activeSession)
      if (activeSession) void refreshData(activeSession)
      else setLoading(false)
    }

    void boot()

    if (!supabase) return undefined
    const { data: subscription } = supabase.auth.onAuthStateChange((event, activeSession) => {
      sessionRef.current = activeSession
      setSession(activeSession)
      if (event === 'SIGNED_IN') void refreshData(activeSession)
      if (event === 'SIGNED_OUT') {
        setData(emptyData)
        loadInFlightRef.current = null
        loadTokenRef.current = null
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [refreshData])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return data

    return {
      ...data,
      leads: data.leads.filter((lead) =>
        [lead.company, lead.contact_name, lead.owner, lead.next_step].join(' ').toLowerCase().includes(term),
      ),
      projects: data.projects.filter((project) =>
        [project.name, project.client, project.owner, project.status].join(' ').toLowerCase().includes(term),
      ),
      milestones: data.milestones.filter((milestone) =>
        [milestone.title, milestone.status, milestone.projects?.name].join(' ').toLowerCase().includes(term),
      ),
      partners: data.partners.filter((partner) =>
        [partner.name, partner.role, partner.email, partner.skills.join(' ')].join(' ').toLowerCase().includes(term),
      ),
      allocations: data.allocations.filter((allocation) =>
        [allocation.projects?.name, allocation.partners?.name, allocation.role]
          .join(' ')
          .toLowerCase()
          .includes(term),
      ),
      invoices: data.invoices.filter((invoice) =>
        [invoice.invoice_no, invoice.client, invoice.status, invoice.requested_by, invoice.projects?.name]
          .join(' ')
          .toLowerCase()
          .includes(term),
      ),
      assets: data.assets.filter((asset) =>
        [asset.name, asset.asset_type, asset.category, asset.owner].join(' ').toLowerCase().includes(term),
      ),
      automationEvents: data.automationEvents.filter((event) =>
        [event.event_type, event.description, event.source_table].join(' ').toLowerCase().includes(term),
      ),
    }
  }, [data, searchTerm])

  const summary = useMemo(() => {
    const pipelineValue = data.leads.reduce((total, lead) => total + Number(lead.deal_value), 0)
    const pendingApprovals = data.invoices.filter((invoice) => invoice.status === 'pending').length
    const readyMilestones = data.milestones.filter((milestone) => milestone.status === 'ready_to_invoice').length

    return {
      pipelineValue,
      activeProjects: data.projects.length,
      availablePartners: data.partners.filter((partner) => partner.availability === 'available').length,
      pendingApprovals,
      readyMilestones,
      assets: data.assets.length,
    }
  }, [data])

  function activateNav(item: NavItem) {
    setActiveView(item.id)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  async function runMutation(action: () => Promise<void>, successMessage: string) {
    setSaving(true)
    try {
      await action()
      await refreshData(sessionRef.current, { force: true })
      setNotice({ tone: 'ok', message: successMessage })
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Save failed.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setData(emptyData)
    loadInFlightRef.current = null
    loadTokenRef.current = null
    setNotice({ tone: 'info', message: 'Signed out.' })
  }

  if (!isSupabaseConfigured || !supabase) {
    return <SetupScreen />
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card" aria-label="InNextGen Lean ERP">
          <img src="/brand/innextgen-logo-cropped.png" alt="InNextGen logo" />
          <div>
            <strong>Lean ERP</strong>
            <span>Live Workspace</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="ERP navigation">
          <div className="nav-group">
            <p>Live Modules</p>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeView
              return (
                <button
                  className={isActive ? 'nav-item nav-item--active' : 'nav-item'}
                  key={item.id}
                  type="button"
                  onClick={() => activateNav(item)}
                  title={item.description}
                >
                  <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="organization-switcher">
          <Building2 size={22} aria-hidden="true" />
          <div>
            <span>Signed in</span>
            <strong>{session.user.email}</strong>
          </div>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
        <footer className="version-note">Supabase backed</footer>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{activeNav.label}</h1>
            <p>{activeNav.description}</p>
          </div>

          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search live leads, projects, invoices, assets..."
              type="search"
            />
          </label>

          <div className="topbar-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={() => void refreshData(sessionRef.current, { force: true })}
              disabled={loading}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </button>
            <button className="icon-button" type="button" title="Pending approvals">
              <Bell size={18} aria-hidden="true" />
              {summary.pendingApprovals > 0 ? (
                <span className="notification-dot">{summary.pendingApprovals}</span>
              ) : null}
            </button>
            <button className="button button--ghost" type="button" onClick={handleSignOut}>
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </header>

        <section className={`focus-strip focus-strip--${notice.tone}`} aria-live="polite">
          <div>
            {loading ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Database size={18} aria-hidden="true" />}
            <span>{notice.message}</span>
          </div>
          <div className="date-filter">
            <CalendarDays size={16} aria-hidden="true" />
            {formatDate(new Date().toISOString())}
          </div>
        </section>

        {activeView === 'overview' ? (
          <section className="summary-grid" id="overview" aria-label="Company overview">
            <SummaryMetric label="Pipeline Value" value={bahtFormatter.format(summary.pipelineValue)} detail="Live leads only" icon={Handshake} />
            <SummaryMetric label="Active Projects" value={String(summary.activeProjects)} detail="From projects table" icon={BriefcaseBusiness} />
            <SummaryMetric label="Available Partners" value={String(summary.availablePartners)} detail={`${data.partners.length} total partners`} icon={UsersRound} />
            <SummaryMetric label="Pending Approvals" value={String(summary.pendingApprovals)} detail={`${summary.readyMilestones} milestones ready`} icon={CheckCircle2} />
            <SummaryMetric label="Reusable Assets" value={String(summary.assets)} detail="SOPs, code, prompts" icon={FileStack} />
          </section>
        ) : null}

        {activeView === 'crm' || activeView === 'projects' ? (
        <section className="dashboard-grid dashboard-grid--module">
          {activeView === 'crm' ? (
          <Panel id="crm" title="CRM & Sales Pipeline" actionLabel="Create lead" active={activeNav.panelId === 'crm'}>
            <LeadForm
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('leads', payload)
                    await recordAutomationEvent('lead.created', `New lead created: ${payload.company}`, 'leads')
                  },
                  'Lead saved to Supabase.',
                )
              }
            />
            <LeadTable
              leads={filtered.leads}
              saving={saving}
              onStageChange={(lead, stage) =>
                runMutation(
                  async () => {
                    await updateRow('leads', lead.id, { stage })
                    await recordAutomationEvent('lead.stage_changed', `${lead.company} moved to ${leadStageLabels[stage]}`, 'leads', lead.id)
                  },
                  'Lead stage updated.',
                )
              }
              onDelete={(lead) =>
                runMutation(() => deleteRow('leads', lead.id), `${lead.company} deleted.`)
              }
            />
          </Panel>
          ) : null}

          {activeView === 'projects' ? (
          <Panel id="projects" title="Projects & Milestones" actionLabel="Create project" active={activeNav.panelId === 'projects'}>
            <ProjectForm
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('projects', payload)
                    await recordAutomationEvent('project.created', `Project created: ${payload.name}`, 'projects')
                  },
                  'Project saved.',
                )
              }
            />
            <ProjectTable
              projects={filtered.projects}
              saving={saving}
              onStatusChange={(project, status) =>
                runMutation(
                  async () => {
                    await updateRow('projects', project.id, { status })
                    await recordAutomationEvent(
                      'project.status_changed',
                      `${project.name} changed to ${projectStatusLabels[status]}`,
                      'projects',
                      project.id,
                    )
                  },
                  'Project status updated.',
                )
              }
              onDelete={(project) =>
                runMutation(() => deleteRow('projects', project.id), `${project.name} deleted.`)
              }
            />
            <MilestoneForm
              projects={data.projects}
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('milestones', payload)
                    await recordAutomationEvent('milestone.created', `Milestone created: ${payload.title}`, 'milestones')
                  },
                  'Milestone saved.',
                )
              }
            />
            <MilestoneTable
              milestones={filtered.milestones}
              saving={saving}
              onStatusChange={(milestone, status) =>
                runMutation(
                  async () => {
                    await updateRow('milestones', milestone.id, {
                      status,
                      progress: status === 'done' ? 100 : milestone.progress,
                    })
                    await recordAutomationEvent(
                      'milestone.status_changed',
                      `${milestone.title} changed to ${milestoneStatusLabels[status]}`,
                      'milestones',
                      milestone.id,
                    )
                  },
                  'Milestone updated.',
                )
              }
              onDelete={(milestone) =>
                runMutation(() => deleteRow('milestones', milestone.id), `${milestone.title} deleted.`)
              }
            />
          </Panel>
          ) : null}
        </section>
        ) : null}

        {activeView === 'partners' || activeView === 'finance' ? (
        <section className="dashboard-grid dashboard-grid--module">
          {activeView === 'partners' ? (
          <>
          <Panel id="partners" title="Freelance / Partner Roster" actionLabel="Create partner" active={activeNav.panelId === 'partners'}>
            <PartnerForm
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('partners', payload)
                    await recordAutomationEvent('partner.created', `Partner added: ${payload.name}`, 'partners')
                  },
                  'Partner saved.',
                )
              }
            />
            <PartnerTable
              partners={filtered.partners}
              saving={saving}
              onDelete={(partner) =>
                runMutation(() => deleteRow('partners', partner.id), `${partner.name} deleted.`)
              }
            />
          </Panel>

          <Panel title="Resource Allocation" actionLabel="Assign partner" active={activeNav.panelId === 'partners'}>
            <AllocationForm
              projects={data.projects}
              partners={data.partners}
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('allocations', payload)
                    await recordAutomationEvent('allocation.created', 'Partner allocated to project', 'allocations')
                  },
                  'Allocation saved.',
                )
              }
            />
            <AllocationList
              allocations={filtered.allocations}
              saving={saving}
              onDelete={(allocation) =>
                runMutation(
                  async () => {
                    await deleteRow('allocations', allocation.id)
                    await recordAutomationEvent('allocation.deleted', 'Partner allocation removed', 'allocations', allocation.id)
                  },
                  'Allocation deleted.',
                )
              }
            />
          </Panel>
          </>
          ) : null}

          {activeView === 'finance' ? (
          <Panel id="finance" title="Finance & Billing" actionLabel="Create invoice" active={activeNav.panelId === 'finance'}>
            <InvoiceForm
              projects={data.projects}
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('invoices', payload)
                    await recordAutomationEvent('invoice.created', `Invoice created: ${payload.invoice_no}`, 'invoices')
                  },
                  'Invoice saved.',
                )
              }
            />
            <InvoiceTable
              invoices={filtered.invoices}
              saving={saving}
              onApprove={(invoice) =>
                runMutation(
                  async () => {
                    await updateRow('invoices', invoice.id, {
                      status: 'approved',
                      approved_at: new Date().toISOString(),
                    })
                    await recordAutomationEvent('invoice.approved', `${invoice.invoice_no} approved`, 'invoices', invoice.id)
                  },
                  'Invoice approved.',
                )
              }
              onDelete={(invoice) =>
                runMutation(() => deleteRow('invoices', invoice.id), `${invoice.invoice_no} deleted.`)
              }
            />
          </Panel>
          ) : null}
        </section>
        ) : null}

        {activeView === 'documents' || activeView === 'automation' ? (
        <section className="dashboard-grid dashboard-grid--module">
          {activeView === 'documents' ? (
          <Panel id="documents" title="Document & Asset Management" actionLabel="Create asset" active={activeNav.panelId === 'documents'}>
            <AssetForm
              saving={saving}
              onCreate={(payload) =>
                runMutation(
                  async () => {
                    await insertRow('assets', payload)
                    await recordAutomationEvent('asset.created', `Asset added: ${payload.name}`, 'assets')
                  },
                  'Asset saved.',
                )
              }
            />
            <AssetTable
              assets={filtered.assets}
              saving={saving}
              onDelete={(asset) =>
                runMutation(() => deleteRow('assets', asset.id), `${asset.name} deleted.`)
              }
            />
          </Panel>
          ) : null}

          {activeView === 'automation' ? (
          <Panel id="automation" title="Automation Events" actionLabel="Live event log" active={activeNav.panelId === 'automation'}>
            <AutomationEvents events={filtered.automationEvents} />
          </Panel>
          ) : null}
        </section>
        ) : null}

        {activeView === 'settings' ? (
        <section className="dashboard-grid dashboard-grid--module" id="settings">
          <Panel title="Production Setup" actionLabel="Supabase + Vercel" active={activeNav.panelId === 'settings'}>
            <SetupChecklist />
          </Panel>
        </section>
        ) : null}
      </main>
    </div>
  )
}

function SetupScreen() {
  return (
    <main className="setup-screen">
      <section className="setup-card">
        <img src="/brand/innextgen-logo-cropped.png" alt="InNextGen logo" />
        <h1>Connect a real database first</h1>
        <p>
          Mock data has been removed. Add Supabase environment variables in Vercel and run
          <code>supabase/schema.sql</code> in your Supabase SQL editor.
        </p>
        <pre>{`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...`}</pre>
      </section>
    </main>
  )
}

function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setMessage('Working...')

    const result =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage(mode === 'signin' ? 'Signed in.' : 'Account created. Check email confirmation if Supabase requires it.')
  }

  return (
    <main className="setup-screen">
      <form className="setup-card auth-card" onSubmit={handleSubmit}>
        <img src="/brand/innextgen-logo-cropped.png" alt="InNextGen logo" />
        <h1>InNextGen Lean ERP</h1>
        <p>Sign in with a Supabase Auth user. The workspace starts empty and writes to your live database.</p>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            type="password"
            required
          />
        </label>
        <button className="button button--primary button--full" type="submit">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <button
          className="link-action"
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
        </button>
        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </main>
  )
}

function SummaryMetric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}) {
  return (
    <article className="summary-card summary-card--blue">
      <div className="summary-icon">
        <Icon size={24} aria-hidden="true" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function Panel({
  id,
  title,
  actionLabel,
  active,
  children,
}: {
  id?: string
  title: string
  actionLabel: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className={`panel ${active ? 'panel--active' : ''}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        <span className="panel-action-label">{actionLabel}</span>
      </div>
      {children}
    </section>
  )
}

function LeadForm({
  saving,
  onCreate,
}: {
  saving: boolean
  onCreate: (payload: Record<string, string | number | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      company: getText(form, 'company'),
      contact_name: getNullableText(form, 'contact_name'),
      owner: getNullableText(form, 'owner'),
      stage: getText(form, 'stage'),
      deal_value: getNumber(form, 'deal_value'),
      next_step: getNullableText(form, 'next_step'),
      close_date: getNullableText(form, 'close_date'),
    })
    event.currentTarget.reset()
  }

  return (
    <form className="data-form" onSubmit={submit}>
      <input name="company" placeholder="Company / lead name" required />
      <input name="contact_name" placeholder="Contact" />
      <input name="owner" placeholder="Owner" />
      <select name="stage" defaultValue="lead">
        {typedEntries(leadStageLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input name="deal_value" placeholder="Deal value" min="0" type="number" />
      <input name="next_step" placeholder="Next step" />
      <input name="close_date" type="date" />
      <button className="button button--primary" type="submit" disabled={saving}>
        <Plus size={16} aria-hidden="true" />
        Add Lead
      </button>
    </form>
  )
}

function LeadTable({
  leads,
  saving,
  onStageChange,
  onDelete,
}: {
  leads: Lead[]
  saving: boolean
  onStageChange: (lead: Lead, stage: LeadStage) => void
  onDelete: (lead: Lead) => void
}) {
  if (leads.length === 0) return <EmptyState title="No leads yet" detail="Create the first sales lead to start the pipeline." />

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Owner</th>
            <th>Value</th>
            <th>Stage</th>
            <th>Next Step</th>
            <th>Close Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <strong>{lead.company}</strong>
                <span className="subtext">{lead.contact_name || 'No contact'}</span>
              </td>
              <td>{lead.owner || '-'}</td>
              <td>{bahtFormatter.format(Number(lead.deal_value))}</td>
              <td>
                <select
                  className="inline-select"
                  value={lead.stage}
                  disabled={saving}
                  onChange={(event) => onStageChange(lead, event.target.value as LeadStage)}
                >
                  {typedEntries(leadStageLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{lead.next_step || '-'}</td>
              <td>{formatDate(lead.close_date)}</td>
              <td>
                <DeleteButton disabled={saving} onClick={() => onDelete(lead)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProjectForm({
  saving,
  onCreate,
}: {
  saving: boolean
  onCreate: (payload: Record<string, string | number | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      name: getText(form, 'name'),
      client: getNullableText(form, 'client'),
      owner: getNullableText(form, 'owner'),
      budget: getNumber(form, 'budget'),
      status: getText(form, 'status') || 'active',
      start_date: getNullableText(form, 'start_date'),
      due_date: getNullableText(form, 'due_date'),
    })
    event.currentTarget.reset()
  }

  return (
    <form className="data-form" onSubmit={submit}>
      <input name="name" placeholder="Project name" required />
      <input name="client" placeholder="Client" />
      <input name="owner" placeholder="Owner" />
      <input name="budget" placeholder="Budget" min="0" type="number" />
      <select name="status" defaultValue="active">
        {typedEntries(projectStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input name="start_date" type="date" />
      <input name="due_date" type="date" />
      <button className="button button--primary" type="submit" disabled={saving}>
        <Plus size={16} aria-hidden="true" />
        Add Project
      </button>
    </form>
  )
}

function ProjectTable({
  projects,
  saving,
  onStatusChange,
  onDelete,
}: {
  projects: Project[]
  saving: boolean
  onStatusChange: (project: Project, status: ProjectStatus) => void
  onDelete: (project: Project) => void
}) {
  if (projects.length === 0) return <EmptyState title="No projects yet" detail="Create a project to start planning milestones." />

  return (
    <div className="table-wrap table-wrap--spaced">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Client</th>
            <th>Owner</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Start</th>
            <th>Due</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <strong>{project.name}</strong>
              </td>
              <td>{project.client || '-'}</td>
              <td>{project.owner || '-'}</td>
              <td>{bahtFormatter.format(Number(project.budget))}</td>
              <td>
                <select
                  className="inline-select"
                  value={project.status}
                  disabled={saving}
                  onChange={(event) => onStatusChange(project, event.target.value as ProjectStatus)}
                >
                  {typedEntries(projectStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatDate(project.start_date)}</td>
              <td>{formatDate(project.due_date)}</td>
              <td>
                <DeleteButton disabled={saving} onClick={() => onDelete(project)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MilestoneForm({
  projects,
  saving,
  onCreate,
}: {
  projects: Project[]
  saving: boolean
  onCreate: (payload: Record<string, string | number | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      project_id: getText(form, 'project_id'),
      title: getText(form, 'title'),
      status: getText(form, 'status'),
      progress: getNumber(form, 'progress'),
      due_date: getNullableText(form, 'due_date'),
    })
    event.currentTarget.reset()
  }

  return (
    <form className="data-form data-form--muted" onSubmit={submit}>
      <select name="project_id" required disabled={projects.length === 0}>
        <option value="">Project for milestone</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input name="title" placeholder="Milestone title" required />
      <select name="status" defaultValue="planned">
        {typedEntries(milestoneStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input name="progress" placeholder="Progress %" min="0" max="100" type="number" />
      <input name="due_date" type="date" />
      <button className="button button--secondary" type="submit" disabled={saving || projects.length === 0}>
        <ListChecks size={16} aria-hidden="true" />
        Add Milestone
      </button>
    </form>
  )
}

function MilestoneTable({
  milestones,
  saving,
  onStatusChange,
  onDelete,
}: {
  milestones: Milestone[]
  saving: boolean
  onStatusChange: (milestone: Milestone, status: MilestoneStatus) => void
  onDelete: (milestone: Milestone) => void
}) {
  if (milestones.length === 0) return <EmptyState title="No milestones yet" detail="Add a project first, then create milestones." />

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Milestone</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Due</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((milestone) => (
            <tr key={milestone.id}>
              <td>
                <strong>{milestone.projects?.name || 'Project removed'}</strong>
              </td>
              <td>{milestone.title}</td>
              <td>
                <ProgressBar value={milestone.progress} />
              </td>
              <td>
                <select
                  className="inline-select"
                  value={milestone.status}
                  disabled={saving}
                  onChange={(event) => onStatusChange(milestone, event.target.value as MilestoneStatus)}
                >
                  {typedEntries(milestoneStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatDate(milestone.due_date)}</td>
              <td>
                <DeleteButton disabled={saving} onClick={() => onDelete(milestone)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PartnerForm({
  saving,
  onCreate,
}: {
  saving: boolean
  onCreate: (payload: Record<string, string | number | string[] | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      name: getText(form, 'name'),
      role: getNullableText(form, 'role'),
      skills: getText(form, 'skills')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      daily_rate: getNumber(form, 'daily_rate'),
      availability: getText(form, 'availability'),
      email: getNullableText(form, 'email'),
    })
    event.currentTarget.reset()
  }

  return (
    <form className="data-form" onSubmit={submit}>
      <input name="name" placeholder="Partner name" required />
      <input name="role" placeholder="Role" />
      <input name="skills" placeholder="Skills comma separated" />
      <input name="daily_rate" placeholder="Daily rate" min="0" type="number" />
      <select name="availability" defaultValue="available">
        {typedEntries(partnerStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input name="email" placeholder="Email" type="email" />
      <button className="button button--primary" type="submit" disabled={saving}>
        <Plus size={16} aria-hidden="true" />
        Add Partner
      </button>
    </form>
  )
}

function PartnerTable({
  partners,
  saving,
  onDelete,
}: {
  partners: Partner[]
  saving: boolean
  onDelete: (partner: Partner) => void
}) {
  if (partners.length === 0) return <EmptyState title="No partners yet" detail="Add freelance or partner profiles before allocation." />

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Skills</th>
            <th>Rate</th>
            <th>Availability</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id}>
              <td>
                <strong>{partner.name}</strong>
                <span className="subtext">{partner.email || 'No email'}</span>
              </td>
              <td>{partner.role || '-'}</td>
              <td>{partner.skills.length ? partner.skills.join(', ') : '-'}</td>
              <td>{bahtFormatter.format(Number(partner.daily_rate))}</td>
              <td>
                <span className={`status status--${partner.availability}`}>{partnerStatusLabels[partner.availability]}</span>
              </td>
              <td>
                <DeleteButton disabled={saving} onClick={() => onDelete(partner)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AllocationForm({
  projects,
  partners,
  saving,
  onCreate,
}: {
  projects: Project[]
  partners: Partner[]
  saving: boolean
  onCreate: (payload: Record<string, string | number | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      project_id: getText(form, 'project_id'),
      partner_id: getText(form, 'partner_id'),
      role: getNullableText(form, 'role'),
      allocation_percent: getNumber(form, 'allocation_percent'),
      starts_on: getNullableText(form, 'starts_on'),
      ends_on: getNullableText(form, 'ends_on'),
    })
    event.currentTarget.reset()
  }

  const disabled = projects.length === 0 || partners.length === 0 || saving

  return (
    <form className="data-form data-form--single" onSubmit={submit}>
      <select name="project_id" required disabled={disabled}>
        <option value="">Project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <select name="partner_id" required disabled={disabled}>
        <option value="">Partner</option>
        {partners.map((partner) => (
          <option key={partner.id} value={partner.id}>
            {partner.name}
          </option>
        ))}
      </select>
      <input name="role" placeholder="Allocation role" />
      <input name="allocation_percent" placeholder="%" min="0" max="100" type="number" />
      <input name="starts_on" type="date" />
      <input name="ends_on" type="date" />
      <button className="button button--secondary" type="submit" disabled={disabled}>
        Allocate
      </button>
    </form>
  )
}

function AllocationList({
  allocations,
  saving,
  onDelete,
}: {
  allocations: DashboardData['allocations']
  saving: boolean
  onDelete: (allocation: DashboardData['allocations'][number]) => void
}) {
  if (allocations.length === 0) return <EmptyState title="No allocations yet" detail="Assign partners to projects after creating both records." />

  return (
    <div className="automation-log">
      {allocations.map((allocation) => (
        <div className="log-line log-line--with-action" key={allocation.id}>
          <UsersRound size={14} aria-hidden="true" />
          <span>
            {allocation.partners?.name || 'Partner'} to {allocation.projects?.name || 'Project'} / {allocation.allocation_percent}%
          </span>
          <DeleteButton disabled={saving} onClick={() => onDelete(allocation)} />
        </div>
      ))}
    </div>
  )
}

function InvoiceForm({
  projects,
  saving,
  onCreate,
}: {
  projects: Project[]
  saving: boolean
  onCreate: (payload: Record<string, string | number | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      invoice_no: getText(form, 'invoice_no'),
      project_id: getNullableText(form, 'project_id'),
      client: getText(form, 'client'),
      amount: getNumber(form, 'amount'),
      status: getText(form, 'status'),
      due_date: getNullableText(form, 'due_date'),
      requested_by: getNullableText(form, 'requested_by'),
    })
    event.currentTarget.reset()
  }

  return (
    <form className="data-form" onSubmit={submit}>
      <input name="invoice_no" placeholder="Invoice no." required />
      <select name="project_id">
        <option value="">No project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input name="client" placeholder="Client" required />
      <input name="amount" placeholder="Amount" min="0" type="number" />
      <select name="status" defaultValue="pending">
        {typedEntries(invoiceStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input name="due_date" type="date" />
      <input name="requested_by" placeholder="Requested by" />
      <button className="button button--primary" type="submit" disabled={saving}>
        <Plus size={16} aria-hidden="true" />
        Add Invoice
      </button>
    </form>
  )
}

function InvoiceTable({
  invoices,
  saving,
  onApprove,
  onDelete,
}: {
  invoices: Invoice[]
  saving: boolean
  onApprove: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
}) {
  if (invoices.length === 0) return <EmptyState title="No invoices yet" detail="Create invoices when milestones are billable." />

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Project</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <strong>{invoice.invoice_no}</strong>
                <span className="subtext">{invoice.requested_by || 'No requester'}</span>
              </td>
              <td>{invoice.projects?.name || '-'}</td>
              <td>{invoice.client}</td>
              <td>{bahtFormatter.format(Number(invoice.amount))}</td>
              <td>
                <span className={`status status--${invoice.status}`}>{invoiceStatusLabels[invoice.status]}</span>
              </td>
              <td>{formatDate(invoice.due_date)}</td>
              <td className="table-actions">
                {invoice.status !== 'approved' ? (
                  <button className="mini-action" type="button" disabled={saving} onClick={() => onApprove(invoice)}>
                    <Check size={14} aria-hidden="true" />
                    Approve
                  </button>
                ) : null}
                <DeleteButton disabled={saving} onClick={() => onDelete(invoice)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AssetForm({
  saving,
  onCreate,
}: {
  saving: boolean
  onCreate: (payload: Record<string, string | null>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onCreate({
      name: getText(form, 'name'),
      asset_type: getText(form, 'asset_type'),
      category: getNullableText(form, 'category'),
      url: getNullableText(form, 'url'),
      owner: getNullableText(form, 'owner'),
    })
    event.currentTarget.reset()
  }

  return (
    <form className="data-form" onSubmit={submit}>
      <input name="name" placeholder="Asset name" required />
      <select name="asset_type" defaultValue="sop">
        <option value="sop">SOP</option>
        <option value="code">Code</option>
        <option value="prompt">Prompt</option>
        <option value="blueprint">Blueprint</option>
        <option value="template">Template</option>
      </select>
      <input name="category" placeholder="Category" />
      <input name="url" placeholder="URL" type="url" />
      <input name="owner" placeholder="Owner" />
      <button className="button button--primary" type="submit" disabled={saving}>
        <Plus size={16} aria-hidden="true" />
        Add Asset
      </button>
    </form>
  )
}

function AssetTable({
  assets,
  saving,
  onDelete,
}: {
  assets: AssetItem[]
  saving: boolean
  onDelete: (asset: AssetItem) => void
}) {
  if (assets.length === 0) return <EmptyState title="No reusable assets yet" detail="Store SOPs, code, prompts, templates, and automation blueprints." />

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Owner</th>
            <th>URL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <strong>{asset.name}</strong>
              </td>
              <td>{asset.asset_type}</td>
              <td>{asset.category || '-'}</td>
              <td>{asset.owner || '-'}</td>
              <td>{asset.url ? <a href={asset.url}>{asset.url}</a> : '-'}</td>
              <td>
                <DeleteButton disabled={saving} onClick={() => onDelete(asset)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AutomationEvents({ events }: { events: DashboardData['automationEvents'] }) {
  if (events.length === 0) {
    return <EmptyState title="No automation events yet" detail="Create or update records to write events for n8n/Make." />
  }

  return (
    <div className="automation-log">
      {events.map((event) => (
        <div className="log-line" key={event.id}>
          <Workflow size={14} aria-hidden="true" />
          <span>
            {event.description} / {formatDate(event.created_at)}
          </span>
        </div>
      ))}
    </div>
  )
}

function SetupChecklist() {
  return (
    <div className="setup-list">
      <div>
        <Database size={18} aria-hidden="true" />
        Run <code>supabase/schema.sql</code> in Supabase SQL editor.
      </div>
      <div>
        <CheckCircle2 size={18} aria-hidden="true" />
        Enable email/password provider in Supabase Auth.
      </div>
      <div>
        <Workflow size={18} aria-hidden="true" />
        Add n8n or Make webhook later by listening to <code>automation_events</code>.
      </div>
      <div>
        <AlertCircle size={18} aria-hidden="true" />
        For public launch, add role-based access policies before inviting external users.
      </div>
    </div>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

function DeleteButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button className="icon-button icon-button--table icon-button--danger" type="button" disabled={disabled} onClick={onClick} title="Delete">
      <Trash2 size={15} aria-hidden="true" />
    </button>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <span className="progress" aria-label={`${value}% complete`}>
      <span style={{ width: `${value}%` }} />
    </span>
  )
}

function getText(form: FormData, key: string) {
  return String(form.get(key) ?? '').trim()
}

function getNullableText(form: FormData, key: string) {
  const value = getText(form, key)
  return value.length ? value : null
}

function getNumber(form: FormData, key: string) {
  const value = Number(form.get(key) ?? 0)
  return Number.isFinite(value) ? value : 0
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return shortDate.format(new Date(value))
}

function typedEntries<T extends string>(record: Record<T, string>) {
  return Object.entries(record) as [T, string][]
}

export default App

