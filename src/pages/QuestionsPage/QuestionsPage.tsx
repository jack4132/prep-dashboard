import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createQuestionsBulk,
  fetchQuestionsBulk,
  getTestById,
  updateTest,
} from "../../api/services";
import type { EditableQuestion, QuestionInput, SubTopic, Test, Topic } from '../../types'
import { uniqueValues } from '../../utils/format'
import { questionSidebarDefaultState, useQuestionSidebar } from '../../store/questionSidebarContext'
import { TestCreationHeader, type TestCreationMode } from '../../components/TestCreationHeader'
import { QuestionEditorShell } from '../../components/QuestionEditorShell'
import { PublishFlowSection } from '../../components/PublishFlowSection'
import './QuestionsPage.css'

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

const mockTest: Test = {
  id: "demo",
  name: "Demo Test",
  subject: "1",
  subject_id: "1",
  topics: ["topic-1"],
  sub_topics: ["sub-topic-1"],
  difficulty: "medium",
  correct_marks: 4,
  wrong_marks: -1,
  unattempt_marks: 0,
  total_time: 60,
  total_marks: 100,
  total_questions: 2,
};

const mockSubjectsById: Record<string, string> = {
  "1": "1",
  "2": "2",
  "subject-1": "1",
  "subject-2": "2",
};

const mockTopicsBySubject: Record<string, Topic[]> = {
  "1": [
    { id: "topic-1", name: "Algebra", subject_id: "1" },
    { id: "topic-2", name: "Geometry", subject_id: "1" },
  ],
  "2": [
    { id: "topic-3", name: "Physics", subject_id: "2" },
    { id: "topic-4", name: "Chemistry", subject_id: "2" },
  ],
  "subject-1": [
    { id: "topic-1", name: "Algebra", subject_id: "subject-1" },
    { id: "topic-2", name: "Geometry", subject_id: "subject-1" },
  ],
  "subject-2": [
    { id: "topic-3", name: "Physics", subject_id: "subject-2" },
    { id: "topic-4", name: "Chemistry", subject_id: "subject-2" },
  ],
};

const mockSubTopicsByTopic: Record<string, SubTopic[]> = {
  "topic-1": [
    { id: "sub-topic-1", name: "Linear Equations", topic_id: "topic-1" },
    { id: "sub-topic-2", name: "Quadratic Equations", topic_id: "topic-1" },
  ],
  "topic-2": [
    { id: "sub-topic-3", name: "Triangles", topic_id: "topic-2" },
    { id: "sub-topic-4", name: "Circles", topic_id: "topic-2" },
  ],
  "topic-3": [
    { id: "sub-topic-5", name: "Motion", topic_id: "topic-3" },
    { id: "sub-topic-6", name: "Force", topic_id: "topic-3" },
  ],
  "topic-4": [
    { id: "sub-topic-7", name: "Atoms", topic_id: "topic-4" },
    { id: "sub-topic-8", name: "Reactions", topic_id: "topic-4" },
  ],
};

const mockTopics: Topic[] = [
  { id: 'topic-1', name: 'Algebra', subject_id: 'subject-1' },
  { id: 'topic-2', name: 'Geometry', subject_id: 'subject-1' },
]

const mockSubTopics: SubTopic[] = [
  { id: 'sub-topic-1', name: 'Linear Equations', topic_id: 'topic-1' },
  { id: 'sub-topic-2', name: 'Quadratic Equations', topic_id: 'topic-1' },
]

function makeLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function toLabel(value: string | undefined) {
  if (!value) return 'N/A'
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function toDifficulty(value: string | undefined) {
  if (!value) return 'Medium'
  return value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase()
}

export function QuestionsPage() {
  const navigate = useNavigate()
  const { testId } = useParams()
  const { setState: setSidebarState } = useQuestionSidebar()
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
  const [selectedMode, setSelectedMode] = useState<TestCreationMode>('chapterwise')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [liveUntil, setLiveUntil] = useState<'always' | '1w' | '2w' | '3w' | '1m' | 'custom'>('custom')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

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

        const subjectId = String(
          testResult.subject_id ?? testResult.subject ?? "",
        );
        const topicList = mockTopicsBySubject[subjectId] ?? mockTopics;
        const selectedTopicIds = testResult.topics ?? [];
        const subTopicList = selectedTopicIds.flatMap(
          (topicId) => mockSubTopicsByTopic[topicId] ?? [],
        );

        setTopics(topicList);
        setSubTopics(subTopicList.length > 0 ? subTopicList : mockSubTopics);

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
        setTest({ ...mockTest, id: currentTestId })
        setTopics(mockTopics)
        setSubTopics(mockSubTopics);
        setErrorMessage(null)
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

  const totalQuestionCount = questions.length > 0 ? questions.length : Number(test?.total_questions ?? 0)
  const targetQuestionCount = useMemo(() => {
    const value = Number(test?.total_questions ?? 2)
    return value > 0 ? value : 2
  }, [test?.total_questions])

  const subjectLabel = useMemo(() => {
    const subjectId = String(test?.subject_id ?? test?.subject ?? "");
    if (!subjectId) return "N/A";
    return mockSubjectsById[subjectId] ?? toLabel(subjectId);
  }, [test?.subject, test?.subject_id]);

  const modeLabel = useMemo(() => {
    if (!test?.type) return "Chapter wise";
    return toLabel(test.type);
  }, [test?.type]);

  function getTopicLabel(topicId: string | undefined) {
    if (!topicId) return "N/A";
    const match = topics.find((topic) => topic.id === topicId);
    return match?.name ?? toLabel(topicId);
  }

  function getSubTopicLabel(subTopicId: string | undefined) {
    if (!subTopicId) return "N/A";
    const match = subTopics.find((subTopic) => subTopic.id === subTopicId);
    return match?.name ?? toLabel(subTopicId);
  }

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
    if (!editingId && questions.length >= targetQuestionCount) {
      setShowPublishModal(true)
      return
    }

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

    const nextCount = questions.length + 1

    setQuestions((prev) => [
      ...prev,
      {
        ...draft,
        localId: makeLocalId(),
      },
    ])

    resetDraft()

    if (nextCount >= targetQuestionCount) {
      setShowPublishModal(true)
    }
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

  useEffect(() => {
    setSidebarState({
      questions,
      totalQuestionCount,
      editingId,
      onEdit: handleEdit,
      onDelete: handleDelete,
    })

    return () => {
      setSidebarState(questionSidebarDefaultState)
    }
  }, [questions, totalQuestionCount, editingId, setSidebarState])

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

      if (test.id === 'demo' || testId === 'demo') {
        navigate(`/tests/${testId}/preview`)
        return
      }

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
    <section className="questions-page">
      <div className="questions-page__layout">
        <div className="questions-page__editor page-card">
          <TestCreationHeader
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            showPublish
            publishLabel={saving ? "Publishing..." : "Publish"}
            publishDisabled={saving}
            onPublish={() => setShowPublishModal(true)}
          />

          <div className="questions-page__cards">
            <div className={`questions-page__summary-card`}>
              {/* top row: mode chip + edit icon */}
              <div className="questions-page__card-top">
                <span className="questions-page__chip questions-page__chip--mode">
                  {modeLabel}
                </span>
                <button
                  type="button"
                  className="questions-page__card-edit-btn"
                  aria-label="Edit question"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7489ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              {/* chapter title + difficulty */}
              <span className="questions-page__summary-head">
                <span className="questions-page__summary-title">
                  {test?.name}
                </span>
                <span className="questions-page__chip questions-page__chip--difficulty">
                  {toDifficulty(test?.difficulty)}
                </span>
              </span>

              {/* subject */}
              <span className="questions-page__summary-row">
                <span className="caption-text">Subject</span>
                <span className="questions-page__summary-colon">:</span>
                <span className="body-text-1-medium">{subjectLabel}</span>
              </span>

              {/* topic */}
              <span className="questions-page__summary-row">
                <span className="caption-text">Topic</span>
                <span className="questions-page__summary-colon">:</span>
                <span className="questions-page__chip questions-page__chip--topic">
                  {getTopicLabel(test?.topics?.[0])}
                </span>
              </span>

              {/* sub topic + bottom stats */}
              <div className="questions-page__card-bottom">
                <span className="questions-page__summary-row">
                  <span className="caption-text">Sub Topic</span>
                  <span className="questions-page__summary-colon">:</span>
                  <span className="questions-page__chip questions-page__chip--subtopic">
                    {getSubTopicLabel(test?.sub_topics?.[0])}
                  </span>
                </span>
                <div className="questions-page__card-stats">
                  <span className="questions-page__card-stat">
                    ⏱ {test?.total_time ?? 60} Min
                  </span>
                  <span className="questions-page__card-stat-sep" />
                  <span className="questions-page__card-stat">
                    📋 {test?.total_questions ?? 0} Q's
                  </span>
                  <span className="questions-page__card-stat-sep" />
                  <span className="questions-page__card-stat">
                    📊 {test?.total_marks ?? 100} Marks
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showPublishModal ? (
            <PublishFlowSection
              publishMode={publishMode}
              scheduleDate={scheduleDate}
              scheduleTime={scheduleTime}
              liveUntil={liveUntil}
              endDate={endDate}
              endTime={endTime}
              saving={saving}
              onPublishModeChange={setPublishMode}
              onScheduleDateChange={setScheduleDate}
              onScheduleTimeChange={setScheduleTime}
              onLiveUntilChange={setLiveUntil}
              onEndDateChange={setEndDate}
              onEndTimeChange={setEndTime}
              onCancel={() => setShowPublishModal(false)}
              onConfirm={() => void handleSaveAndContinue()}
            />
          ) : (
            <QuestionEditorShell
              questions={questions}
              editingId={editingId}
              draft={draft}
              targetQuestionCount={targetQuestionCount}
              topics={topics}
              subTopics={subTopics}
              errorMessage={errorMessage}
              onResetDraft={resetDraft}
              onEdit={handleEdit}
              onUpdateDraft={updateDraft}
              onAddOrUpdateQuestion={handleAddOrUpdateQuestion}
              onExit={() => void handleSaveAndContinue()}
            />
          )}
        </div>
      </div>
    </section>
  );
}
