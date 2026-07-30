interface PublishFlowSectionProps {
  publishMode: 'now' | 'schedule'
  scheduleDate: string
  scheduleTime: string
  liveUntil: 'always' | '1w' | '2w' | '3w' | '1m' | 'custom'
  endDate: string
  endTime: string
  saving: boolean
  onPublishModeChange: (mode: 'now' | 'schedule') => void
  onScheduleDateChange: (value: string) => void
  onScheduleTimeChange: (value: string) => void
  onLiveUntilChange: (value: 'always' | '1w' | '2w' | '3w' | '1m' | 'custom') => void
  onEndDateChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export function PublishFlowSection({
  publishMode,
  scheduleDate,
  scheduleTime,
  liveUntil,
  endDate,
  endTime,
  saving,
  onPublishModeChange,
  onScheduleDateChange,
  onScheduleTimeChange,
  onLiveUntilChange,
  onEndDateChange,
  onEndTimeChange,
  onCancel,
  onConfirm,
}: PublishFlowSectionProps) {
  return (
    <div className="publish-flow" role="region" aria-label="Publish settings">
      <div className="publish-flow__panel">
        <div className="publish-flow__tabs">
          <button
            type="button"
            className={`publish-flow__tab ${publishMode === 'now' ? 'publish-flow__tab--active' : ''}`}
            onClick={() => onPublishModeChange('now')}
          >
            Publish Now
          </button>
          <button
            type="button"
            className={`publish-flow__tab ${publishMode === 'schedule' ? 'publish-flow__tab--active' : ''}`}
            onClick={() => onPublishModeChange('schedule')}
          >
            Schedule Publish
          </button>
        </div>

        {publishMode === 'schedule' ? (
          <>
            <p className="publish-flow__section-title">Select Date and Time</p>
            <div className="publish-flow__row publish-flow__row--two">
              <input
                className="publish-flow__input"
                type="date"
                value={scheduleDate}
                onChange={(event) => onScheduleDateChange(event.target.value)}
              />
              <input
                className="publish-flow__input"
                type="time"
                value={scheduleTime}
                onChange={(event) => onScheduleTimeChange(event.target.value)}
              />
            </div>
          </>
        ) : null}

        <p className="publish-flow__section-title">Live Until</p>
        <p className="publish-flow__hint">Choose how long this test should remain available on the platform.</p>

        <div className="publish-flow__live-grid">
          {[
            { value: 'always', label: 'Always Available' },
            { value: '3w', label: '3 Weeks' },
            { value: '1w', label: '1 Week' },
            { value: '1m', label: '1 Month' },
            { value: '2w', label: '2 Weeks' },
            { value: 'custom', label: 'Custom Duration' },
          ].map((option) => (
            <label key={option.value} className="publish-flow__radio-option">
              <input
                type="radio"
                name="liveUntil"
                value={option.value}
                checked={liveUntil === option.value}
                onChange={() => onLiveUntilChange(option.value as typeof liveUntil)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        <div className="publish-flow__row publish-flow__row--two">
          <input
            className="publish-flow__input"
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            disabled={liveUntil !== 'custom'}
          />
          <input
            className="publish-flow__input"
            type="time"
            value={endTime}
            onChange={(event) => onEndTimeChange(event.target.value)}
            disabled={liveUntil !== 'custom'}
          />
        </div>

        <div className="publish-flow__actions">
          <button type="button" className="publish-flow__btn publish-flow__btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="publish-flow__btn publish-flow__btn--primary" disabled={saving} onClick={onConfirm}>
            {saving ? 'Publishing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
