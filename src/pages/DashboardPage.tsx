import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteTest, getTests } from '../api/services'
import type { Test } from '../types'
import { formatDate } from '../utils/format'

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
    <section className="page-card">
      <div className="page-head">
        <div>
          <p className="eyebrow">Tests</p>
          <h2>Dashboard</h2>
        </div>
        <Link className="primary-btn" to="/tests/new">
          Create New Test
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by test name or subject"
          aria-label="Search tests"
        />
      </div>

      {loading ? <p>Loading tests...</p> : null}
      {errorMessage ? <p className="alert-error">{errorMessage}</p> : null}

      {!loading ? (
        <div className="table-wrap">
          <table>
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
                  <td colSpan={5}>No tests found.</td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.name}</td>
                    <td>{String(test.subject ?? test.subject_id ?? '-')}</td>
                    <td>
                      <span className={`status-pill ${String(test.status) === 'live' ? 'live' : 'draft'}`}>
                        {String(test.status ?? 'draft')}
                      </span>
                    </td>
                    <td>{formatDate(test.created_at)}</td>
                    <td>
                      <div className="action-row">
                        <Link className="secondary-btn" to={`/tests/${test.id}/edit`}>
                          Edit
                        </Link>
                        <Link className="secondary-btn" to={`/tests/${test.id}/preview`}>
                          View
                        </Link>
                        <button
                          type="button"
                          className="danger-btn"
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
