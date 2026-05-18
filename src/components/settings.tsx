import { useState, type FC, type ReactNode } from 'react'
import {
  IconUser, IconBolt, IconSparkle, IconActivity, IconAlert, IconCheck,
  IconClock, IconPlan, IconChevron,
} from './icons'
import type { Tone } from './types'

// ── Service catalog ────────────────────────────────────────────────────────
interface Service {
  id: string
  name: string
  kind: string
  account: string | null
  scopes: string[]
  status: 'connected' | 'available'
  activity: string | null
  color: string
  mono: string
}

const SERVICES: Service[] = [
  { id: 'gmail',     name: 'Gmail',           kind: 'email',    account: 'you@northwind.io',       scopes: ['Read & draft messages', 'Send on your behalf'],         status: 'connected', activity: 'Drafted 6 replies today',            color: '#ea4335', mono: 'GM' },
  { id: 'outlook',   name: 'Outlook',         kind: 'email',    account: null,                      scopes: ['Read & draft messages', 'Send on your behalf'],         status: 'available', activity: null,                                  color: '#0078d4', mono: 'OL' },
  { id: 'teams',     name: 'Microsoft Teams', kind: 'chat',     account: 'you@northwind.io',        scopes: ['Read mentions & DMs', 'Post in channels you allow'],    status: 'connected', activity: 'Extracted 3 tasks from #payments',   color: '#a78bfa', mono: 'MT' },
  { id: 'slack',     name: 'Slack',           kind: 'chat',     account: null,                      scopes: ['Read mentions & DMs', 'Post in channels you allow'],    status: 'available', activity: null,                                  color: '#e01e5a', mono: 'SL' },
  { id: 'github',    name: 'GitHub',          kind: 'code',     account: 'you · 4 repos watched',   scopes: ['Read PRs & checks', 'Comment with suggestions'],        status: 'connected', activity: 'Watching payments-service, api, web', color: '#f5f5f5', mono: 'GH' },
  { id: 'gitlab',    name: 'GitLab',          kind: 'code',     account: null,                      scopes: ['Read MRs & pipelines', 'Comment with suggestions'],     status: 'available', activity: null,                                  color: '#fc6d26', mono: 'GL' },
  { id: 'jira',      name: 'Jira',            kind: 'pm',       account: 'NWND workspace',          scopes: ['Read & create tickets', 'Update status'],               status: 'connected', activity: 'Promoting plans to tickets',          color: '#2684ff', mono: 'JR' },
  { id: 'linear',    name: 'Linear',          kind: 'pm',       account: null,                      scopes: ['Read & create issues', 'Update status'],                status: 'available', activity: null,                                  color: '#5e6ad2', mono: 'LN' },
  { id: 'gcal',      name: 'Google Calendar', kind: 'calendar', account: 'you@northwind.io',        scopes: ['Read events', 'Join meetings & take notes'],            status: 'connected', activity: '4 meetings today',                    color: '#4285f4', mono: 'GC' },
  { id: 'notion',    name: 'Notion',          kind: 'docs',     account: 'Northwind workspace',     scopes: ['Read pages', 'Export specs to selected pages'],         status: 'connected', activity: 'Exporting specs to Eng/Specs',        color: '#f5f5f5', mono: 'NO' },
  { id: 'pagerduty', name: 'PagerDuty',       kind: 'ops',      account: null,                      scopes: ['Read incidents', 'Suggest fixes from runbooks'],       status: 'available', activity: null,                                  color: '#06ac38', mono: 'PD' },
  { id: 'figma',     name: 'Figma',           kind: 'docs',     account: null,                      scopes: ['Read shared files', 'Attach screens to specs'],        status: 'available', activity: null,                                  color: '#f24e1e', mono: 'FG' },
]

const KIND_LABEL: Record<string, string> = {
  email: 'Email', chat: 'Chat', code: 'Code', pm: 'Project mgmt',
  calendar: 'Calendar', docs: 'Docs', ops: 'Ops',
}

// ── Reusable rows ──────────────────────────────────────────────────────────
const SetRow: FC<{ label: string; hint?: string; children?: ReactNode }> = ({ label, hint, children }) => (
  <div className="set-row">
    <div className="set-row__l">
      <div className="set-row__label">{label}</div>
      {hint ? <div className="set-row__hint">{hint}</div> : null}
    </div>
    <div className="set-row__r">{children}</div>
  </div>
)

const Toggle: FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
  <button className={`tgl ${on ? 'tgl--on' : ''}`} type="button" onClick={() => onChange(!on)} aria-pressed={on}>
    <span className="tgl__knob" />
  </button>
)

const Slider: FC<{
  value: number; min?: number; max?: number; step?: number; unit?: string
  onChange: (v: number) => void
}> = ({ value, min = 0, max = 100, step = 1, unit = '%', onChange }) => (
  <div className="sld">
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))} />
    <span className="sld__val">{value}{unit}</span>
  </div>
)

interface SegOption { value: string; label: string }
const Seg: FC<{ value: string; options: (string | SegOption)[]; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <div className="seg">
    {options.map((o) => {
      const v = typeof o === 'object' ? o.value : o
      const l = typeof o === 'object' ? o.label : o
      return (
        <button key={v} type="button" className={`seg__btn ${v === value ? 'is-on' : ''}`} onClick={() => onChange(v)}>
          {l}
        </button>
      )
    })}
  </div>
)

// ── Profile ────────────────────────────────────────────────────────────────
const ProfileSection: FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <section className="set-section">
    <h2 className="set-h2">Profile</h2>
    <div className="set-card">
      <div className="prof">
        <div className="prof__avatar">YO</div>
        <div className="prof__info">
          <div className="prof__name">Yousef Othman</div>
          <div className="prof__email">you@northwind.io · Senior PM / Eng lead</div>
          <div className="prof__org">Northwind · 14 teammates use Pace</div>
        </div>
        <button className="btn btn--ghost" type="button">Edit photo</button>
      </div>
    </div>
    <div className="set-card">
      <SetRow label="Display name" hint="How teammates see you in Pace-authored notes & replies.">
        <input className="inp" defaultValue="Yousef Othman" />
      </SetRow>
      <SetRow label="Working hours" hint="Pace stays quiet outside these hours unless something is on fire.">
        <div className="hours">
          <input className="inp inp--time" defaultValue="08:30" />
          <span className="set-row__hint">to</span>
          <input className="inp inp--time" defaultValue="18:00" />
          <span className="set-row__hint">· PT</span>
        </div>
      </SetRow>
      <SetRow label="Default persona" hint="Drives which cards lead on your dashboard.">
        <Seg value="both" options={[{value:'eng',label:'Engineer'},{value:'pm',label:'Manager'},{value:'both',label:'Both'}]} onChange={() => {}} />
      </SetRow>
    </div>
    <div className="set-card set-card--quiet">
      <SetRow label="Sign out of this device" hint="You'll need to re-authenticate on next visit. Connections stay linked.">
        <button className="btn" type="button" onClick={onLogout}>Sign out</button>
      </SetRow>
    </div>
  </section>
)

// ── Connections ────────────────────────────────────────────────────────────
const ConnectionsSection: FC<{ services: Service[]; onToggleService: (id: string) => void }> = ({ services, onToggleService }) => {
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all')
  const counts = {
    all: services.length,
    connected: services.filter((s) => s.status === 'connected').length,
    available: services.filter((s) => s.status === 'available').length,
  }
  const visible = services.filter((s) => filter === 'all' || s.status === filter)
  return (
    <section className="set-section">
      <div className="set-section__head">
        <h2 className="set-h2">Connections</h2>
        <div className="seg seg--small">
          {([['all', `All (${counts.all})`], ['connected', `Connected (${counts.connected})`], ['available', `Available (${counts.available})`]] as const).map(([v, l]) => (
            <button key={v} type="button" className={`seg__btn ${filter === v ? 'is-on' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      <p className="set-section__intro">
        Pace reads only what you connect, and only the scopes you grant. You can revoke any connection at any time —
        existing drafts will still send, but new activity from that source pauses.
      </p>
      <div className="svc-grid">
        {visible.map((s) => (
          <article key={s.id} className={`svc svc--${s.status}`}>
            <header className="svc__hd">
              <div className="svc__logo" style={{ background: `linear-gradient(135deg, ${s.color}, color-mix(in oklab, ${s.color} 60%, #000))` }}>
                {s.mono}
              </div>
              <div className="svc__title">
                <div className="svc__name">{s.name}</div>
                <div className="svc__kind">{KIND_LABEL[s.kind]}</div>
              </div>
              <div className="svc__status">
                {s.status === 'connected'
                  ? <span className="pace-badge pace-badge--good"><i className="pace-badge__dot" />connected</span>
                  : <span className="pace-badge">not connected</span>}
              </div>
            </header>
            <div className="svc__body">
              {s.account ? <div className="svc__account">{s.account}</div> : null}
              {s.activity ? <div className="svc__activity"><IconSparkle size={11} /> {s.activity}</div> : null}
              <ul className="svc__scopes">
                {s.scopes.map((sc, i) => <li key={i}>{sc}</li>)}
              </ul>
            </div>
            <footer className="svc__ft">
              {s.status === 'connected' ? (
                <>
                  <button className="btn btn--ghost btn--quiet" type="button" onClick={() => onToggleService(s.id)}>Disconnect</button>
                  <button className="btn btn--ghost" type="button">Manage scopes</button>
                </>
              ) : (
                <button className="btn btn--primary" type="button" onClick={() => onToggleService(s.id)}>Connect</button>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}

// ── AI behavior ────────────────────────────────────────────────────────────
const AISection: FC<{ tone: Tone; onTone: (v: Tone) => void }> = ({ tone, onTone }) => {
  const [autoSend, setAutoSend] = useState(false)
  const [autoSendT, setAutoSendT] = useState(95)
  const [autoFix, setAutoFix] = useState(false)
  const [autoFixT, setAutoFixT] = useState(90)
  const [autoNotes, setAutoNotes] = useState(true)
  const [extractTasks, setExtractTasks] = useState(true)
  const [signOff, setSignOff] = useState('— Yousef')
  return (
    <section className="set-section">
      <h2 className="set-h2">AI behavior</h2>
      <div className="set-card">
        <SetRow label="Tone of voice" hint="Affects how Pace addresses you and proposes drafts. You always have the final call.">
          <Seg value={tone} options={[{value:'quiet',label:'Quiet'},{value:'propose',label:'Propose'},{value:'confident',label:'Confident'},{value:'proactive',label:'Proactive'}]} onChange={(v) => onTone(v as Tone)} />
        </SetRow>
        <SetRow label="Default sign-off" hint="Appended to replies Pace drafts on your behalf.">
          <input className="inp" value={signOff} onChange={(e) => setSignOff(e.target.value)} />
        </SetRow>
      </div>
      <div className="set-card">
        <SetRow label="Auto-send replies above confidence threshold" hint="When off (default), Pace always asks. When on, low-stakes replies above the threshold go straight out.">
          <Toggle on={autoSend} onChange={setAutoSend} />
        </SetRow>
        {autoSend ? (
          <SetRow label="Confidence threshold" hint="Pace only auto-sends drafts above this confidence.">
            <Slider value={autoSendT} min={70} max={100} step={1} onChange={setAutoSendT} />
          </SetRow>
        ) : null}
        <SetRow label="Auto-apply CI fixes above threshold" hint="Push the suggested fix as a commit on a `pace/auto` branch and open a PR — never to main.">
          <Toggle on={autoFix} onChange={setAutoFix} />
        </SetRow>
        {autoFix ? (
          <SetRow label="CI fix confidence threshold">
            <Slider value={autoFixT} min={70} max={100} step={1} onChange={setAutoFixT} />
          </SetRow>
        ) : null}
        <SetRow label="Take notes in meetings I'm in" hint="Joins as a silent participant. Notes are private until you share them.">
          <Toggle on={autoNotes} onChange={setAutoNotes} />
        </SetRow>
        <SetRow label="Extract tasks from chats & emails" hint="Pulls action items from Teams, Slack, and email threads.">
          <Toggle on={extractTasks} onChange={setExtractTasks} />
        </SetRow>
      </div>
      <div className="set-card">
        <SetRow label="Never act on these threads" hint="Comma-separated keywords. Subjects or channels matching these are read-only for Pace.">
          <input className="inp inp--wide" defaultValue="legal, comp, board, eng-leads-private" />
        </SetRow>
        <SetRow label="Languages" hint="Pace will reply in the language of the original thread, falling back to these.">
          <div className="chips">
            {['English', 'Español', 'العربية', 'Deutsch'].map((l) => (
              <span key={l} className="chip chip--on">{l}</span>
            ))}
            <button className="chip chip--add" type="button">+ Add</button>
          </div>
        </SetRow>
      </div>
    </section>
  )
}

// ── Agents & Models ────────────────────────────────────────────────────────
interface Model {
  id: string; name: string; vendor: string; tier: 'fast' | 'balanced' | 'frontier' | 'local'
  ctx: string; cost: string; speed: number; quality: number; note?: string
}
interface Agent {
  id: string; name: string; role: string; tools: string[]
  def: string; status: 'idle' | 'busy'; invokes: number; latency: string
  current?: string; hist24: number[]
}

const MODELS: Model[] = [
  { id: 'pace-router', name: 'Pace Router',       vendor: 'Pace',      tier: 'fast',     ctx: '32K',  cost: '$0.05/Mtok', speed: 95, quality: 70, note: 'Tuned for routing & triage. Always free.' },
  { id: 'haiku-4-5',   name: 'Claude Haiku 4.5',  vendor: 'Anthropic', tier: 'fast',     ctx: '200K', cost: '$1 / $5',    speed: 92, quality: 81, note: 'Fast & cheap. Great for bulk extraction.' },
  { id: 'sonnet-4-5',  name: 'Claude Sonnet 4.5', vendor: 'Anthropic', tier: 'balanced', ctx: '200K', cost: '$3 / $15',   speed: 76, quality: 92, note: 'Default. Strong on writing & reasoning.' },
  { id: 'opus-4-5',    name: 'Claude Opus 4.5',   vendor: 'Anthropic', tier: 'frontier', ctx: '200K', cost: '$15 / $75',  speed: 55, quality: 98, note: 'Best for hard reasoning + complex code.' },
  { id: 'gpt-5-mini',  name: 'GPT-5 mini',        vendor: 'OpenAI',    tier: 'fast',     ctx: '128K', cost: '$0.50 / $2', speed: 90, quality: 83 },
  { id: 'gpt-5',       name: 'GPT-5',             vendor: 'OpenAI',    tier: 'frontier', ctx: '256K', cost: '$10 / $30',  speed: 65, quality: 95, note: 'Strong general purpose.' },
  { id: 'gemini-2-5',  name: 'Gemini 2.5 Pro',    vendor: 'Google',    tier: 'balanced', ctx: '1M',   cost: '$2 / $10',   speed: 78, quality: 89, note: 'Massive context — good for long threads.' },
  { id: 'llama-3-70b', name: 'Llama 3.3 70B',     vendor: 'Meta',      tier: 'local',    ctx: '128K', cost: 'self-hosted', speed: 70, quality: 84, note: 'Runs in your VPC. Use for sensitive data.' },
]

const AGENTS: Agent[] = [
  { id: 'router',  name: 'Orchestrator',  role: 'Routes incoming signals to the right specialist',          tools: ['classify','route','escalate'],               def: 'pace-router', status: 'idle', invokes: 412, latency: '120ms',  hist24: [3,4,2,6,5,7,8,9,11,14,12,10,15,18,16,14,17,19,15,12,9,7,5,4] },
  { id: 'triage',  name: 'Inbox Triage',  role: 'Reads new email + Teams; decides what needs you',          tools: ['email.read','teams.read','priority-score'],  def: 'haiku-4-5',   status: 'idle', invokes: 87,  latency: '380ms',  hist24: [1,2,1,3,2,4,5,5,8,9,7,6,8,10,7,5,4,3,2,1,1,0,0,0] },
  { id: 'drafter', name: 'Reply Drafter', role: 'Composes email & chat replies in your voice',              tools: ['email.draft','calendar','contacts','threads'], def: 'sonnet-4-5',  status: 'busy', invokes: 23,  latency: '1.8s',   current: 'Drafting reply to Priya Shah', hist24: [0,0,1,0,1,2,1,2,3,2,1,2,3,4,3,2,1,1,0,0,0,0,0,0] },
  { id: 'spec',    name: 'Spec Writer',   role: 'Turns business plans into shippable specs',                tools: ['notion.write','jira.create','figma.read'],    def: 'opus-4-5',    status: 'idle', invokes: 4,   latency: '12s',    hist24: [0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0] },
  { id: 'code',    name: 'Code Analyst',  role: 'Reads CI failures, diffs, history; proposes fixes',        tools: ['github.read','github.comment','repo.search'], def: 'opus-4-5',    status: 'idle', invokes: 11,  latency: '6.2s',   hist24: [0,0,0,0,0,0,1,1,2,1,2,1,1,1,1,0,1,0,0,0,0,0,0,0] },
  { id: 'notes',   name: 'Meeting Notes', role: 'Joins meetings, transcribes, summarizes, extracts actions', tools: ['calendar','transcribe','speaker.id'],         def: 'sonnet-4-5',  status: 'busy', invokes: 3,   latency: 'live',   current: 'Listening to "Design review"', hist24: [0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0] },
  { id: 'extract', name: 'Task Extractor',role: 'Pulls actions from text; dedupes against your list',       tools: ['tasks.write','dedupe'],                       def: 'haiku-4-5',   status: 'idle', invokes: 142, latency: '210ms',  hist24: [2,3,2,4,3,5,6,8,12,11,9,8,10,12,11,9,8,7,5,3,2,1,1,1] },
]

const tierLabel: Record<string, string> = { fast: 'Fast', balanced: 'Balanced', frontier: 'Frontier', local: 'Local' }

const ModelPicker: FC<{ value: string; onChange: (v: string) => void; models: Model[] }> = ({ value, onChange, models }) => {
  const [open, setOpen] = useState(false)
  const m = models.find((x) => x.id === value) || models[0]
  return (
    <div className={`mp ${open ? 'mp--open' : ''}`}>
      <button type="button" className="mp__btn" onClick={() => setOpen(!open)}>
        <span className={`mp__dot mp__dot--${m.tier}`} />
        <span className="mp__name">{m.name}</span>
        <span className="mp__vendor">{m.vendor}</span>
        <IconChevron size={11} />
      </button>
      {open ? (
        <div className="mp__menu">
          {models.map((opt) => (
            <button key={opt.id} type="button"
              className={`mp__opt ${opt.id === value ? 'is-on' : ''}`}
              onClick={() => { onChange(opt.id); setOpen(false) }}>
              <span className={`mp__dot mp__dot--${opt.tier}`} />
              <span className="mp__opt-main">
                <span className="mp__opt-row">
                  <span className="mp__opt-name">{opt.name}</span>
                  <span className={`mp__tier mp__tier--${opt.tier}`}>{tierLabel[opt.tier]}</span>
                </span>
                <span className="mp__opt-meta">
                  <span>{opt.vendor}</span><span>·</span>
                  <span>{opt.ctx} ctx</span><span>·</span>
                  <span>{opt.cost}</span>
                </span>
                {opt.note ? <span className="mp__opt-note">{opt.note}</span> : null}
                <span className="mp__bars">
                  <span className="mp__bars-row"><span className="mp__bars-lbl">speed</span><span className="mp__bars-bar"><span style={{width:`${opt.speed}%`}}/></span></span>
                  <span className="mp__bars-row"><span className="mp__bars-lbl">quality</span><span className="mp__bars-bar mp__bars-bar--q"><span style={{width:`${opt.quality}%`}}/></span></span>
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const Sparkline: FC<{ data: number[]; busy: boolean }> = ({ data, busy }) => {
  const w = 96, h = 22, max = Math.max(...data, 1)
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 3) - 1).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} className={`spark ${busy ? 'spark--busy' : ''}`}>
      <polyline points={pts} fill="none" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const OrchestratorDiagram: FC<{ agents: Agent[]; assignments: Record<string, string> }> = ({ agents, assignments }) => {
  const router = agents.find((a) => a.id === 'router')
  const others = agents.filter((a) => a.id !== 'router')
  const r = 110, cx = 220, cy = 120
  return (
    <div className="orch">
      <div className="orch__hd">
        <div>
          <div className="orch__title"><IconSparkle size={12} /> Agent graph</div>
          <div className="orch__sub">How Pace dispatches your work to specialists in real time</div>
        </div>
        <div className="orch__legend">
          <span><i className="orch__leg orch__leg--busy" /> busy</span>
          <span><i className="orch__leg orch__leg--idle" /> idle</span>
        </div>
      </div>
      <svg viewBox="0 0 440 240" className="orch__svg">
        {others.map((a, i) => {
          const angle = (-Math.PI / 2) + (i / others.length) * (Math.PI * 2)
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          const busy = a.status === 'busy'
          return (
            <g key={a.id}>
              <line x1={cx} y1={cy} x2={x} y2={y}
                className={`orch__line ${busy ? 'orch__line--busy' : 'orch__line--idle'}`}
                strokeWidth={busy ? 1.5 : 1} strokeDasharray={busy ? '0' : '3 3'} />
              {busy ? (
                <circle r="2.5" className="orch__particle">
                  <animateMotion dur="2.2s" repeatCount="indefinite" path={`M${cx},${cy} L${x},${y}`} />
                </circle>
              ) : null}
              <g transform={`translate(${x},${y})`}>
                <circle r="18" className={`orch__node ${busy ? 'orch__node--busy' : ''}`} strokeWidth="1" />
                <text textAnchor="middle" y="3" className="orch__node-label">{a.id.slice(0, 5)}</text>
              </g>
              <text x={x} y={y + 32} textAnchor="middle" className="orch__node-name">{a.name}</text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r="30" className="orch__router" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="38" className="orch__router-ring" strokeWidth="0.5" />
        <text x={cx} y={cy - 2} textAnchor="middle" className="orch__router-title">Orchestrator</text>
        <text x={cx} y={cy + 11} textAnchor="middle" className="orch__router-model">
          {(MODELS.find((m) => m.id === assignments[router?.id ?? '']) || {}).name || ''}
        </text>
      </svg>
    </div>
  )
}

const AgentsSection: FC = () => {
  const [assignments, setAssignments] = useState<Record<string, string>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, a.def]))
  )
  const [autonomy, setAutonomy] = useState(60)
  const [fallback, setFallback] = useState('haiku-4-5')
  const [maxPar, setMaxPar] = useState(4)
  const [explain, setExplain] = useState(true)
  const [private_, setPrivate] = useState(false)

  const setModel = (agentId: string, modelId: string) => setAssignments({ ...assignments, [agentId]: modelId })

  const applyRecommended = () => setAssignments({ router: 'pace-router', triage: 'haiku-4-5', drafter: 'sonnet-4-5', spec: 'opus-4-5', code: 'opus-4-5', notes: 'sonnet-4-5', extract: 'haiku-4-5' })
  const applyCheap = () => setAssignments({ router: 'pace-router', triage: 'haiku-4-5', drafter: 'haiku-4-5', spec: 'sonnet-4-5', code: 'sonnet-4-5', notes: 'haiku-4-5', extract: 'haiku-4-5' })
  const applyFrontier = () => setAssignments({ router: 'sonnet-4-5', triage: 'sonnet-4-5', drafter: 'opus-4-5', spec: 'opus-4-5', code: 'opus-4-5', notes: 'opus-4-5', extract: 'sonnet-4-5' })
  const applyLocal = () => setAssignments({ router: 'pace-router', triage: 'llama-3-70b', drafter: 'llama-3-70b', spec: 'llama-3-70b', code: 'llama-3-70b', notes: 'llama-3-70b', extract: 'llama-3-70b' })

  const tierFactor: Record<string, number> = { fast: 1, balanced: 4, frontier: 14, local: 0.4 }
  const estimate = AGENTS.reduce((acc, a) => {
    const m = MODELS.find((x) => x.id === assignments[a.id])
    if (!m) return acc
    return acc + (a.invokes * tierFactor[m.tier]) / 1000
  }, 0)

  return (
    <section className="set-section">
      <div className="set-section__head">
        <h2 className="set-h2">Agents &amp; Models</h2>
        <div className="seg seg--small">
          <button className="seg__btn" type="button" onClick={applyCheap}>Cheap</button>
          <button className="seg__btn" type="button" onClick={applyRecommended}>Recommended</button>
          <button className="seg__btn" type="button" onClick={applyFrontier}>Frontier</button>
          <button className="seg__btn" type="button" onClick={applyLocal}>All local</button>
        </div>
      </div>
      <p className="set-section__intro">
        Pace runs as a team of specialist agents that hand work off to each other.
        Pick a model per agent — fast &amp; cheap for triage, frontier for code reasoning, local for sensitive data.
        The Orchestrator routes incoming signals and decides which specialist to wake.
      </p>

      <OrchestratorDiagram agents={AGENTS} assignments={assignments} />

      <div className="agents-stats">
        <div className="agents-stat"><div className="agents-stat__lbl">Estimated monthly cost</div><div className="agents-stat__val">${estimate.toFixed(2)} <span className="agents-stat__sub">/ at today's rate</span></div></div>
        <div className="agents-stat"><div className="agents-stat__lbl">Invocations today</div><div className="agents-stat__val">682</div></div>
        <div className="agents-stat"><div className="agents-stat__lbl">Avg latency (p50)</div><div className="agents-stat__val mono">740ms</div></div>
        <div className="agents-stat"><div className="agents-stat__lbl">Active agents</div><div className="agents-stat__val">{AGENTS.filter((a) => a.status === 'busy').length} / {AGENTS.length}</div></div>
      </div>

      <div className="agents-list">
        {AGENTS.map((a) => (
          <article key={a.id} className={`agent agent--${a.status}`}>
            <div className="agent__l">
              <div className="agent__hd">
                <div className="agent__icon">
                  <span className={`agent__bot agent__bot--${a.status}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="7" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="9" cy="13" r="1.2" fill="currentColor"/>
                      <circle cx="15" cy="13" r="1.2" fill="currentColor"/>
                      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <circle cx="12" cy="3.2" r="1" fill="currentColor"/>
                    </svg>
                  </span>
                </div>
                <div className="agent__titles">
                  <div className="agent__name">
                    {a.name}
                    {a.status === 'busy' ? <span className="agent__live"><i />active</span> : null}
                  </div>
                  <div className="agent__role">{a.role}</div>
                </div>
              </div>
              {a.current ? (
                <div className="agent__current"><span className="spin spin--small" /> {a.current}</div>
              ) : null}
              <div className="agent__tools">
                {a.tools.map((t) => <span key={t} className="agent__tool">{t}</span>)}
              </div>
            </div>
            <div className="agent__r">
              <div className="agent__lbl">Model</div>
              <ModelPicker value={assignments[a.id]} onChange={(v) => setModel(a.id, v)} models={MODELS} />
              <div className="agent__stats">
                <div className="agent__stat"><span>invokes</span><b>{a.invokes}</b></div>
                <div className="agent__stat"><span>p50</span><b className="mono">{a.latency}</b></div>
                <div className="agent__stat agent__stat--spark"><span>24h</span><Sparkline data={a.hist24} busy={a.status === 'busy'} /></div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="set-card">
        <SetRow label="Autonomy" hint="How far Pace can act before pausing for your approval. Lower = always ask; higher = act when confident.">
          <div className="autonomy">
            <Slider value={autonomy} min={0} max={100} step={5} unit="" onChange={setAutonomy} />
            <span className="autonomy__lbl">
              {autonomy < 25 ? 'Always ask' : autonomy < 60 ? 'Propose, you decide' : autonomy < 85 ? 'Act on low-stakes' : 'Act decisively'}
            </span>
          </div>
        </SetRow>
        <SetRow label="Fallback model" hint="If a primary model is rate-limited or down, agents fall back here.">
          <ModelPicker value={fallback} onChange={setFallback} models={MODELS} />
        </SetRow>
        <SetRow label="Max parallel agents" hint="Cap on how many specialists can run at once. Lower = more deterministic; higher = faster bursts.">
          <Seg value={String(maxPar)} options={['1','2','4','8'].map((v) => ({ value: v, label: v }))} onChange={(v) => setMaxPar(Number(v))} />
        </SetRow>
        <SetRow label="Explain agent decisions" hint="Pace shows which agent decided what, and why, in the activity feed and audit log.">
          <Toggle on={explain} onChange={setExplain} />
        </SetRow>
        <SetRow label="Private mode (route everything to local)" hint="Bypasses all hosted models. Slower and lower quality, but nothing leaves your VPC.">
          <Toggle on={private_} onChange={setPrivate} />
        </SetRow>
      </div>
    </section>
  )
}

// ── Notifications ──────────────────────────────────────────────────────────
const NotifSection: FC = () => {
  const channels = [
    { id: 'awaiting', label: 'Items awaiting your approval', defaults: { browser: true, teams: true, email: false, mobile: true } },
    { id: 'ci',       label: 'CI failures on watched repos',  defaults: { browser: true, teams: true, email: false, mobile: true } },
    { id: 'mention',  label: "You're @mentioned",             defaults: { browser: true, teams: true, email: true,  mobile: true } },
    { id: 'digest',   label: 'Daily digest at 8:30 AM',       defaults: { browser: false, teams: false, email: true, mobile: false } },
    { id: 'fyi',      label: 'Pace took an autonomous action', defaults: { browser: true, teams: false, email: false, mobile: false } },
  ]
  type NotifState = Record<string, Record<string, boolean>>
  const [state, setState] = useState<NotifState>(Object.fromEntries(channels.map((c) => [c.id, c.defaults])))
  const toggle = (id: string, key: string) => setState({ ...state, [id]: { ...state[id], [key]: !state[id][key] } })
  return (
    <section className="set-section">
      <h2 className="set-h2">Notifications</h2>
      <div className="set-card set-card--table">
        <div className="notif-grid notif-grid--head">
          <div></div><div>Browser</div><div>Teams DM</div><div>Email</div><div>Mobile</div>
        </div>
        {channels.map((c) => (
          <div key={c.id} className="notif-grid">
            <div className="notif-grid__label">{c.label}</div>
            {['browser','teams','email','mobile'].map((k) => (
              <div key={k}><Toggle on={state[c.id][k]} onChange={() => toggle(c.id, k)} /></div>
            ))}
          </div>
        ))}
      </div>
      <div className="set-card">
        <SetRow label="Quiet hours" hint="No notifications during these hours, except items marked urgent.">
          <div className="hours">
            <input className="inp inp--time" defaultValue="20:00" />
            <span className="set-row__hint">to</span>
            <input className="inp inp--time" defaultValue="08:00" />
          </div>
        </SetRow>
      </div>
    </section>
  )
}

// ── Shortcuts ──────────────────────────────────────────────────────────────
const ShortcutsSection: FC = () => {
  const groups = [
    { name: 'Global', items: [
      { keys: ['⌘','K'], action: 'Ask Pace / search anything' },
      { keys: ['G','I'], action: 'Go to Inbox' },
      { keys: ['G','P'], action: 'Go to Pipelines' },
      { keys: ['G','T'], action: 'Go to Tasks' },
      { keys: ['G','S'], action: 'Go to Settings' },
      { keys: ['?'],     action: 'Show all shortcuts' },
    ]},
    { name: 'Drafts', items: [
      { keys: ['⌘','↵'], action: 'Approve & send focused draft' },
      { keys: ['⌘','E'], action: 'Edit draft' },
      { keys: ['⌘','⌫'], action: 'Discard draft' },
    ]},
    { name: 'Pipelines', items: [
      { keys: ['F'], action: 'Apply suggested fix' },
      { keys: ['R'], action: 'Re-run failing job' },
      { keys: ['O'], action: 'Open in IDE' },
    ]},
  ]
  return (
    <section className="set-section">
      <h2 className="set-h2">Keyboard shortcuts</h2>
      {groups.map((g) => (
        <div key={g.name} className="set-card">
          <div className="kbd-group">
            <div className="kbd-group__name">{g.name}</div>
            <ul className="kbd-list">
              {g.items.map((it, i) => (
                <li key={i}>
                  <span className="kbd-list__action">{it.action}</span>
                  <span className="kbd-list__keys">
                    {it.keys.map((k, j) => <kbd key={j}>{k}</kbd>)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </section>
  )
}

// ── Privacy ────────────────────────────────────────────────────────────────
const PrivacySection: FC = () => {
  const [retention, setRetention] = useState('90')
  const [share, setShare] = useState('me')
  const [train, setTrain] = useState(false)
  const audit = [
    { when: 'today 11:14',     who: 'Pace', what: 'Drafted reply to Priya Shah',        status: 'pending' },
    { when: 'today 11:02',     who: 'Pace', what: 'Promoted "Self-serve trial" → spec', status: 'auto' },
    { when: 'today 10:48',     who: 'Pace', what: 'Suggested fix on payments-service',  status: 'pending' },
    { when: 'today 09:55',     who: 'Pace', what: 'Extracted 3 tasks from Teams thread',status: 'auto' },
    { when: 'yesterday 17:21', who: 'You',  what: 'Disconnected: Linear',               status: 'user' },
    { when: 'yesterday 09:02', who: 'You',  what: 'Connected: GitHub',                  status: 'user' },
  ]
  return (
    <section className="set-section">
      <h2 className="set-h2">Privacy &amp; data</h2>
      <div className="set-card">
        <SetRow label="Retain Pace's drafts & notes" hint="After this period, drafts you never approved are permanently deleted.">
          <Seg value={retention} options={[{value:'30',label:'30 days'},{value:'90',label:'90 days'},{value:'365',label:'1 year'},{value:'forever',label:'Forever'}]} onChange={setRetention} />
        </SetRow>
        <SetRow label="Who can see Pace's drafts before I send them" hint="By default, only you. Share with teammates to let them comment on drafts.">
          <Seg value={share} options={[{value:'me',label:'Just me'},{value:'team',label:'My team'},{value:'org',label:'All of Northwind'}]} onChange={setShare} />
        </SetRow>
        <SetRow label="Use my workspace to improve Pace's models" hint="Off by default. When on, anonymized samples may be reviewed by Pace researchers.">
          <Toggle on={train} onChange={setTrain} />
        </SetRow>
      </div>
      <div className="set-card">
        <div className="set-card__head">
          <div className="set-card__title">Activity log</div>
          <button className="btn btn--ghost" type="button">Export CSV</button>
        </div>
        <ul className="audit">
          {audit.map((a, i) => (
            <li key={i}>
              <span className="audit__when">{a.when}</span>
              <span className={`audit__who audit__who--${a.who === 'Pace' ? 'pace' : 'user'}`}>{a.who}</span>
              <span className="audit__what">{a.what}</span>
              <span className={`audit__status audit__status--${a.status}`}>{a.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="set-card">
        <SetRow label="Download a copy of my data" hint="Everything Pace has stored on your behalf, as JSON.">
          <button className="btn" type="button">Request export</button>
        </SetRow>
      </div>
    </section>
  )
}

// ── Billing ────────────────────────────────────────────────────────────────
const BillingSection: FC = () => (
  <section className="set-section">
    <h2 className="set-h2">Plan &amp; billing</h2>
    <div className="set-card plan-card">
      <div className="plan-card__l">
        <div className="plan-card__name">Team · <span className="plan-card__seats">14 seats</span></div>
        <div className="plan-card__price"><span>$24</span> / seat / month</div>
        <div className="plan-card__nxt">Next invoice: <span className="mono">May 28, 2026 · $336.00</span></div>
      </div>
      <div className="plan-card__r">
        <button className="btn btn--ghost" type="button">Manage seats</button>
        <button className="btn" type="button">Change plan</button>
      </div>
    </div>
    <div className="set-card">
      <SetRow label="Billing email"><input className="inp" defaultValue="finance@northwind.io" /></SetRow>
      <SetRow label="Payment method" hint="Visa ending in 4242 · exp 09/27"><button className="btn btn--ghost" type="button">Update</button></SetRow>
      <SetRow label="Invoice history"><button className="btn btn--ghost" type="button">View 8 invoices</button></SetRow>
    </div>
  </section>
)

// ── Danger zone ────────────────────────────────────────────────────────────
const DangerSection: FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <section className="set-section">
    <h2 className="set-h2">Danger zone</h2>
    <div className="set-card set-card--danger">
      <SetRow label="Pause all of Pace's activity" hint="Drafts, notes, fixes — everything stops. Threads and history are kept. Resume any time.">
        <button className="btn" type="button">Pause Pace</button>
      </SetRow>
      <SetRow label="Disconnect all integrations" hint="Revokes every service in one click. You can reconnect individually later.">
        <button className="btn" type="button">Disconnect all</button>
      </SetRow>
      <SetRow label="Sign out everywhere" hint="Ends sessions on all browsers and devices.">
        <button className="btn" type="button" onClick={onLogout}>Sign out everywhere</button>
      </SetRow>
      <SetRow label="Delete my Pace data" hint="Permanently removes drafts, notes, specs, and audit log. This cannot be undone.">
        <button className="btn btn--danger" type="button">Delete data…</button>
      </SetRow>
    </div>
  </section>
)

// ── Settings shell ─────────────────────────────────────────────────────────
type SectionId = 'profile' | 'connections' | 'ai' | 'agents' | 'notif' | 'shortcuts' | 'privacy' | 'billing' | 'danger'

const SETTINGS_SECTIONS: { id: SectionId; label: string; icon: FC<{ size?: number }>; danger?: boolean }[] = [
  { id: 'profile',     label: 'Profile',         icon: IconUser },
  { id: 'connections', label: 'Connections',     icon: IconBolt },
  { id: 'ai',          label: 'AI behavior',     icon: IconSparkle },
  { id: 'agents',      label: 'Agents & Models', icon: IconActivity },
  { id: 'notif',       label: 'Notifications',   icon: IconAlert },
  { id: 'shortcuts',   label: 'Shortcuts',       icon: IconCheck },
  { id: 'privacy',     label: 'Privacy & data',  icon: IconClock },
  { id: 'billing',     label: 'Plan & billing',  icon: IconPlan },
  { id: 'danger',      label: 'Danger zone',     icon: IconAlert, danger: true },
]

interface SettingsPageProps {
  tone: Tone
  onTone: (v: Tone) => void
  onLogout: () => void
}

export const SettingsPage: FC<SettingsPageProps> = ({ tone, onTone, onLogout }) => {
  const [section, setSection] = useState<SectionId>('profile')
  const [services, setServices] = useState<Service[]>(SERVICES)
  const toggleService = (id: string) =>
    setServices(services.map((s) =>
      s.id === id
        ? { ...s, status: s.status === 'connected' ? 'available' : 'connected', account: s.status === 'connected' ? null : (s.account || 'newly connected'), activity: s.status === 'connected' ? null : s.activity }
        : s
    ) as Service[])

  const renderSection = () => {
    switch (section) {
      case 'profile':     return <ProfileSection onLogout={onLogout} />
      case 'connections': return <ConnectionsSection services={services} onToggleService={toggleService} />
      case 'ai':          return <AISection tone={tone} onTone={onTone} />
      case 'agents':      return <AgentsSection />
      case 'notif':       return <NotifSection />
      case 'shortcuts':   return <ShortcutsSection />
      case 'privacy':     return <PrivacySection />
      case 'billing':     return <BillingSection />
      case 'danger':      return <DangerSection onLogout={onLogout} />
      default:            return null
    }
  }

  return (
    <div className="settings">
      <header className="settings__top">
        <div>
          <div className="settings__crumb">Workspace</div>
          <h1 className="settings__h1">Settings</h1>
        </div>
        <div className="settings__top-r">
          <span className="src-pill"><IconUser size={10} /> you@northwind.io</span>
          <button className="btn btn--ghost" type="button" onClick={onLogout}>Sign out</button>
        </div>
      </header>
      <div className="settings__body">
        <aside className="settings__nav">
          {SETTINGS_SECTIONS.map((s) => {
            const I = s.icon
            return (
              <button key={s.id} type="button"
                className={`settings__nav-item ${section === s.id ? 'is-on' : ''} ${s.danger ? 'settings__nav-item--danger' : ''}`}
                onClick={() => setSection(s.id)}>
                <I size={14} />
                <span>{s.label}</span>
              </button>
            )
          })}
        </aside>
        <div className="settings__pane">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}

// ── Logged-out screen ──────────────────────────────────────────────────────
export const LoggedOut: FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="logout-screen">
    <div className="logout-screen__card">
      <div className="logout-screen__logo">
        <svg width="40" height="40" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="none" stroke="var(--pace-accent)" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="4" fill="var(--pace-accent)" />
          <circle cx="26" cy="10" r="1.8" fill="var(--pace-accent)" />
        </svg>
      </div>
      <h1 className="logout-screen__h1">You're signed out</h1>
      <p className="logout-screen__p">Pace paused all activity. Your drafts, notes and connections are safe.</p>
      <button className="btn btn--primary btn--lg" type="button" onClick={onLogin}>Sign back in</button>
      <div className="logout-screen__foot">you@northwind.io · Northwind workspace</div>
    </div>
  </div>
)
