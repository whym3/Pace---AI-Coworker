export interface Todo {
  text: string
  due: string
}

export interface Email {
  id: string
  from: string
  fromEmail: string
  avatar: string
  subject: string
  preview: string
  received: string
  persona: 'pm' | 'eng'
  priority: 'high' | 'med' | 'low'
  draft: string | null
  confidence: number
  todos: Todo[]
  handled?: string
}

export interface DiffLine {
  type: 'ctx' | 'add' | 'del'
  text: string
}

export interface Fix {
  title: string
  diff: DiffLine[]
  confidence: number
  reasoning: string
}

export interface Pipeline {
  id: string
  repo: string
  branch: string
  status: 'failing' | 'running' | 'passing'
  stage: string
  duration: string
  commit: string
  author: string
  message: string
  failedStep: string | null
  error: string | null
  fix: Fix | null
}

export interface SpecItem {
  kind: 'goal' | 'screen' | 'api' | 'metric'
  text: string
}

export interface Plan {
  id: string
  title: string
  from: string
  status: 'spec-ready' | 'drafting' | 'queued'
  summary: string
  spec: SpecItem[]
  open: string[]
}

export interface MeetingAction {
  who: string
  text: string
  linkedTo: string
}

export interface Meeting {
  id: string
  title: string
  when: string
  status: 'past' | 'live' | 'upcoming'
  attendees: string[]
  summary: string
  actions: MeetingAction[]
}

export interface Task {
  id: string
  text: string
  source: string
  due: string
  done: boolean
  persona: 'pm' | 'eng'
}

export type ActivityKind = 'draft' | 'spec' | 'fix' | 'notes' | 'task' | 'triage'

export interface ActivityItem {
  id: string
  when: string
  kind: ActivityKind
  text: string
  awaiting: boolean
}

export type Persona = 'eng' | 'pm' | 'both'
export type Tone = 'propose' | 'quiet' | 'confident' | 'proactive'
export type Density = 'compact' | 'balanced' | 'spacious'

export interface TweakValues {
  accent: string
  density: Density
  persona: Persona
  tone: Tone
  dark: boolean
  showInbox: boolean
  showPipelines: boolean
  showPlans: boolean
  showMeetings: boolean
  showTasks: boolean
  showActivity: boolean
}

export type PanelKind =
  | 'email'
  | 'pipeline'
  | 'plan'
  | 'meeting'
  | 'inbox'
  | 'tasks'
  | 'pipelines'
  | 'plans'
  | 'meetings'
  | 'activity'

export interface Panel {
  kind: PanelKind
  id: string | null
}
