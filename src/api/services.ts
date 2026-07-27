import { apiClient } from './client'
import type {
  ApiEnvelope,
  CreateTestPayload,
  LoginResponse,
  Question,
  QuestionInput,
  Subject,
  SubTopic,
  Test,
  Topic,
  UpdateTestPayload,
} from '../types'

export async function login(userId: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', {
    userId,
    password,
  })
  return response.data.data
}

export async function getSubjects(): Promise<Subject[]> {
  const response = await apiClient.get<ApiEnvelope<Subject[]>>('/subjects')
  return response.data.data
}

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const response = await apiClient.get<ApiEnvelope<Topic[]>>(`/topics/subject/${subjectId}`)
  return response.data.data
}

export async function getSubTopicsByTopic(topicId: string): Promise<SubTopic[]> {
  const response = await apiClient.get<ApiEnvelope<SubTopic[]>>(`/sub-topics/topic/${topicId}`)
  return response.data.data
}

export async function getSubTopicsByTopics(topicIds: string[]): Promise<SubTopic[]> {
  const response = await apiClient.post<ApiEnvelope<SubTopic[]>>('/sub-topics/multi-topics', {
    topicIds,
  })
  return response.data.data
}

export async function getTests(): Promise<Test[]> {
  const response = await apiClient.get<ApiEnvelope<Test[]>>('/tests')
  return response.data.data
}

export async function getTestById(testId: string): Promise<Test> {
  const response = await apiClient.get<ApiEnvelope<Test>>(`/tests/${testId}`)
  return response.data.data
}

export async function createTest(payload: CreateTestPayload): Promise<Test> {
  const response = await apiClient.post<ApiEnvelope<Test>>('/tests', payload)
  return response.data.data
}

export async function updateTest(testId: string, payload: UpdateTestPayload): Promise<Test> {
  const response = await apiClient.put<ApiEnvelope<Test>>(`/tests/${testId}`, payload)
  return response.data.data
}

export async function deleteTest(testId: string): Promise<void> {
  await apiClient.delete(`/tests/${testId}`)
}

export async function createQuestionsBulk(questions: QuestionInput[]): Promise<Question[]> {
  const response = await apiClient.post<ApiEnvelope<Question[]>>('/questions/bulk', {
    questions,
  })
  return response.data.data
}

export async function fetchQuestionsBulk(questionIds: string[]): Promise<Question[]> {
  const response = await apiClient.post<ApiEnvelope<Question[]>>('/questions/fetchBulk', {
    question_ids: questionIds,
  })
  return response.data.data
}
