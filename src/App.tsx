import { useState, useEffect, useMemo, type FC } from 'react'
import './pace.css'
import { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakSelect, TweakColor } from './components/tweaks-panel'
import { InboxCard, PipelinesCard, PlansCard, MeetingsCard, TasksCard, ActivityCard } from './components/cards'
import {
  EmailSlideover, PipelineSlideover, PlanSlideover,
  MeetingSlideover, ListSlideover,
} from './components/slideovers'
import { SettingsPage, LoggedOut } from './components/settings'
import {
  IconSparkle, IconInbox, IconPipeline, IconPlan, IconCalendar,
  IconCheck, IconActivity, IconSettings, IconSearch, IconAlert,
  IconTeams, IconGit,
} from './components/icons'
import {
  initialEmails, initialPipelines, initialPlans,
  initialMeetings, initialTasks, initialActivity,
} from './components/data'
import type { Email, Pipeline, Task, ActivityItem, Panel, PanelKind, Persona, Tone } from './components/types'

const TWEAK_DEFAULTS = {
  accent: '#7dd3fc',
  density: 'balanced' as const,
  persona: 'both' as const,
  tone: 'propose' as const,
  dark: true,
  showInbox: true,
  showPipelines: true,
  showPlans: true,
  showMeetings: true,
  showTasks: true,
  showActivity: true,
}

// ── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  active: string
  onPick: (id: string) => void
  persona: Persona
  onPersona: (p: Persona) => void
  counts: Record<string, number>
  onOpenSettings: () => void
}

const Sidebar: FC<SidebarProps> = ({ active, onPick, persona, onPersona, counts, onOpenSettings }) => {
  const items = [
    { id: 'home',      label: 'Today',        icon: IconSparkle,  count: null,                always: true },
    { id: 'inbox',     label: 'Inbox',        icon: IconInbox,    count: counts.inbox },
    { id: 'pipelines', label: 'Pipelines',    icon: IconPipeline, count: counts.pipelines, personas: ['eng', 'both'] },
    { id: 'plans',     label: 'Plans → Spec', icon: IconPlan,     count: counts.plans,     personas: ['pm', 'both'] },
    { id: 'meetings',  label: 'Meetings',     icon: IconCalendar, count: counts.meetings },
    { id: 'tasks',     label: 'Tasks',        icon: IconCheck,    count: counts.tasks },
    { id: 'activity',  label: 'Activity',     icon: IconActivity, count: counts.activity },
  ]

  return (
    <nav className="sb">
      <div className="sb__brand">
        <div className="sb__logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="var(--pace-accent)" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="4" fill="var(--pace-accent)" />
            <circle cx="26" cy="10" r="1.8" fill="var(--pace-accent)" />
          </svg>
        </div>
        <div className="sb__name">
          <span className="sb__name-main">Pace</span>
          <span className="sb__name-sub">your AI coworker</span>
        </div>
      </div>

      <div className="sb__persona">
        <div className="sb__lbl">Working as</div>
        <div className="sb__seg">
          {([['eng', 'Eng'], ['pm', 'Manager'], ['both', 'Both']] as const).map(([id, label]) => (
            <button key={id} className={`sb__seg-btn ${persona === id ? 'is-on' : ''}`}
              onClick={() => onPersona(id)} type="button">{label}</button>
          ))}
        </div>
      </div>

      <div className="sb__lbl sb__lbl--nav">Workspace</div>
      <ul className="sb__list">
        {items
          .filter((i) => i.always || !i.personas || i.personas.includes(persona))
          .map((i) => {
            const I = i.icon
            return (
              <li key={i.id}>
                <button className={`sb__item ${active === i.id ? 'is-on' : ''}`}
                  onClick={() => onPick(i.id)} type="button">
                  <I size={15} />
                  <span>{i.label}</span>
                  {i.count != null && i.count > 0
                    ? <span className="sb__count">{i.count}</span>
                    : null}
                </button>
              </li>
            )
          })}
      </ul>

      <div className="sb__foot">
        <button
          className={`sb__item sb__item--settings ${active === 'settings' ? 'is-on' : ''}`}
          type="button" onClick={onOpenSettings}>
          <IconSettings size={14} />
          <span>Settings</span>
        </button>
        <div className="sb__status">
          <span className="sb__dot" />
          <div>
            <div className="sb__status-l">Pace is on</div>
            <div className="sb__status-s">watching email, Teams, CI</div>
          </div>
        </div>
        <div className="sb__sources">
          <span className="src-pill"><IconInbox size={10} /> Gmail</span>
          <span className="src-pill src-pill--teams"><IconTeams size={10} /> Teams</span>
          <span className="src-pill"><IconGit size={10} /> GitHub</span>
          <span className="src-pill"><IconCalendar size={10} /> Calendar</span>
        </div>
      </div>
    </nav>
  )
}

// ── Top bar ────────────────────────────────────────────────────────────────
interface TopBarProps {
  persona: Persona
  awaiting: number
  tone: Tone
  onTweaks: () => void
}

const TopBar: FC<TopBarProps> = ({ awaiting, tone, onTweaks }) => {
  const toneCopy: Record<Tone, string> = {
    propose:   "I'll propose — you have the final say.",
    quiet:     'Quiet mode — surface only what you need to see.',
    confident: "Drafting decisively — ready for your sign-off.",
    proactive: "Acting where it's safe; pinging you where it's not.",
  }
  return (
    <header className="top">
      <div className="top__greet">
        <div className="top__hello">
          Good morning <span className="top__hello-em">— here's where things stand</span>
        </div>
        <div className="top__pace">
          <span className="top__pace-pill">
            <span className="top__pace-orb" />
            Pace · {tone}
          </span>
          <span className="top__pace-msg">"{toneCopy[tone]}"</span>
        </div>
      </div>
      <div className="top__r">
        <div className="top__search">
          <IconSearch size={13} />
          <input placeholder="Ask Pace, or search threads, PRs, meetings…" />
          <kbd>⌘K</kbd>
        </div>
        <button className="top__bell" type="button" title={`${awaiting} items awaiting you`} onClick={onTweaks}>
          <IconAlert size={15} />
          {awaiting > 0 ? <span className="top__bell-num">{awaiting}</span> : null}
        </button>
        <div className="top__me">
          <span className="top__me-avatar">YO</span>
        </div>
      </div>
    </header>
  )
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  const [emails, setEmails]       = useState<Email[]>(initialEmails)
  const [pipelines, setPipelines] = useState(initialPipelines)
  const [plans]                   = useState(initialPlans)
  const [meetings]                = useState(initialMeetings)
  const [tasks, setTasks]         = useState<Task[]>(initialTasks)
  const [activity, setActivity]   = useState<ActivityItem[]>(initialActivity)

  const [active, setActive]       = useState('home')
  const [panel, setPanel]         = useState<Panel | null>(null)
  const [toast, setToast]         = useState<string | null>(null)
  const [signedOut, setSignedOut] = useState(false)

  const openPanel  = (kind: PanelKind, id: string | null) => setPanel({ kind, id })
  const closePanel = () => setPanel(null)

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  // ── Email actions
  const approveEmail = (id: string) => {
    const em = emails.find((e) => e.id === id)
    setEmails(emails.map((e) => e.id === id ? { ...e, handled: 'sent · just now', draft: null } : e))
    setActivity([{ id: 'aN' + Date.now(), when: 'just now', kind: 'draft', text: `Sent reply to ${em?.from}`, awaiting: false }, ...activity])
    if (em && em.todos.length) {
      const newTasks = em.todos.map((todo, i) => ({
        id: 'tN' + Date.now() + i,
        text: todo.text, source: `email · ${em.from}`, due: todo.due, done: false, persona: em.persona,
      }))
      setTasks([...newTasks, ...tasks])
    }
    flash(`Sent reply to ${em ? em.from : 'recipient'}${em && em.todos.length ? ` · +${em.todos.length} task${em.todos.length > 1 ? 's' : ''}` : ''}`)
    if (panel?.kind === 'email') closePanel()
  }

  const declineEmail = (id: string) => {
    setEmails(emails.map((e) => e.id === id ? { ...e, handled: 'draft discarded', draft: null } : e))
    flash('Discarded draft')
    if (panel?.kind === 'email') closePanel()
  }

  // ── Pipeline actions
  const applyFix = (id: string) => {
    setPipelines(pipelines.map((p) => p.id === id ? { ...p, status: 'running', stage: 'lint', fix: null, error: null, duration: '0m 04s' } : p))
    const p = pipelines.find((x) => x.id === id)
    setActivity([{ id: 'aN' + Date.now(), when: 'just now', kind: 'fix', text: `Applied fix to ${p ? p.repo : 'pipeline'} — CI re-running`, awaiting: false }, ...activity])
    flash('Fix applied · CI re-running')
    if (panel?.kind === 'pipeline') closePanel()
  }

  // ── Task actions
  const toggleTask = (id: string) => setTasks(tasks.map((x) => x.id === id ? { ...x, done: !x.done } : x))
  const addTask = (text: string, due: string) => {
    setTasks([{ id: 'tN' + Date.now(), text, source: 'meeting', due, done: false, persona: 'pm' }, ...tasks])
    flash('Task added')
  }

  // ── Sidebar counts
  const counts = {
    inbox:     emails.filter((e) => e.draft && !e.handled).length,
    pipelines: pipelines.filter((p) => p.status === 'failing').length,
    plans:     plans.filter((p) => p.status !== 'queued').length,
    meetings:  meetings.filter((m) => m.status !== 'past').length,
    tasks:     tasks.filter((x) => !x.done).length,
    activity:  activity.filter((a) => a.awaiting).length,
  }
  const awaitingTotal = counts.inbox + counts.pipelines + activity.filter((a) => a.awaiting).length

  // ── CSS tokens from tweaks
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--pace-accent', t.accent)
    root.dataset.theme = t.dark ? 'dark' : 'light'
    root.dataset.density = t.density
  }, [t.accent, t.dark, t.density])

  // ── Persona-driven grid order
  const cardOrder = useMemo(() => {
    if (t.persona === 'eng') return ['pipelines', 'inbox', 'meetings', 'tasks', 'plans', 'activity']
    if (t.persona === 'pm')  return ['inbox', 'plans', 'meetings', 'tasks', 'pipelines', 'activity']
    return ['inbox', 'pipelines', 'plans', 'meetings', 'tasks', 'activity']
  }, [t.persona])

  const cardEnabled: Record<string, boolean> = {
    inbox: t.showInbox, pipelines: t.showPipelines, plans: t.showPlans,
    meetings: t.showMeetings, tasks: t.showTasks, activity: t.showActivity,
  }

  const renderCard = (k: string) => {
    if (!cardEnabled[k]) return null
    if (k === 'inbox')     return <InboxCard     key={k} emails={emails}       persona={t.persona} openPanel={openPanel} onApprove={approveEmail} onDecline={declineEmail} />
    if (k === 'pipelines') return <PipelinesCard key={k} pipelines={pipelines} openPanel={openPanel} onApplyFix={applyFix} />
    if (k === 'plans')     return <PlansCard     key={k} plans={plans}         openPanel={openPanel} />
    if (k === 'meetings')  return <MeetingsCard  key={k} meetings={meetings}   openPanel={openPanel} />
    if (k === 'tasks')     return <TasksCard     key={k} tasks={tasks}         persona={t.persona} openPanel={openPanel} onToggle={toggleTask} />
    if (k === 'activity')  return <ActivityCard  key={k} activity={activity}   openPanel={openPanel} />
    return null
  }

  // ── Slideover lookups
  const currentEmail    = panel?.kind === 'email'    ? emails.find((e) => e.id === panel.id) ?? null : null
  const currentPipeline = panel?.kind === 'pipeline' ? pipelines.find((p) => p.id === panel.id) ?? null : null
  const currentPlan     = panel?.kind === 'plan'     ? plans.find((p) => p.id === panel.id) ?? null : null
  const currentMeeting  = panel?.kind === 'meeting'  ? meetings.find((m) => m.id === panel.id) ?? null : null
  const listKind = panel && ['inbox','tasks','pipelines','plans','meetings','activity'].includes(panel.kind) && panel.id == null ? panel.kind : null

  const activateTweaks = () => window.postMessage({ type: '__activate_edit_mode' }, '*')

  if (signedOut) {
    return <LoggedOut onLogin={() => { setSignedOut(false); setActive('home') }} />
  }

  const onPickNav = (k: string) => {
    setActive(k)
    if (k === 'home' || k === 'settings') closePanel()
    else openPanel(k as PanelKind, null)
  }

  return (
    <div className="pace-root">
      <Sidebar
        active={active}
        onPick={onPickNav}
        persona={t.persona}
        onPersona={(p) => setTweak('persona', p)}
        counts={counts}
        onOpenSettings={() => { setActive('settings'); closePanel() }}
      />

      {active === 'settings' ? (
        <main className="main main--settings">
          <SettingsPage
            tone={t.tone}
            onTone={(v) => setTweak('tone', v)}
            onLogout={() => setSignedOut(true)}
          />
        </main>
      ) : (
        <main className="main">
          <TopBar persona={t.persona} awaiting={awaitingTotal} tone={t.tone} onTweaks={activateTweaks} />
          <div className="grid">
            {cardOrder.map((k) => {
              const c = renderCard(k)
              if (!c) return null
              const wide =
                (t.persona === 'eng' && k === 'pipelines') ||
                (t.persona === 'pm'  && (k === 'inbox' || k === 'plans')) ||
                (t.persona === 'both' && (k === 'inbox' || k === 'pipelines' || k === 'plans' || k === 'meetings'))
              return (
                <div key={k} className={`grid__cell ${wide ? 'grid__cell--wide' : 'grid__cell--narrow'}`}>
                  {c}
                </div>
              )
            })}
          </div>
        </main>
      )}

      <EmailSlideover    email={currentEmail}       onClose={closePanel} onApprove={approveEmail} onDecline={declineEmail} onAddTask={addTask} />
      <PipelineSlideover pipeline={currentPipeline} onClose={closePanel} onApplyFix={applyFix} />
      <PlanSlideover     plan={currentPlan}         onClose={closePanel} />
      <MeetingSlideover  meeting={currentMeeting}   onClose={closePanel} onAddTask={addTask} />

      <ListSlideover
        kind={listKind as PanelKind | null}
        open={!!listKind}
        onClose={closePanel}
        emails={emails}
        pipelines={pipelines}
        plans={plans}
        meetings={meetings}
        tasks={tasks}
        activity={activity}
        onApprove={approveEmail}
        onDecline={declineEmail}
        onPickEmail={(id) => openPanel('email', id)}
        onPick={(id) => {
          if (listKind === 'pipelines') openPanel('pipeline', id)
          if (listKind === 'plans')     openPanel('plan', id)
          if (listKind === 'meetings')  openPanel('meeting', id)
        }}
        onToggle={toggleTask}
      />

      {/* Toast */}
      <div className={`toast ${toast ? 'toast--in' : ''}`}>
        {toast ? <><IconSparkle size={12} /> {toast}</> : null}
      </div>

      {/* Tweaks panel — activate by clicking the bell icon in TopBar */}
      <TweaksPanel>
        <TweakSection label="Persona" />
        <TweakRadio label="Working as" value={t.persona}
          options={['eng', 'pm', 'both']}
          onChange={(v) => setTweak('persona', v as Persona)} />
        <TweakSelect label="AI tone" value={t.tone}
          options={[
            { value: 'propose',   label: 'Propose — you decide' },
            { value: 'quiet',     label: 'Quiet & deferential' },
            { value: 'confident', label: 'Confident assistant' },
            { value: 'proactive', label: 'Proactive teammate' },
          ]}
          onChange={(v) => setTweak('tone', v as Tone)} />

        <TweakSection label="Look" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakColor label="Accent" value={t.accent}
          options={['#7dd3fc', '#a78bfa', '#86efac', '#fbbf24', '#fb7185', '#e5e7eb']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Density" value={t.density}
          options={['compact', 'balanced', 'spacious']}
          onChange={(v) => setTweak('density', v as 'compact' | 'balanced' | 'spacious')} />

        <TweakSection label="Features on dashboard" />
        <TweakToggle label="Inbox"     value={t.showInbox}     onChange={(v) => setTweak('showInbox', v)} />
        <TweakToggle label="Pipelines" value={t.showPipelines} onChange={(v) => setTweak('showPipelines', v)} />
        <TweakToggle label="Plans"     value={t.showPlans}     onChange={(v) => setTweak('showPlans', v)} />
        <TweakToggle label="Meetings"  value={t.showMeetings}  onChange={(v) => setTweak('showMeetings', v)} />
        <TweakToggle label="Tasks"     value={t.showTasks}     onChange={(v) => setTweak('showTasks', v)} />
        <TweakToggle label="Activity"  value={t.showActivity}  onChange={(v) => setTweak('showActivity', v)} />
      </TweaksPanel>
    </div>
  )
}
