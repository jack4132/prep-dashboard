import './TestCreationHeader.css'

export type TestCreationMode = 'chapterwise' | 'pyq' | 'mock-test'

interface TestCreationHeaderProps {
  selectedMode: TestCreationMode
  onSelectMode: (mode: TestCreationMode) => void
  showPublish?: boolean
  publishLabel?: string
  publishDisabled?: boolean
  onPublish?: () => void
}

const menuItems: Array<{ label: string; value: TestCreationMode }> = [
  { label: 'Chapterwise', value: 'chapterwise' },
  { label: 'PYQ', value: 'pyq' },
  { label: 'Mock test', value: 'mock-test' },
]

function getModeLabel(mode: TestCreationMode) {
  if (mode === 'pyq') return 'PYQ'
  if (mode === 'mock-test') return 'Mock test'
  return 'Chapterwise'
}

export function TestCreationHeader({
  selectedMode,
  onSelectMode,
  showPublish = false,
  publishLabel = 'Publish',
  publishDisabled = false,
  onPublish,
}: TestCreationHeaderProps) {
  const breadcrumbTypeLabel = getModeLabel(selectedMode)

  return (
    <>
      <div className="test-creation-header__head">
        <div className="test-creation-header__breadcrumbs" aria-label="Breadcrumb">
          <span className="test-creation-header__crumb test-creation-header__crumb--primary">Test Creation</span>
          <span className="test-creation-header__crumb-separator" aria-hidden="true">/</span>
          <span className="test-creation-header__crumb test-creation-header__crumb--secondary">Create Test</span>
          <span className="test-creation-header__crumb-separator" aria-hidden="true">/</span>
          <span className="test-creation-header__crumb test-creation-header__crumb--secondary">{breadcrumbTypeLabel}</span>
        </div>
      </div>

      <div className="test-creation-header__controls">
        <div className="test-creation-header__menu-row" aria-label="Test creation modes">
          {menuItems.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`test-creation-header__menu-item ${selectedMode === item.value ? 'test-creation-header__menu-item--active' : ''}`}
              aria-pressed={selectedMode === item.value}
              onClick={() => onSelectMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {showPublish ? (
          <button
            type="button"
            className="test-creation-header__publish-btn"
            disabled={publishDisabled}
            onClick={onPublish}
          >
            {publishLabel}
          </button>
        ) : null}
      </div>
    </>
  )
}
