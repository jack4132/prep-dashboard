import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/services'
import { useAuthStore } from '../store/authStore'

const loginSchema = z.object({
  userId: z.string().min(2, 'User ID required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: 'vedant-admin',
      password: 'vedant123',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      const data = await login(values.userId, values.password)
      setAuth(data.token, data.user)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage('Login failed. Check credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">Admin Access</p>
        <h2>Login</h2>
        <p className="muted">Manage tests, questions, and publishing from single dashboard.</p>

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          <label>
            User ID
            <input type="text" {...register('userId')} placeholder="Enter user ID" />
            {errors.userId ? <span className="field-error">{errors.userId.message}</span> : null}
          </label>

          <label>
            Password
            <input type="password" {...register('password')} placeholder="Enter password" />
            {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
          </label>

          {errorMessage ? <p className="alert-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  )
}
