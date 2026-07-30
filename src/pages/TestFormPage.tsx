import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createTest,
  getSubTopicsByTopic,
  getSubTopicsByTopics,
  getTestById,
  getTopicsBySubject,
  updateTest,
} from '../api/services'
import type { CreateTestPayload, Difficulty, Subject, SubTopic, Test, Topic } from '../types'
import { TestCreationHeader, type TestCreationMode } from '../components/TestCreationHeader'
import './TestFormPage.css'

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
  total_questions: z.coerce.number<number>().int().nonnegative('Must be zero or positive'),
  total_time: z.coerce.number<number>().int().positive('Must be positive'),
  total_marks: z.coerce.number<number>().int().positive('Must be positive'),
})

type TestFormValues = z.infer<typeof testSchema>

const mockSubjects: Subject[] = [
  { id: '1', name: '1' },
  { id: '2', name: '2' },
]

const mockTopicsBySubject: Record<string, Topic[]> = {
  '1': [
    { id: 'topic-1', name: 'Algebra', subject_id: '1' },
    { id: 'topic-2', name: 'Geometry', subject_id: '1' },
  ],
  '2': [
    { id: 'topic-3', name: 'Physics', subject_id: '2' },
    { id: 'topic-4', name: 'Chemistry', subject_id: '2' },
  ],
}

const mockSubTopicsByTopic: Record<string, SubTopic[]> = {
  'topic-1': [
    { id: 'sub-topic-1', name: 'Linear Equations', topic_id: 'topic-1' },
    { id: 'sub-topic-2', name: 'Quadratic Equations', topic_id: 'topic-1' },
  ],
  'topic-2': [
    { id: 'sub-topic-3', name: 'Triangles', topic_id: 'topic-2' },
    { id: 'sub-topic-4', name: 'Circles', topic_id: 'topic-2' },
  ],
  'topic-3': [
    { id: 'sub-topic-5', name: 'Motion', topic_id: 'topic-3' },
    { id: 'sub-topic-6', name: 'Force', topic_id: 'topic-3' },
  ],
  'topic-4': [
    { id: 'sub-topic-7', name: 'Atoms', topic_id: 'topic-4' },
    { id: 'sub-topic-8', name: 'Reactions', topic_id: 'topic-4' },
  ],
}

function getMockSubTopics(topicIds: string[]) {
  return topicIds.flatMap((topicId) => mockSubTopicsByTopic[topicId] ?? [])
}

interface TestDetailsFormProps {
  onSubmit: (values: TestFormValues) => Promise<void>
  handleSubmit: ReturnType<typeof useForm<TestFormValues>>['handleSubmit']
  register: ReturnType<typeof useForm<TestFormValues>>['register']
  errors: ReturnType<typeof useForm<TestFormValues>>['formState']['errors']
  isSubmitting: boolean
  errorMessage: string | null
  selectedTopic: string
  selectedSubTopic: string
  topics: Topic[]
  subTopics: SubTopic[]
  handleTopicChange: (value: string) => void
  handleSubTopicChange: (value: string) => void
  subjects: Subject[]
  navigateBack: () => void
  setSubmitMode: (mode: 'draft' | 'next') => void
}

function TestDetailsForm({
  onSubmit,
  handleSubmit,
  register,
  errors,
  isSubmitting,
  errorMessage,
  selectedTopic,
  selectedSubTopic,
  topics,
  subTopics,
  handleTopicChange,
  handleSubTopicChange,
  subjects,
  navigateBack,
  setSubmitMode,
}: TestDetailsFormProps) {
  return (
    <form className="test-form-page__form" onSubmit={handleSubmit(onSubmit)}>
      <div className="test-form-page__grid-2">
        <label className="test-form-page__label">
          Subject
          <select className="test-form-page__input" {...register('subject')}>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subject ? <span className="test-form-page__field-error">{errors.subject.message}</span> : null}
        </label>

        <label className="test-form-page__label">
          Name of test
          <input className="test-form-page__input" type="text" placeholder="e.g. Algebra Weekly Test" {...register('name')} />
          {errors.name ? <span className="test-form-page__field-error">{errors.name.message}</span> : null}
        </label>
      </div>

      <div className="test-form-page__grid-2">
        <label className="test-form-page__label">
          Topic
          <select
            className="test-form-page__input"
            value={selectedTopic}
            onChange={(event) => handleTopicChange(event.target.value)}
          >
            <option value="">Select topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        <label className="test-form-page__label">
          Sub topic
          <select
            className="test-form-page__input"
            value={selectedSubTopic}
            onChange={(event) => handleSubTopicChange(event.target.value)}
            disabled={selectedTopic === '' || subTopics.length === 0}
          >
            <option value="">Select sub topic</option>
            {subTopics.map((subTopic) => (
              <option key={subTopic.id} value={subTopic.id}>
                {subTopic.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="test-form-page__grid-2">
        <label className="test-form-page__label">
          Duration (Minutes)
          <input className="test-form-page__input" type="number" {...register('total_time')} />
        </label>

        <div className="test-form-page__field-group">
          <legend className="test-form-page__field-group-title">Test Difficulty Level</legend>
          <div className="test-form-page__radio-row">
            {[
              { label: 'Easy', value: 'easy' },
              { label: 'Medium', value: 'medium' },
              { label: 'Difficult', value: 'hard' },
            ].map((option) => (
              <label key={option.value} className="test-form-page__radio-option">
                <input className="test-form-page__radio" type="radio" value={option.value} {...register('difficulty')} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="test-form-page__field-group">
        <p className="test-form-page__field-group-title">Marking Scheme:</p>
        <div className="test-form-page__marking-row">
          <label className="test-form-page__label">
            Wrong Answer
            <input className="test-form-page__input" type="number" {...register('wrong_marks')} />
          </label>
          <label className="test-form-page__label">
            Unattempted
            <input className="test-form-page__input" type="number" {...register('unattempt_marks')} />
          </label>
          <label className="test-form-page__label">
            Correct Answer
            <input className="test-form-page__input" type="number" {...register('correct_marks')} />
          </label>
          <label className="test-form-page__label">
            No. of Questions
            <input className="test-form-page__input" type="number" {...register('total_questions')} />
          </label>
          <label className="test-form-page__label">
            Total Marks
            <input className="test-form-page__input" type="number" {...register('total_marks')} />
          </label>
        </div>
      </div>

      {errorMessage ? <p className="test-form-page__alert-error">{errorMessage}</p> : null}

      <div className="test-form-page__action-row">
        <button
          type="button"
          className="test-form-page__secondary-btn"
          onClick={navigateBack}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="test-form-page__primary-btn"
          disabled={isSubmitting}
          onClick={() => setSubmitMode('next')}
        >
          Next
        </button>
      </div>
    </form>
  )
}

export function TestFormPage() {
  const navigate = useNavigate()
  const { testId } = useParams()
  const isEdit = Boolean(testId)
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects)
  const [topics, setTopics] = useState<Topic[]>(mockTopicsBySubject['1'] ?? [])
  const [subTopics, setSubTopics] = useState<SubTopic[]>(mockSubTopicsByTopic['topic-1'] ?? [])
  const [loading, setLoading] = useState(isEdit)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitMode, setSubmitMode] = useState<'draft' | 'next'>('next')
  const [selectedMode, setSelectedMode] = useState<TestCreationMode>('chapterwise')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: 'Demo Test',
      type: 'chapterwise',
      subject: '1',
      topics: ['topic-1'],
      sub_topics: ['sub-topic-1'],
      difficulty: 'medium',
      correct_marks: 4,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_questions: 0,
      total_time: 60,
      total_marks: 100,
    },
  })

  const selectedSubject = watch('subject')
  const selectedTopics = watch('topics')
  const selectedSubTopics = watch('sub_topics')
  const selectedTopic = selectedTopics[0] ?? ''
  const selectedSubTopic = selectedSubTopics[0] ?? ''

  useEffect(() => {
    setValue('type', selectedMode, { shouldValidate: true })
  }, [selectedMode, setValue])

  useEffect(() => {
    void import('../api/services')
      .then(({ getSubjects }) => getSubjects())
      .then((result) => { if (result.length > 0) setSubjects(result) })
      .catch(() => { /* keep mockSubjects */ })
  }, [])

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([])
      return
    }

    void getTopicsBySubject(selectedSubject)
      .then((result) => setTopics(result.length > 0 ? result : (mockTopicsBySubject[selectedSubject] ?? [])))
      .catch(() => setTopics(mockTopicsBySubject[selectedSubject] ?? []))
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
        setSubTopics(bulk.length > 0 ? bulk : getMockSubTopics(selectedTopics))
      } catch {
        try {
          const merged = await Promise.all(selectedTopics.map((topicId) => getSubTopicsByTopic(topicId)))
          const mergedSubTopics = merged.flat()
          setSubTopics(mergedSubTopics.length > 0 ? mergedSubTopics : getMockSubTopics(selectedTopics))
        } catch {
          setSubTopics(getMockSubTopics(selectedTopics))
        }
      }
    }

    void loadSubTopics().catch(() => setSubTopics(getMockSubTopics(selectedTopics)))
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
    setValue('total_questions', test.total_questions ?? 0)
    setValue('total_time', test.total_time ?? 60)
    setValue('total_marks', test.total_marks ?? 100)
  }

  function handleTopicChange(value: string) {
    setValue('topics', value ? [value] : [], { shouldValidate: true })
    setValue('sub_topics', [], { shouldValidate: true })
  }

  function handleSubTopicChange(value: string) {
    setValue('sub_topics', value ? [value] : [], { shouldValidate: true })
  }

  async function onSubmit(values: TestFormValues) {
    try {
      setErrorMessage(null)

      const payload: CreateTestPayload = {
        ...values,
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
      if (submitMode === 'next') {
        navigate('/tests/demo/questions')
        return
      }

      setErrorMessage('Failed to save test details.')
    }
  }

  if (loading) {
    return <p>Loading test details...</p>
  }

  return (
    <section className="test-form-page">
      <TestCreationHeader selectedMode={selectedMode} onSelectMode={setSelectedMode} />

      <TestDetailsForm
        onSubmit={onSubmit}
        handleSubmit={handleSubmit}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        selectedTopic={selectedTopic}
        selectedSubTopic={selectedSubTopic}
        topics={topics}
        subTopics={subTopics}
        handleTopicChange={handleTopicChange}
        handleSubTopicChange={handleSubTopicChange}
        subjects={subjects}
        navigateBack={() => navigate(-1)}
        setSubmitMode={setSubmitMode}
      />
    </section>
  )
}
