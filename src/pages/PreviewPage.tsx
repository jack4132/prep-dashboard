import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuestionsBulk, getTestById, updateTest } from '../api/services'
import type { Question, Test } from '../types'

export function PreviewPage() {
  const navigate = useNavigate()
  const { testId } = useParams()
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!testId) {
      return
    }

    const currentTestId = testId

    async function loadData() {
      try {
        setLoading(true)
        const testResult = await getTestById(currentTestId)
        setTest(testResult)

        if ((testResult.questions ?? []).length > 0) {
          const questionResult = await fetchQuestionsBulk(testResult.questions ?? [])
          setQuestions(questionResult)
        }
      } catch {
        setMessage('Could not load preview data.')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [testId])

  async function handlePublish() {
    if (!testId) {
      return
    }

    try {
      setPublishing(true)
      setMessage(null)
      await updateTest(testId, { status: 'live' })
      setMessage('Test published successfully. Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch {
      setMessage('Publish failed. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return <p>Loading preview...</p>
  }

  return (
    <section className="page-card">
      <div className="page-head">
        <div>
          <p className="eyebrow">Step 3</p>
          <h2>Preview & Publish</h2>
        </div>
        <div className="action-row">
          <Link className="secondary-btn" to={`/tests/${testId}/edit`}>
            Edit Test
          </Link>
          <Link className="secondary-btn" to={`/tests/${testId}/questions`}>
            Edit Questions
          </Link>
        </div>
      </div>

      <article className="summary-card">
        <h3>{test?.name ?? '-'}</h3>
        <div className="summary-grid">
          <p>
            <strong>Type:</strong> {String(test?.type ?? '-')}
          </p>
          <p>
            <strong>Subject:</strong> {String(test?.subject ?? test?.subject_id ?? '-')}
          </p>
          <p>
            <strong>Difficulty:</strong> {String(test?.difficulty ?? '-')}
          </p>
          <p>
            <strong>Total Questions:</strong> {questions.length}
          </p>
          <p>
            <strong>Total Time:</strong> {String(test?.total_time ?? '-')} mins
          </p>
          <p>
            <strong>Total Marks:</strong> {String(test?.total_marks ?? '-')}
          </p>
        </div>
      </article>

      <section className="questions-list">
        <h3>Questions</h3>
        {questions.length === 0 ? <p className="muted">No questions found.</p> : null}
        {questions.map((question, index) => (
          <article key={question.id} className="question-card">
            <p className="question-label">Q{index + 1}</p>
            <p>{question.question}</p>
            <ul>
              <li>A. {question.option1}</li>
              <li>B. {question.option2}</li>
              <li>C. {question.option3}</li>
              <li>D. {question.option4}</li>
            </ul>
            <p className="muted">Correct: {question.correct_option}</p>
          </article>
        ))}
      </section>

      <div className="action-row">
        <button type="button" className="primary-btn" onClick={() => void handlePublish()}>
          {publishing ? 'Publishing...' : 'Publish Test'}
        </button>
      </div>

      {message ? <p className={message.includes('successfully') ? 'alert-success' : 'alert-error'}>{message}</p> : null}
    </section>
  )
}
