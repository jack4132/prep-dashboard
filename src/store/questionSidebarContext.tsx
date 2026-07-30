import { createContext, useContext, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { EditableQuestion } from '../types'

export interface QuestionSidebarState {
  questions: EditableQuestion[]
  totalQuestionCount: number
  editingId: string | null
  onEdit: (localId: string) => void
  onDelete: (localId: string) => void
}

interface QuestionSidebarContextValue {
  state: QuestionSidebarState
  setState: Dispatch<SetStateAction<QuestionSidebarState>>
}

const emptyHandler = () => {}

const defaultState: QuestionSidebarState = {
  questions: [],
  totalQuestionCount: 0,
  editingId: null,
  onEdit: emptyHandler,
  onDelete: emptyHandler,
}

const QuestionSidebarContext = createContext<QuestionSidebarContextValue | null>(null)

export function QuestionSidebarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuestionSidebarState>(defaultState)

  const value = useMemo(() => ({ state, setState }), [state])

  return <QuestionSidebarContext.Provider value={value}>{children}</QuestionSidebarContext.Provider>
}

export function useQuestionSidebar() {
  const ctx = useContext(QuestionSidebarContext)
  if (!ctx) {
    throw new Error('useQuestionSidebar must be used within QuestionSidebarProvider')
  }
  return ctx
}

export const questionSidebarDefaultState = defaultState
