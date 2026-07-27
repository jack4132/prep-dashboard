import axios from 'axios'

const API_BASE_URL =
  'https://admin-moderator-backend-staging.up.railway.app/api'

export const TOKEN_KEY = 'preproute_token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
