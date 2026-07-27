export type Difficulty = 'easy' | 'medium' | 'hard'
export type TestStatus = 'draft' | 'live' | null

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

export interface User {
  id?: string
  userId?: string
  name?: string
  email?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Subject {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subject_id?: string
}

export interface SubTopic {
  id: string
  name: string
  topic_id?: string
}

export interface Test {
  id: string
  name: string
  type?: string
  subject?: string
  subject_id?: string
  topics?: string[]
  sub_topics?: string[]
  status?: TestStatus | string
  difficulty?: Difficulty | string
  correct_marks?: number
  wrong_marks?: number
  unattempt_marks?: number
  total_time?: number
  total_marks?: number
  total_questions?: number
  questions?: string[]
  created_at?: string
}

export interface CreateTestPayload {
  name: string
  type: string
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
}

export interface UpdateTestPayload {
  name?: string
  type?: string
  subject?: string
  topics?: string[]
  sub_topics?: string[]
  correct_marks?: number
  wrong_marks?: number
  unattempt_marks?: number
  difficulty?: Difficulty
  total_time?: number
  total_marks?: number
  total_questions?: number
  questions?: string[]
  status?: TestStatus | 'live' | 'draft'
}

export interface Question {
  id: string
  type: 'mcq'
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: 'option1' | 'option2' | 'option3' | 'option4'
  explanation?: string
  difficulty?: Difficulty
  topic?: string
  sub_topic?: string
  media_url?: string
  test_id?: string
}

export interface QuestionInput {
  type: 'mcq'
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: 'option1' | 'option2' | 'option3' | 'option4'
  explanation?: string
  difficulty?: Difficulty
  topic?: string
  sub_topic?: string
  media_url?: string
  test_id: string
}

export interface EditableQuestion extends Omit<QuestionInput, 'test_id'> {
  localId: string
  existingId?: string
}
