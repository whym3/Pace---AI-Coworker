import { useState, useEffect, type FC, type ReactNode } from 'react'
import type { Email, Pipeline, Plan, Meeting, Task, ActivityItem, PanelKind } from './types'
import {
  IconClose, IconSparkle, IconCheck, IconAlert, IconGit, IconCalendar,
  IconClock, IconPlan,
} from './icons'
import { PaceConfidence, PaceBadge, activityIcon } from './cards'

// ── Slideover shell ────────────────────────────────────────────────────────
interface SlideoverProps {
  open: boolean
  title?: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  width?: number
  children?: ReactNode
  footer?: ReactNode
}

export const Slideover: FC<SlideoverProps> = ({
  open, title, subtitle, onClose, width = 560, children, footer,
}) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`so-root ${open ? 'so-root--open' : ''}`} aria-hidden={!open}>
      <div className="so-scrim" onClick={onClose} />
      <aside className="so-panel" style={{ width }}>
        <header className="so-hd">
          <div className="so-hd__titles">
            <div className="so-hd__sub">{subtitle}</div>
            <div className="so-hd__title">{title}</div>
          </div>
          <button className="so-x" type="button" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </header>
        <div className="so-body">{children}</div>
        {footer ? <footer className="so-ft">{footer}</footer> : null}
      </aside>
    </div>
  )
}

// ── EMAIL detail ───────────────────────────────────────────────────────────
interface EmailSlideoverProps {
  email: Email | null
  onClose: () => void
  onApprove: (id: string) => void
  onDecline: (id: string) => void
  onAddTask: (text: string, due: string) => void
}

export const EmailSlideover: FC<EmailSlideoverProps> = ({
  email, onClose, onApprove, onDecline, onAddTask,
}) => {
  const [draftText, setDraftText] = useState(email?.draft ?? '')
  useEffect(() => {
    if (email) setDraftText(email.draft ?? '')
  }, [email])

  if (!email) return <Slideover open={false} onClose={onClose} />
  return (
    <Slideover
      open={!!email}
      subtitle={`From ${email.from} · ${email.fromEmail}`}
      title={email.subject}
      onClose={onClose}
      footer={
        <div className="so-ft-row">
          <button className="btn btn--primary btn--lg" onClick={() => onApprove(email.id)} type="button">
            Approve &amp; send
          </button>
          <button className="btn btn--ghost btn--lg" onClick={onClose} type="button">
            Save draft
          </button>
          <button className="btn btn--ghost btn--lg btn--quiet" onClick={() => onDecline(email.id)} type="button">
            Discard draft
          </button>
        </div>
      }
    >
      <div className="so-section">
        <div className="so-label">Original message</div>
        <div className="so-quote">{email.preview}</div>
      </div>

      <div className="so-section">
        <div className="so-label-row">
          <div className="so-label"><IconSparkle size={11} /> Pace's draft reply</div>
          <PaceConfidence value={email.confidence} />
        </div>
        <textarea
          className="so-textarea"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          rows={Math.max(6, draftText.split('\n').length + 1)}
        />
        <div className="so-tone-row">
          <span className="so-tonelabel">Tone</span>
          {['Match thread', 'More formal', 'More direct', 'Friendlier'].map((t) => (
            <button key={t} className="chip" type="button">{t}</button>
          ))}
        </div>
      </div>

      {email.todos.length ? (
        <div className="so-section">
          <div className="so-label">
            <IconCheck size={11} /> Auto-extracted tasks
            <span className="so-hint">— Pace will add these to your list when you send</span>
          </div>
          <ul className="so-tasks">
            {email.todos.map((t, i) => (
              <li key={i}>
                <span className="so-tasks__bullet" />
                <span className="so-tasks__text">{t.text}</span>
                <span className="so-tasks__due">{t.due}</span>
                <button className="chip chip--small" type="button" onClick={() => onAddTask(t.text, t.due)}>
                  Add now
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Slideover>
  )
}

// ── PIPELINE detail ────────────────────────────────────────────────────────
const statusTone: Record<string, 'danger' | 'info' | 'good'> = {
  failing: 'danger', running: 'info', passing: 'good',
}

interface PipelineSlideoverProps {
  pipeline: Pipeline | null
  onClose: () => void
  onApplyFix: (id: string) => void
}

export const Stat: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <div className="so-stat">
    <div className="so-stat__lbl">{label}</div>
    <div className="so-stat__val">{value}</div>
  </div>
)

export const PipelineSlideover: FC<PipelineSlideoverProps> = ({ pipeline, onClose, onApplyFix }) => {
  if (!pipeline) return <Slideover open={false} onClose={onClose} />
  const fix = pipeline.fix
  return (
    <Slideover
      open={!!pipeline}
      subtitle={
        <span>
          <IconGit size={11} /> {pipeline.repo} · <span className="mono">{pipeline.branch}</span>
        </span>
      }
      title={pipeline.message}
      onClose={onClose}
      width={620}
      footer={
        fix ? (
          <div className="so-ft-row">
            <button className="btn btn--primary btn--lg" onClick={() => onApplyFix(pipeline.id)} type="button">
              <IconSparkle size={12} /> Apply fix &amp; re-run CI
            </button>
            <button className="btn btn--ghost btn--lg" onClick={onClose} type="button">Open in IDE</button>
            <button className="btn btn--ghost btn--lg btn--quiet" onClick={onClose} type="button">Dismiss suggestion</button>
          </div>
        ) : (
          <div className="so-ft-row">
            <button className="btn btn--ghost btn--lg" onClick={onClose} type="button">Open in IDE</button>
          </div>
        )
      }
    >
      <div className="so-section">
        <div className="so-grid-2">
          <Stat label="status" value={
            <PaceBadge tone={statusTone[pipeline.status]} dot>
              {pipeline.status} · {pipeline.stage}
            </PaceBadge>
          } />
          <Stat label="duration" value={<span className="mono">{pipeline.duration}</span>} />
          <Stat label="commit" value={<span className="mono">{pipeline.commit}</span>} />
          <Stat label="author" value={pipeline.author} />
        </div>
      </div>

      {pipeline.error ? (
        <div className="so-section">
          <div className="so-label">Failing step</div>
          <pre className="so-pre so-pre--err">$ {pipeline.failedStep}{'\n'}{pipeline.error}</pre>
        </div>
      ) : null}

      {fix ? (
        <div className="so-section">
          <div className="so-label-row">
            <div className="so-label"><IconSparkle size={11} /> Pace's suggested fix</div>
            <PaceConfidence value={fix.confidence} />
          </div>
          <div className="so-fix-title">{fix.title}</div>
          <pre className="so-diff">
            {fix.diff.map((l, i) => (
              <span key={i} className={`so-diff__line so-diff__line--${l.type}`}>
                <span className="so-diff__gut">
                  {l.type === 'add' ? '+' : l.type === 'del' ? '−' : ' '}
                </span>
                {l.text}{'\n'}
              </span>
            ))}
          </pre>
          <div className="so-fix-reason">
            <span className="so-label-inline">Why</span>
            <span>{fix.reasoning}</span>
          </div>
        </div>
      ) : pipeline.status === 'passing' ? (
        <div className="so-empty"><IconCheck size={14} /> Clean run. Nothing to do.</div>
      ) : null}
    </Slideover>
  )
}

// ── PLAN detail ────────────────────────────────────────────────────────────
const kindLabel: Record<string, string> = {
  goal: 'Goal', screen: 'Screen', api: 'API', metric: 'Metric',
}

interface PlanSlideoverProps {
  plan: Plan | null
  onClose: () => void
}

export const PlanSlideover: FC<PlanSlideoverProps> = ({ plan, onClose }) => {
  if (!plan) return <Slideover open={false} onClose={onClose} />
  return (
    <Slideover
      open={!!plan}
      subtitle={<span><IconPlan size={11} /> Plan · from {plan.from}</span>}
      title={plan.title}
      onClose={onClose}
      width={600}
      footer={
        <div className="so-ft-row">
          <button className="btn btn--primary btn--lg" type="button" onClick={onClose}>
            Promote to engineering ticket
          </button>
          <button className="btn btn--ghost btn--lg" type="button" onClick={onClose}>Export to spec doc</button>
        </div>
      }
    >
      <div className="so-section">
        <div className="so-label">Summary</div>
        <p className="so-para">{plan.summary}</p>
      </div>
      {plan.spec.length ? (
        <div className="so-section">
          <div className="so-label"><IconSparkle size={11} /> Pace's draft breakdown</div>
          <ul className="so-spec">
            {plan.spec.map((it, i) => (
              <li key={i} className={`so-spec__row so-spec__row--${it.kind}`}>
                <span className={`so-spec__kind so-spec__kind--${it.kind}`}>{kindLabel[it.kind]}</span>
                <span className="so-spec__text">{it.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="so-empty">No spec yet — promote to start drafting.</div>
      )}
      {plan.open.length ? (
        <div className="so-section">
          <div className="so-label"><IconAlert size={11} /> Open questions</div>
          <ul className="so-open">
            {plan.open.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      ) : null}
    </Slideover>
  )
}

// ── MEETING detail ─────────────────────────────────────────────────────────
interface MeetingSlideoverProps {
  meeting: Meeting | null
  onClose: () => void
  onAddTask: (text: string, due: string) => void
}

export const MeetingSlideover: FC<MeetingSlideoverProps> = ({ meeting, onClose, onAddTask }) => {
  if (!meeting) return <Slideover open={false} onClose={onClose} />
  return (
    <Slideover
      open={!!meeting}
      subtitle={<span><IconCalendar size={11} /> {meeting.when} · {meeting.status}</span>}
      title={meeting.title}
      onClose={onClose}
      footer={
        <div className="so-ft-row">
          {meeting.status === 'live' ? (
            <button className="btn btn--primary btn--lg" type="button" onClick={onClose}>Open live transcript</button>
          ) : meeting.status === 'past' ? (
            <button className="btn btn--primary btn--lg" type="button" onClick={onClose}>Post notes to channel</button>
          ) : (
            <button className="btn btn--primary btn--lg" type="button" onClick={onClose}>Open pre-read</button>
          )}
          <button className="btn btn--ghost btn--lg" type="button" onClick={onClose}>Share notes</button>
        </div>
      }
    >
      <div className="so-section">
        <div className="so-label">Attendees</div>
        <div className="att-row">
          {meeting.attendees.map((a, i) => (
            <span key={i} className="att">
              <span className="att__avatar">
                {a.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className="so-section">
        <div className="so-label"><IconSparkle size={11} /> Pace's summary</div>
        <p className="so-para">{meeting.summary}</p>
      </div>
      {meeting.actions.length ? (
        <div className="so-section">
          <div className="so-label">Action items</div>
          <ul className="so-actions">
            {meeting.actions.map((a, i) => (
              <li key={i}>
                <span className="so-actions__who">{a.who}</span>
                <span className="so-actions__text">{a.text}</span>
                <span className="so-actions__link">linked → {a.linkedTo}</span>
                <button className="chip chip--small" type="button" onClick={() => onAddTask(a.text, 'this week')}>
                  Add to my tasks
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Slideover>
  )
}

// ── Generic list slideovers ────────────────────────────────────────────────
interface ListSlideoverProps {
  kind: PanelKind | null
  open: boolean
  onClose: () => void
  emails: Email[]
  pipelines: Pipeline[]
  plans: Plan[]
  meetings: Meeting[]
  tasks: Task[]
  activity: ActivityItem[]
  onApprove: (id: string) => void
  onDecline: (id: string) => void
  onPickEmail: (id: string) => void
  onPick: (id: string) => void
  onToggle: (id: string) => void
}

const planTone: Record<string, 'good' | 'info' | 'neutral'> = {
  'spec-ready': 'good', drafting: 'info', queued: 'neutral',
}
const planLabel: Record<string, string> = {
  'spec-ready': 'spec ready', drafting: 'drafting', queued: 'queued',
}
const statusToneLocal: Record<string, 'danger' | 'info' | 'good'> = {
  failing: 'danger', running: 'info', passing: 'good',
}

export const ListSlideover: FC<ListSlideoverProps> = ({
  kind, open, onClose, emails, pipelines, plans, meetings, tasks, activity,
  onPickEmail, onPick, onToggle,
}) => {
  if (!open) return <Slideover open={false} onClose={onClose} />

  if (kind === 'inbox') {
    return (
      <Slideover open onClose={onClose} subtitle="Pace · Inbox" title="All threads" width={560}>
        <div className="so-section">
          {emails.map((em) => (
            <button key={em.id} className="so-email-row" type="button" onClick={() => onPickEmail(em.id)}>
              <span className="email__avatar">{em.avatar}</span>
              <span className="so-email-row__main">
                <span className="so-email-row__from">
                  {em.from} <span className="so-email-row__sub">— {em.subject}</span>
                </span>
                <span className="so-email-row__prev">{em.preview}</span>
              </span>
              <span className="so-email-row__r">
                <span className="email__time">{em.received}</span>
                {em.draft && !em.handled ? (
                  <span className="ai-chip ai-chip--small"><IconSparkle size={10} />draft</span>
                ) : null}
                {em.handled ? (
                  <span className="ai-chip ai-chip--ok"><IconCheck size={10} />sent</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </Slideover>
    )
  }

  if (kind === 'tasks') {
    return (
      <Slideover open onClose={onClose} subtitle="Pace · Tasks" title="All tasks">
        <div className="so-section">
          {tasks.map((t) => (
            <label key={t.id} className={`task task--big ${t.done ? 'task--done' : ''}`}>
              <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
              <span className="task__box"><IconCheck size={10} /></span>
              <span className="task__main">
                <span className="task__text">{t.text}</span>
                <span className="task__meta">
                  <span className="task__source">{t.source}</span>
                  <span className="task__sep">·</span>
                  <span className={`task__due task__due--${t.due === 'today' ? 'today' : 'later'}`}>{t.due}</span>
                  <span className="task__sep">·</span>
                  <span className="task__persona">{t.persona}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </Slideover>
    )
  }

  if (kind === 'pipelines') {
    return (
      <Slideover open onClose={onClose} subtitle="Pace · CI/CD" title="All pipelines">
        <div className="so-section">
          {pipelines.map((p) => (
            <button key={p.id} className={`pipe pipe--${p.status}`} type="button" onClick={() => onPick(p.id)}>
              <span className={`pipe__status pipe__status--${p.status}`}>
                {p.status === 'running' ? <span className="spin" /> : null}
              </span>
              <span className="pipe__main">
                <span className="pipe__repo">
                  <span className="pipe__branch">{p.branch}</span>
                </span>
                <span className="pipe__msg">{p.message}</span>
              </span>
              <span className="pipe__right">
                <PaceBadge tone={statusToneLocal[p.status]} dot>
                  {p.status === 'failing' ? `${p.stage} failed` : p.status === 'running' ? `${p.stage}…` : 'deployed'}
                </PaceBadge>
                <span className="pipe__commit">{p.commit}</span>
              </span>
            </button>
          ))}
        </div>
      </Slideover>
    )
  }

  if (kind === 'plans') {
    return (
      <Slideover open onClose={onClose} subtitle="Pace · Plans" title="All business plans">
        <div className="so-section">
          {plans.map((pl) => (
            <button key={pl.id} className="plan" type="button" onClick={() => onPick(pl.id)}>
              <span className="plan__head">
                <span className="plan__title">{pl.title}</span>
                <PaceBadge tone={planTone[pl.status]} dot>{planLabel[pl.status]}</PaceBadge>
              </span>
              <span className="plan__summary">{pl.summary}</span>
              <span className="plan__meta">
                <span className="plan__from">from {pl.from}</span>
                {pl.spec.length ? <span className="plan__count">{pl.spec.length} items spec'd</span> : null}
              </span>
            </button>
          ))}
        </div>
      </Slideover>
    )
  }

  if (kind === 'meetings') {
    return (
      <Slideover open onClose={onClose} subtitle="Pace · Calendar" title="Today's meetings">
        <div className="so-section">
          {meetings.map((m) => (
            <button key={m.id} className={`meeting meeting--big meeting--${m.status}`} type="button" onClick={() => onPick(m.id)}>
              <span className="meeting__when">
                <IconClock size={11} /> {m.when}
                {m.status === 'live' ? <span className="meeting__live"><i /> LIVE</span> : null}
              </span>
              <span className="meeting__title">{m.title}</span>
              <span className="meeting__summary">{m.summary}</span>
            </button>
          ))}
        </div>
      </Slideover>
    )
  }

  if (kind === 'activity') {
    return (
      <Slideover open onClose={onClose} subtitle="Pace · Activity" title="Today's actions">
        <div className="so-section">
          {activity.map((a) => {
            const I = activityIcon[a.kind] || IconSparkle
            return (
              <div key={a.id} className={`act act--big ${a.awaiting ? 'act--awaiting' : ''}`}>
                <span className="act__time">{a.when}</span>
                <span className="act__icon"><I size={12} /></span>
                <span className="act__text">{a.text}</span>
                {a.awaiting ? <span className="act__pill">awaiting</span> : null}
              </div>
            )
          })}
        </div>
      </Slideover>
    )
  }

  return null
}
