import type { EditableQuestion, SubTopic, Topic } from '../types'

interface QuestionEditorShellProps {
  questions: EditableQuestion[]
  editingId: string | null
  draft: EditableQuestion
  targetQuestionCount: number
  topics: Topic[]
  subTopics: SubTopic[]
  errorMessage: string | null
  onResetDraft: () => void
  onEdit: (localId: string) => void
  onUpdateDraft: <K extends keyof EditableQuestion>(key: K, value: EditableQuestion[K]) => void
  onAddOrUpdateQuestion: () => void
  onExit: () => void
}

export function QuestionEditorShell({
  questions,
  editingId,
  draft,
  targetQuestionCount,
  topics,
  subTopics,
  errorMessage,
  onResetDraft,
  onEdit,
  onUpdateDraft,
  onAddOrUpdateQuestion,
  onExit,
}: QuestionEditorShellProps) {
  const currentQuestionNumber = questions.findIndex((q) => q.localId === editingId) + 1 || questions.length + 1

  return (
    <div className="questions-page__editor-shell">
      <div className="questions-page__q-meta">
        <span className="questions-page__q-counter">
          Question {currentQuestionNumber}
          <span className="questions-page__q-total">/{targetQuestionCount}</span>
        </span>
        <div className="questions-page__q-meta-actions">
          <button type="button" className="questions-page__qmeta-btn">
            + MCQ
          </button>
          <button type="button" className="questions-page__qmeta-btn">
            + CSV
          </button>
        </div>
      </div>

      <button type="button" className="questions-page__delete-all" onClick={onResetDraft}>
        <span className="questions-page__delete-all-icon" aria-hidden="true">
          🗑
        </span>
        Delete All Edits
      </button>

      <div className="questions-page__q-editor-wrap">
        <div className="questions-page__toolbar" aria-label="Formatting toolbar">
          <button type="button" className="questions-page__toolbar-btn">
            <i>I</i>
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            <b>B</b>
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            <u>U</u>
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            U̲
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            🔗
          </button>
          <span className="questions-page__toolbar-sep" />
          <button type="button" className="questions-page__toolbar-btn">
            ▪
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            ≡
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            ≣
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            ⋮≡
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            ⋮⋮
          </button>
          <span className="questions-page__toolbar-sep" />
          <button type="button" className="questions-page__toolbar-btn">
            ⊞
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            ≔
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            🖼
          </button>
          <button type="button" className="questions-page__toolbar-btn">
            fx
          </button>
        </div>
        <textarea
          className="questions-page__q-textarea"
          rows={4}
          value={draft.question}
          onChange={(event) => onUpdateDraft('question', event.target.value)}
          placeholder="Type here"
        />
        <button type="button" className="questions-page__q-trash" aria-label="Clear question">
          🗑
        </button>
      </div>

      <p className="questions-page__options-label">Type the options below</p>
      <div className="questions-page__options-list">
        {(['option1', 'option2', 'option3', 'option4'] as const).map((key) => (
          <div key={key} className="questions-page__option-row">
            <button
              type="button"
              className={`questions-page__option-radio ${draft.correct_option === key ? 'questions-page__option-radio--selected' : ''}`}
              aria-label={`Mark ${key} as correct`}
              onClick={() => onUpdateDraft('correct_option', key)}
            />
            <input
              className="questions-page__option-input"
              value={draft[key]}
              onChange={(event) => onUpdateDraft(key, event.target.value)}
              placeholder="Type Option here"
            />
            <button type="button" className="questions-page__option-trash" aria-label="Remove option">
              🗑
            </button>
          </div>
        ))}
      </div>

      <p className="questions-page__options-label">Add Solution</p>
      <div className="questions-page__q-editor-wrap">
        <textarea
          className="questions-page__q-textarea"
          rows={4}
          value={draft.explanation ?? ''}
          onChange={(event) => onUpdateDraft('explanation', event.target.value)}
          placeholder="Type here"
        />
        <button type="button" className="questions-page__q-trash" aria-label="Clear solution">
          🗑
        </button>
      </div>

      <div className="questions-page__q-nav">
        <button
          type="button"
          className="questions-page__q-nav-btn"
          disabled={questions.length === 0}
          onClick={() => {
            const idx = questions.findIndex((q) => q.localId === editingId)
            if (idx > 0) onEdit(questions[idx - 1].localId)
          }}
        >
          ‹
        </button>
        <button
          type="button"
          className="questions-page__q-nav-btn"
          disabled={questions.length === 0}
          onClick={() => {
            const idx = questions.findIndex((q) => q.localId === editingId)
            if (idx >= 0 && idx < questions.length - 1) onEdit(questions[idx + 1].localId)
          }}
        >
          ›
        </button>
      </div>

      <p className="questions-page__settings-title">Question settings</p>

      <label className="questions-page__settings-label">
        Level of Difficulty
        <select
          className="questions-page__settings-select"
          value={draft.difficulty ?? 'medium'}
          onChange={(event) => onUpdateDraft('difficulty', event.target.value as EditableQuestion['difficulty'])}
        >
          <option value="">Select from Drop-down</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <label className="questions-page__settings-label">
        Topic
        <select
          className="questions-page__settings-select"
          value={draft.topic ?? ''}
          onChange={(event) => onUpdateDraft('topic', event.target.value)}
        >
          <option value="">Select from Drop-down</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
      </label>

      <label className="questions-page__settings-label">
        Sub-topic
        <select
          className="questions-page__settings-select"
          value={draft.sub_topic ?? ''}
          onChange={(event) => onUpdateDraft('sub_topic', event.target.value)}
        >
          <option value="">Select from Drop-down</option>
          {subTopics.map((subTopic) => (
            <option key={subTopic.id} value={subTopic.id}>
              {subTopic.name}
            </option>
          ))}
        </select>
      </label>

      {errorMessage ? <p className="questions-page__alert-error">{errorMessage}</p> : null}

      <div className="questions-page__bottom-bar">
        <button type="button" className="questions-page__exit-btn" onClick={onExit}>
          Exit Test Creation
        </button>
        <button type="button" className="questions-page__next-btn" onClick={onAddOrUpdateQuestion}>
          {editingId ? 'Update' : 'Next'}
        </button>
      </div>
    </div>
  )
}
