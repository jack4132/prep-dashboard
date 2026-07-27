import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createTest,
  getSubjects,
  getSubTopicsByTopic,
  getSubTopicsByTopics,
  getTestById,
  getTopicsBySubject,
  updateTest,
} from '../api/services'
import type { CreateTestPayload, Difficulty, Subject, SubTopic, Test, Topic } from '../types'

const testSchema = z.object({
  name: z.string().min(3, 'Test name required'),
  type: z.string().min(1, 'Test type required'),
  subject: z.string().min(1, 'Subject required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.coerce.number<number>().positive('Must be positive'),
  wrong_marks: z.coerce.number<number>(),
  unattempt_marks: z.coerce.number<number>(),
  total_time: z.coerce.number<number>().int().positive('Must be positive'),
  total_marks: z.coerce.number<number>().int().positive('Must be positive'),
})

type TestFormValues = z.infer<typeof testSchema>

export function TestFormPage() {
  const navigate = useNavigate()
  const { testId } = useParams()
  const isEdit = Boolean(testId)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitMode, setSubmitMode] = useState<'draft' | 'next'>('next')

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      type: 'chapterwise',
      subject: '',
      topics: [],
      sub_topics: [],
      difficulty: 'medium',
      correct_marks: 4,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 100,
    },
  })

  const selectedSubject = watch('subject')
  const selectedTopics = watch('topics')
  const selectedSubTopics = watch('sub_topics')

  useEffect(() => {
    void getSubjects().then(setSubjects).catch(() => setErrorMessage('Could not load subjects.'))
  }, [])

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([])
      return
    }

    void getTopicsBySubject(selectedSubject)
      .then((result) => setTopics(result))
      .catch(() => setErrorMessage('Could not load topics.'))
  }, [selectedSubject])

  useEffect(() => {
    if (selectedTopics.length === 0) {
      setSubTopics([])
      setValue('sub_topics', [])
      return
    }

    async function loadSubTopics() {
      try {
        const bulk = await getSubTopicsByTopics(selectedTopics)
        setSubTopics(bulk)
      } catch {
        const merged = await Promise.all(selectedTopics.map((topicId) => getSubTopicsByTopic(topicId)))
        setSubTopics(merged.flat())
      }
    }

    void loadSubTopics().catch(() => setErrorMessage('Could not load sub-topics.'))
  }, [selectedTopics, setValue])

  useEffect(() => {
    if (!isEdit || !testId) {
      return
    }

    const currentTestId = testId

    async function loadTest() {
      try {
        setLoading(true)
        const test = await getTestById(currentTestId)
        hydrateForm(test)
      } catch {
        setErrorMessage('Could not load test details.')
      } finally {
        setLoading(false)
      }
    }

    void loadTest()
  }, [isEdit, testId])

  function hydrateForm(test: Test) {
    setValue('name', test.name ?? '')
    setValue('type', test.type ?? 'chapterwise')
    setValue('subject', String(test.subject_id ?? test.subject ?? ''))
    setValue('topics', test.topics ?? [])
    setValue('sub_topics', test.sub_topics ?? [])
    setValue('difficulty', ((test.difficulty as Difficulty) ?? 'medium'))
    setValue('correct_marks', test.correct_marks ?? 4)
    setValue('wrong_marks', test.wrong_marks ?? -1)
    setValue('unattempt_marks', test.unattempt_marks ?? 0)
    setValue('total_time', test.total_time ?? 60)
    setValue('total_marks', test.total_marks ?? 100)
  }

  function toggleSelection(field: 'topics' | 'sub_topics', value: string) {
    const current = getValues(field)
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setValue(field, next, { shouldValidate: true })
  }

  const selectedTopicSet = useMemo(() => new Set(selectedTopics), [selectedTopics])
  const selectedSubTopicSet = useMemo(() => new Set(selectedSubTopics), [selectedSubTopics])

  async function onSubmit(values: TestFormValues) {
    try {
      setErrorMessage(null)

      const payload: CreateTestPayload = {
        ...values,
        total_questions: 0,
        status: submitMode === 'draft' ? 'draft' : null,
      }

      if (!isEdit) {
        const created = await createTest(payload)
        if (submitMode === 'draft') {
          navigate('/dashboard')
          return
        }
        navigate(`/tests/${created.id}/questions`)
        return
      }

      if (!testId) {
        return
      }

      await updateTest(testId, {
        ...payload,
      })

      if (submitMode === 'draft') {
        navigate('/dashboard')
        return
      }

      navigate(`/tests/${testId}/questions`)
    } catch {
      setErrorMessage('Failed to save test details.')
    }
  }

  if (loading) {
    return <p>Loading test details...</p>
  }

  return (
    <section className="page-card">
      <div className="page-head">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2>{isEdit ? 'Edit Test' : 'Create Test'}</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid-2">
          <label>
            Test Name
            <input type="text" placeholder="e.g. Algebra Weekly Test" {...register('name')} />
            {errors.name ? <span className="field-error">{errors.name.message}</span> : null}
          </label>

          <label>
            Test Type
            <select {...register('type')}>
              <option value="chapterwise">Chapterwise</option>
              <option value="full-length">Full Length</option>
              <option value="topicwise">Topicwise</option>
            </select>
          </label>
        </div>

        <div className="grid-2">
          <label>
            Subject
            <select {...register('subject')}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject ? <span className="field-error">{errors.subject.message}</span> : null}
          </label>

          <label>
            Difficulty
            <select {...register('difficulty')}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <div>
          <p className="group-title">Topics</p>
          <div className="choice-grid">
            {topics.length === 0 ? <p className="muted">Select subject to load topics.</p> : null}
            {topics.map((topic) => (
              <label key={topic.id} className="checkbox-tile">
                <input
                  type="checkbox"
                  checked={selectedTopicSet.has(topic.id)}
                  onChange={() => toggleSelection('topics', topic.id)}
                />
                <span>{topic.name}</span>
              </label>
            ))}
          </div>
          {errors.topics ? <span className="field-error">{errors.topics.message}</span> : null}
        </div>

        <div>
          <p className="group-title">Sub-topics</p>
          <div className="choice-grid">
            {subTopics.length === 0 ? <p className="muted">Select topics to load sub-topics.</p> : null}
            {subTopics.map((subTopic) => (
              <label key={subTopic.id} className="checkbox-tile">
                <input
                  type="checkbox"
                  checked={selectedSubTopicSet.has(subTopic.id)}
                  onChange={() => toggleSelection('sub_topics', subTopic.id)}
                />
                <span>{subTopic.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid-3">
          <label>
            Correct Marks
            <input type="number" {...register('correct_marks')} />
          </label>
          <label>
            Wrong Marks
            <input type="number" {...register('wrong_marks')} />
          </label>
          <label>
            Unattempt Marks
            <input type="number" {...register('unattempt_marks')} />
          </label>
        </div>

        <div className="grid-2">
          <label>
            Total Time (minutes)
            <input type="number" {...register('total_time')} />
          </label>
          <label>
            Total Marks
            <input type="number" {...register('total_marks')} />
          </label>
        </div>

        {errorMessage ? <p className="alert-error">{errorMessage}</p> : null}

        <div className="action-row">
          <button
            type="submit"
            className="secondary-btn"
            disabled={isSubmitting}
            onClick={() => setSubmitMode('draft')}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting}
            onClick={() => setSubmitMode('next')}
          >
            Next: Add Questions
          </button>
        </div>
      </form>
    </section>
  )
}
