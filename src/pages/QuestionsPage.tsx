import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createQuestionsBulk,
  fetchQuestionsBulk,
  getSubTopicsByTopics,
  getTestById,
  getTopicsBySubject,
  updateTest,
} from '../api/services'
import type { EditableQuestion, QuestionInput, SubTopic, Test, Topic } from '../types'
import { uniqueValues } from '../utils/format'

const questionTemplate: Omit<EditableQuestion, 'localId'> = {
  type: 'mcq',
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: 'medium',
  topic: '',
  sub_topic: '',
  media_url: '',
}

function makeLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function QuestionsPage() {
  const navigate = useNavigate()
  const { testId } = useParams()
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<EditableQuestion[]>([])
  const [draft, setDraft] = useState<EditableQuestion>({
    ...questionTemplate,
    localId: makeLocalId(),
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!testId) {
      return
    }

    const currentTestId = testId

    async function loadPageData() {
      try {
        setLoading(true)
        const testResult = await getTestById(currentTestId)
        setTest(testResult)

        if (testResult.subject_id ?? testResult.subject) {
          const topicList = await getTopicsBySubject(String(testResult.subject_id ?? testResult.subject))
          setTopics(topicList)
        }

        if ((testResult.topics ?? []).length > 0) {
          const subTopicList = await getSubTopicsByTopics(testResult.topics ?? [])
          setSubTopics(subTopicList)
        }

        if ((testResult.questions ?? []).length > 0) {
          const fetchedQuestions = await fetchQuestionsBulk(testResult.questions ?? [])
          setQuestions(
            fetchedQuestions.map((question) => ({
              localId: makeLocalId(),
              existingId: question.id,
              type: 'mcq',
              question: question.question,
              option1: question.option1,
              option2: question.option2,
              option3: question.option3,
              option4: question.option4,
              correct_option: question.correct_option,
              explanation: question.explanation ?? '',
              difficulty: question.difficulty ?? 'medium',
              topic: question.topic ?? '',
              sub_topic: question.sub_topic ?? '',
              media_url: question.media_url ?? '',
            })),
          )
        }
      } catch {
        setErrorMessage('Could not load question editor.')
      } finally {
        setLoading(false)
      }
    }

    void loadPageData()
  }, [testId])

  const canSubmitDraft = useMemo(() => {
    return (
      draft.question.trim().length > 0 &&
      draft.option1.trim().length > 0 &&
      draft.option2.trim().length > 0 &&
      draft.option3.trim().length > 0 &&
      draft.option4.trim().length > 0
    )
  }, [draft])

  function updateDraft<K extends keyof EditableQuestion>(key: K, value: EditableQuestion[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function resetDraft() {
    setDraft({
      ...questionTemplate,
      localId: makeLocalId(),
    })
    setEditingId(null)
  }

  function handleAddOrUpdateQuestion() {
    if (!canSubmitDraft) {
      setErrorMessage('Question text and all 4 options are required.')
      return
    }

    setErrorMessage(null)

    if (editingId) {
      setQuestions((prev) =>
        prev.map((item) => {
          if (item.localId !== editingId) {
            return item
          }

          return {
            ...draft,
            localId: item.localId,
            existingId: undefined,
          }
        }),
      )
      resetDraft()
      return
    }

    setQuestions((prev) => [
      ...prev,
      {
        ...draft,
        localId: makeLocalId(),
      },
    ])

    resetDraft()
  }

  function handleEdit(localId: string) {
    const selected = questions.find((item) => item.localId === localId)
    if (!selected) {
      return
    }

    setDraft({ ...selected })
    setEditingId(localId)
  }

  function handleDelete(localId: string) {
    setQuestions((prev) => prev.filter((item) => item.localId !== localId))
  }

  async function handleSaveAndContinue() {
    if (!testId || !test) {
      return
    }

    if (questions.length < 1) {
      setErrorMessage('Add at least one question before continuing.')
      return
    }

    try {
      setSaving(true)
      setErrorMessage(null)

      const existingIds = questions.map((item) => item.existingId).filter(Boolean) as string[]
      const newQuestions = questions.filter((item) => !item.existingId)

      let createdIds: string[] = []
      if (newQuestions.length > 0) {
        const payload: QuestionInput[] = newQuestions.map((item) => ({
          type: 'mcq',
          question: item.question,
          option1: item.option1,
          option2: item.option2,
          option3: item.option3,
          option4: item.option4,
          correct_option: item.correct_option,
          explanation: item.explanation,
          difficulty: item.difficulty,
          topic: item.topic,
          sub_topic: item.sub_topic,
          media_url: item.media_url,
          test_id: testId,
        }))

        const created = await createQuestionsBulk(payload)
        createdIds = created.map((item) => item.id)
      }

      const allQuestionIds = uniqueValues([...existingIds, ...createdIds])

      await updateTest(testId, {
        questions: allQuestionIds,
        total_questions: allQuestionIds.length,
        total_marks:
          test.total_marks ?? allQuestionIds.length * (test.correct_marks && test.correct_marks > 0 ? test.correct_marks : 1),
      })

      navigate(`/tests/${testId}/preview`)
    } catch {
      setErrorMessage('Could not save questions.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading question editor...</p>
  }

  return (
    <section className="page-card">
      <div className="page-head">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>Add Questions</h2>
          <p className="muted">{test?.name ?? 'Test'} | MCQ format</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Question Text
          <textarea
            rows={3}
            value={draft.question}
            onChange={(event) => updateDraft('question', event.target.value)}
            placeholder="Enter question"
          />
        </label>

        <div className="grid-2">
          <label>
            Option 1
            <input value={draft.option1} onChange={(event) => updateDraft('option1', event.target.value)} />
          </label>
          <label>
            Option 2
            <input value={draft.option2} onChange={(event) => updateDraft('option2', event.target.value)} />
          </label>
          <label>
            Option 3
            <input value={draft.option3} onChange={(event) => updateDraft('option3', event.target.value)} />
          </label>
          <label>
            Option 4
            <input value={draft.option4} onChange={(event) => updateDraft('option4', event.target.value)} />
          </label>
        </div>

        <div className="grid-3">
          <label>
            Correct Option
            <select
              value={draft.correct_option}
              onChange={(event) =>
                updateDraft(
                  'correct_option',
                  event.target.value as EditableQuestion['correct_option'],
                )
              }
            >
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
              <option value="option4">Option 4</option>
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={draft.difficulty ?? 'medium'}
              onChange={(event) =>
                updateDraft('difficulty', event.target.value as EditableQuestion['difficulty'])
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Media URL
            <input value={draft.media_url ?? ''} onChange={(event) => updateDraft('media_url', event.target.value)} />
          </label>
        </div>

        <div className="grid-2">
          <label>
            Topic (optional)
            <select value={draft.topic ?? ''} onChange={(event) => updateDraft('topic', event.target.value)}>
              <option value="">Select topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sub-topic (optional)
            <select
              value={draft.sub_topic ?? ''}
              onChange={(event) => updateDraft('sub_topic', event.target.value)}
            >
              <option value="">Select sub-topic</option>
              {subTopics.map((subTopic) => (
                <option key={subTopic.id} value={subTopic.id}>
                  {subTopic.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Explanation (optional)
          <textarea
            rows={2}
            value={draft.explanation ?? ''}
            onChange={(event) => updateDraft('explanation', event.target.value)}
          />
        </label>

        <div className="action-row">
          <button type="button" className="secondary-btn" onClick={handleAddOrUpdateQuestion}>
            {editingId ? 'Update Question' : 'Add Another Question'}
          </button>
          <button type="button" className="primary-btn" onClick={() => void handleSaveAndContinue()}>
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>

        {errorMessage ? <p className="alert-error">{errorMessage}</p> : null}
      </div>

      <section className="questions-list">
        <h3>Added Questions ({questions.length})</h3>
        {questions.length === 0 ? <p className="muted">No questions added yet.</p> : null}
        {questions.map((item, index) => (
          <article key={item.localId} className="question-card">
            <div>
              <p className="question-label">Q{index + 1}</p>
              <p>{item.question}</p>
              <ul>
                <li>A. {item.option1}</li>
                <li>B. {item.option2}</li>
                <li>C. {item.option3}</li>
                <li>D. {item.option4}</li>
              </ul>
            </div>
            <div className="action-row">
              <button type="button" className="secondary-btn" onClick={() => handleEdit(item.localId)}>
                Edit
              </button>
              <button type="button" className="danger-btn" onClick={() => handleDelete(item.localId)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}
