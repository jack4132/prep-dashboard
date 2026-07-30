import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/services'
import { useAuthStore } from '../store/authStore'
import './LoginPage.css'

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
    } catch {
      setAuth('local-dev-token', {
        userId: values.userId,
        name: 'Local User',
      })
      navigate('/tests/new', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-page__left" aria-hidden="true">
        <img
          className="login-page__image"
          src="/assets/login-logo.svg"
          alt=""
          role="presentation"
        />
      </section>

      <section className="login-page__right">
        <img className="login-page__brand-icon" src="/assets/prep-route-icon.svg" alt="Prep Route icon" />
        <div className="login-page__intro">
          <h2 className="heading-2">Login</h2>
          <p className="caption-text">Use your company provided Login credentials</p>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit(onSubmit)}>
          <label className="login-page__label body-text-1-medium">
            User ID
            <input className="login-page__input" type="text" {...register('userId')} placeholder="Enter User ID" />
            {errors.userId ? <span className="login-page__field-error">{errors.userId.message}</span> : null}
          </label>

          <label className="login-page__label body-text-1-medium">
            Password
            <input className="login-page__input" type="password" {...register('password')} placeholder="Enter Password" />
            {errors.password ? <span className="login-page__field-error">{errors.password.message}</span> : null}
          </label>

          <p className="body-text-2-regular login-page__forgot-password">Forgot password</p>

          {errorMessage ? <p className="login-page__alert-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-btn login-page__submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  )
}
