import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteTest, getTests } from '../api/services'
import type { Test } from '../types'
import { formatDate } from '../utils/format'
import './DashboardPage.css'

export function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadTests()
  }, [])

  async function loadTests() {
    try {
      setLoading(true)
      setErrorMessage(null)
      const data = await getTests()
      setTests(data)
    } catch {
      setErrorMessage('Could not load tests.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(testId: string) {
    const confirmed = window.confirm('Delete this test? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    try {
      await deleteTest(testId)
      setTests((prev) => prev.filter((test) => test.id !== testId))
    } catch {
      setErrorMessage('Delete failed. API may not expose DELETE /tests/:id in this environment.')
    }
  }

  const filteredTests = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) {
      return tests
    }

    return tests.filter((test) => {
      const subject = String(test.subject ?? test.subject_id ?? '').toLowerCase()
      return test.name.toLowerCase().includes(query) || subject.includes(query)
    })
  }, [search, tests])

  return (
    <section className="dashboard-page">
      <div className="dashboard-page__head">
        <div>
          <p className="dashboard-page__eyebrow">Tests</p>
          <h2 className="dashboard-page__title">Dashboard</h2>
        </div>
        <Link className="dashboard-page__create-btn" to="/tests/new">
          Create New Test
        </Link>
      </div>

      <div className="dashboard-page__toolbar">
        <input
          className="dashboard-page__search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by test name or subject"
          aria-label="Search tests"
        />
      </div>

      {loading ? <p>Loading tests...</p> : null}
      {errorMessage ? <p className="dashboard-page__alert-error">{errorMessage}</p> : null}

      {!loading ? (
        <div className="dashboard-page__table-wrap">
          <table className="dashboard-page__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr>
                  <td className="dashboard-page__empty" colSpan={5}>No tests found.</td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.name}</td>
                    <td>{String(test.subject ?? test.subject_id ?? '-')}</td>
                    <td>
                      <span
                        className={`dashboard-page__status-pill ${String(test.status) === 'live' ? 'dashboard-page__status-pill--live' : 'dashboard-page__status-pill--draft'}`}
                      >
                        {String(test.status ?? 'draft')}
                      </span>
                    </td>
                    <td>{formatDate(test.created_at)}</td>
                    <td>
                      <div className="dashboard-page__actions">
                        <Link className="dashboard-page__secondary-btn" to={`/tests/${test.id}/edit`}>
                          Edit
                        </Link>
                        <Link className="dashboard-page__secondary-btn" to={`/tests/${test.id}/preview`}>
                          View
                        </Link>
                        <button
                          type="button"
                          className="dashboard-page__danger-btn"
                          onClick={() => void handleDelete(test.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
