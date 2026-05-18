import { type FC, type ReactNode } from 'react'
import type { Email, Pipeline, Plan, Meeting, Task, ActivityItem, ActivityKind, Persona, PanelKind } from './types'
import {
  IconInbox, IconPipeline, IconPlan, IconCalendar, IconCheck,
  IconActivity, IconSparkle, IconChevron, IconArrowR, IconDot,
  IconGit, IconClock, IconTeams, IconBolt,
} from './icons'

// ── Shared chrome ──────────────────────────────────────────────────────────
interface PaceCardProps {
  title: string
  icon?: FC<{ size?: number }>
  count?: string
  action?: ReactNode
  children: ReactNode
  accent?: boolean
  onTitleClick?: () => void
  footer?: ReactNode
}

export const PaceCard: FC<PaceCardProps> = ({
  title, icon: Icn, count, action, children, accent, onTitleClick, footer,
}) => (
  <section className="pace-card">
    <header className="pace-card__hd">
      <button className="pace-card__title" onClick={onTitleClick} type="button">
        <span className="pace-card__icon" style={accent ? { color: 'var(--pace-accent)' } : undefined}>
          {Icn ? <Icn size={15} /> : null}
        </span>
        <h3>{title}</h3>
        {count != null ? <span className="pace-card__count">{count}</span> : null}
        <span className="pace-card__expand" aria-hidden="true"><IconChevron size={13} /></span>
      </button>
      {action ? <div className="pace-card__action">{action}</div> : null}
    </header>
    <div className="pace-card__body">{children}</div>
    {footer ? <div className="pace-card__footer">{footer}</div> : null}
  </section>
)

interface PaceBadgeProps {
  tone?: 'neutral' | 'good' | 'info' | 'danger' | 'warn'
  children: ReactNode
  dot?: boolean
}

export const PaceBadge: FC<PaceBadgeProps> = ({ tone = 'neutral', children, dot }) => (
  <span className={`pace-badge pace-badge--${tone}`}>
    {dot ? <i className="pace-badge__dot" /> : null}
    {children}
  </span>
)

export const PaceConfidence: FC<{ value: number }> = ({ value }) => {
  const pct = Math.round(value * 100)
  const tone = value >= 0.85 ? 'good' : value >= 0.7 ? 'mid' : 'low'
  return (
    <span className={`pace-conf pace-conf--${tone}`} title={`AI confidence: ${pct}%`}>
      <span className="pace-conf__bar"><span style={{ width: `${pct}%` }} /></span>
      <span className="pace-conf__num">{pct}</span>
    </span>
  )
}

// ── INBOX ──────────────────────────────────────────────────────────────────
interface InboxCardProps {
  emails: Email[]
  persona: Persona
  openPanel: (kind: PanelKind, id: string | null) => void
  onApprove: (id: string) => void
  onDecline: (id: string) => void
}

export const InboxCard: FC<InboxCardProps> = ({ emails, openPanel, onApprove, onDecline }) => {
  const awaiting = emails.filter((e) => e.draft && !e.handled)
  return (
    <PaceCard
      title="Inbox"
      icon={IconInbox}
      accent
      count={`${awaiting.length} drafts awaiting you`}
      onTitleClick={() => openPanel('inbox', null)}
      footer={
        <button className="pace-link" onClick={() => openPanel('inbox', null)} type="button">
          Open all {emails.length} threads <IconArrowR size={12} />
        </button>
      }
    >
      <div className="inbox-list">
        {emails.slice(0, 3).map((em) => (
          <article key={em.id} className={`email ${em.handled ? 'email--handled' : ''}`}>
            <button className="email__row" onClick={() => openPanel('email', em.id)} type="button">
              <span className="email__avatar">{em.avatar}</span>
              <span className="email__meta">
                <span className="email__from">
                  {em.from}
                  {em.priority === 'high' ? <i className="prio-dot prio-dot--high" /> : null}
                </span>
                <span className="email__subject">{em.subject}</span>
              </span>
              <span className="email__time">{em.received}</span>
            </button>
            {em.draft && !em.handled ? (
              <div className="email__draft">
                <div className="email__draft-hd">
                  <span className="ai-chip"><IconSparkle size={11} /> Pace drafted a reply</span>
                  <PaceConfidence value={em.confidence} />
                </div>
                <p className="email__draft-body">{em.draft}</p>
                <div className="email__draft-actions">
                  <button className="btn btn--primary" type="button" onClick={() => onApprove(em.id)}>
                    Approve &amp; send
                  </button>
                  <button className="btn btn--ghost" type="button" onClick={() => openPanel('email', em.id)}>
                    Edit draft
                  </button>
                  <button className="btn btn--ghost btn--quiet" type="button" onClick={() => onDecline(em.id)}>
                    Discard
                  </button>
                  {em.todos.length ? (
                    <span className="email__extracted">
                      + {em.todos.length} {em.todos.length === 1 ? 'task' : 'tasks'} extracted
                    </span>
                  ) : null}
                </div>
              </div>
            ) : em.handled ? (
              <div className="email__handled">
                <IconCheck size={12} /> {em.handled}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </PaceCard>
  )
}

// ── PIPELINES ──────────────────────────────────────────────────────────────
const statusTone: Record<string, 'danger' | 'info' | 'good'> = {
  failing: 'danger',
  running: 'info',
  passing: 'good',
}

interface PipelinesCardProps {
  pipelines: Pipeline[]
  openPanel: (kind: PanelKind, id: string | null) => void
  onApplyFix: (id: string) => void
}

export const PipelinesCard: FC<PipelinesCardProps> = ({ pipelines, openPanel }) => {
  const failing = pipelines.filter((p) => p.status === 'failing').length
  return (
    <PaceCard
      title="Pipelines"
      icon={IconPipeline}
      accent
      count={failing ? `${failing} need attention` : 'all green'}
      onTitleClick={() => openPanel('pipelines', null)}
      footer={
        <button className="pace-link" onClick={() => openPanel('pipelines', null)} type="button">
          Open CI/CD board <IconArrowR size={12} />
        </button>
      }
    >
      <div className="pipe-list">
        {pipelines.map((p) => (
          <button
            key={p.id}
            className={`pipe pipe--${p.status}`}
            onClick={() => openPanel('pipeline', p.id)}
            type="button"
          >
            <span className={`pipe__status pipe__status--${p.status}`}>
              {p.status === 'running' ? <span className="spin" /> : <IconDot size={10} />}
            </span>
            <span className="pipe__main">
              <span className="pipe__repo">
                <IconGit size={11} /> {p.repo}
                <span className="pipe__branch">{p.branch}</span>
              </span>
              <span className="pipe__msg">{p.message}</span>
            </span>
            <span className="pipe__right">
              <PaceBadge tone={statusTone[p.status]} dot>
                {p.status === 'failing'
                  ? `${p.stage} failed`
                  : p.status === 'running'
                    ? `${p.stage}…`
                    : 'deployed'}
              </PaceBadge>
              <span className="pipe__commit">{p.commit}</span>
            </span>
            {p.fix ? (
              <span className="pipe__fix">
                <IconSparkle size={11} /> Fix ready · {Math.round(p.fix.confidence * 100)}%
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </PaceCard>
  )
}

// ── PLANS ──────────────────────────────────────────────────────────────────
const planTone: Record<string, 'good' | 'info' | 'neutral'> = {
  'spec-ready': 'good',
  drafting: 'info',
  queued: 'neutral',
}
const planLabel: Record<string, string> = {
  'spec-ready': 'spec ready',
  drafting: 'drafting',
  queued: 'queued',
}

interface PlansCardProps {
  plans: Plan[]
  openPanel: (kind: PanelKind, id: string | null) => void
}

export const PlansCard: FC<PlansCardProps> = ({ plans, openPanel }) => (
  <PaceCard
    title="Plans → Spec"
    icon={IconPlan}
    accent
    count={`${plans.filter((p) => p.status !== 'queued').length} in motion`}
    onTitleClick={() => openPanel('plans', null)}
    footer={
      <span className="pace-card__hint">
        <IconSparkle size={11} /> Drop a business email or CEO note in chat to spec it
      </span>
    }
  >
    <div className="plan-list">
      {plans.map((pl) => (
        <button key={pl.id} className="plan" onClick={() => openPanel('plan', pl.id)} type="button">
          <span className="plan__head">
            <span className="plan__title">{pl.title}</span>
            <PaceBadge tone={planTone[pl.status]} dot>{planLabel[pl.status]}</PaceBadge>
          </span>
          <span className="plan__summary">{pl.summary}</span>
          <span className="plan__meta">
            <span className="plan__from">from {pl.from}</span>
            {pl.spec.length ? <span className="plan__count">{pl.spec.length} items spec'd</span> : null}
            {pl.open.length ? (
              <span className="plan__open">
                {pl.open.length} open question{pl.open.length > 1 ? 's' : ''}
              </span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  </PaceCard>
)

// ── MEETINGS ───────────────────────────────────────────────────────────────
interface MeetingsCardProps {
  meetings: Meeting[]
  openPanel: (kind: PanelKind, id: string | null) => void
}

export const MeetingsCard: FC<MeetingsCardProps> = ({ meetings, openPanel }) => (
  <PaceCard
    title="Meetings today"
    icon={IconCalendar}
    accent
    count={`${meetings.filter((m) => m.status !== 'past').length} ahead`}
    onTitleClick={() => openPanel('meetings', null)}
    footer={
      <span className="pace-card__hint">
        Pace joins, transcribes, and posts notes to the right channel.
      </span>
    }
  >
    <div className="meeting-list">
      {meetings.map((m) => (
        <button
          key={m.id}
          className={`meeting meeting--${m.status}`}
          onClick={() => openPanel('meeting', m.id)}
          type="button"
        >
          <span className="meeting__when">
            <IconClock size={11} /> {m.when}
            {m.status === 'live' ? (
              <span className="meeting__live">
                <i /> LIVE
              </span>
            ) : null}
          </span>
          <span className="meeting__title">{m.title}</span>
          <span className="meeting__att">
            {m.attendees.slice(0, 3).join(' · ')}
            {m.attendees.length > 3 ? ` +${m.attendees.length - 3}` : ''}
          </span>
          {m.status === 'past' && m.actions.length ? (
            <span className="meeting__actions-count">
              <IconSparkle size={10} /> {m.actions.length} action{m.actions.length > 1 ? 's' : ''} extracted
            </span>
          ) : null}
        </button>
      ))}
    </div>
  </PaceCard>
)

// ── TASKS ──────────────────────────────────────────────────────────────────
interface TasksCardProps {
  tasks: Task[]
  persona: Persona
  openPanel: (kind: PanelKind, id: string | null) => void
  onToggle: (id: string) => void
}

export const TasksCard: FC<TasksCardProps> = ({ tasks, persona, openPanel, onToggle }) => {
  const filtered = persona === 'both' ? tasks : tasks.filter((t) => t.persona === persona)
  const open = filtered.filter((t) => !t.done)
  const done = filtered.filter((t) => t.done)
  return (
    <PaceCard
      title="Tasks"
      icon={IconCheck}
      accent
      count={`${open.length} open`}
      onTitleClick={() => openPanel('tasks', null)}
      footer={
        <span className="pace-card__hint">
          Pulled from email,{' '}
          <span className="src-pill src-pill--teams">
            <IconTeams size={10} /> Teams
          </span>{' '}
          &amp; meetings
        </span>
      }
    >
      <div className="task-list">
        {open.slice(0, 6).map((t) => (
          <label key={t.id} className="task">
            <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
            <span className="task__box">
              <IconCheck size={10} />
            </span>
            <span className="task__main">
              <span className="task__text">{t.text}</span>
              <span className="task__meta">
                <span className="task__source">{t.source}</span>
                <span className="task__sep">·</span>
                <span className={`task__due task__due--${t.due === 'today' ? 'today' : 'later'}`}>
                  {t.due}
                </span>
              </span>
            </span>
          </label>
        ))}
        {done.length ? <div className="task-done-head">{done.length} completed</div> : null}
        {done.slice(0, 2).map((t) => (
          <label key={t.id} className="task task--done">
            <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
            <span className="task__box">
              <IconCheck size={10} />
            </span>
            <span className="task__main">
              <span className="task__text">{t.text}</span>
            </span>
          </label>
        ))}
      </div>
    </PaceCard>
  )
}

// ── ACTIVITY ───────────────────────────────────────────────────────────────
export const activityIcon: Record<ActivityKind, FC<{ size?: number }>> = {
  draft: IconInbox,
  spec: IconPlan,
  fix: IconBolt,
  notes: IconCalendar,
  task: IconCheck,
  triage: IconSparkle,
}

interface ActivityCardProps {
  activity: ActivityItem[]
  openPanel: (kind: PanelKind, id: string | null) => void
}

export const ActivityCard: FC<ActivityCardProps> = ({ activity, openPanel }) => (
  <PaceCard
    title="What Pace did today"
    icon={IconActivity}
    accent
    count={`${activity.filter((a) => a.awaiting).length} awaiting you`}
    onTitleClick={() => openPanel('activity', null)}
  >
    <div className="act-list">
      {activity.map((a) => {
        const I = activityIcon[a.kind] || IconSparkle
        return (
          <div key={a.id} className={`act ${a.awaiting ? 'act--awaiting' : ''}`}>
            <span className="act__time">{a.when}</span>
            <span className="act__icon">
              <I size={11} />
            </span>
            <span className="act__text">{a.text}</span>
            {a.awaiting ? (
              <span className="act__pill">awaiting</span>
            ) : (
              <span className="act__done">·</span>
            )}
          </div>
        )
      })}
    </div>
  </PaceCard>
)
