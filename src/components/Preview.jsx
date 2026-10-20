import { TEMPLATES } from '../templates.js'

export default function Preview({
  result,
  template,
  onTemplateChange,
  onDownload,
  saving,
  pdfError,
  cardRef,
}) {
  return (
    <section className="preview-panel" id="preview" aria-live="polite">
      <div className="panel template-panel">
        <h2>Шаблон оформления</h2>
        <div className="template-grid" role="radiogroup" aria-label="Шаблон оформления">
          {TEMPLATES.map((item) => {
            const selected = template === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? 'template-option is-selected' : 'template-option'}
                onClick={() => onTemplateChange(item.id)}
              >
                <span className={`swatch swatch--${item.id}`} aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
              </button>
            )
          })}
        </div>
        <button className="primary" type="button" onClick={onDownload} disabled={!result || saving}>
          {saving ? 'Сохраняем…' : 'Сохранить PDF'}
        </button>
        {pdfError && <p className="field-error">{pdfError}</p>}
      </div>

      <article className={`card card--${template}`} ref={cardRef}>
        {template === 'market' && <p className="card-badge">Готово к публикации</p>}
        {result ? (
          <>
            <p className="card-kicker">{result.styleLabel}</p>
            <h2 className="card-title">{result.title}</h2>
            <div className="card-main">
              <div className="card-lead-wrap">
                <p className="card-lead">{result.lead}</p>
              </div>
              <section className="card-strengths">
                <h3>Сильные стороны</h3>
                <ul>
                  {result.strengths.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
            <section className="card-full">
              <h3>Готовое описание</h3>
              <p className="card-text">{result.fullText}</p>
            </section>
          </>
        ) : (
          <div className="card-empty">
            <p className="card-kicker">Черновик</p>
            <h2 className="card-title">Здесь появится карточка товара</h2>
            <p className="card-lead">
              Заполните название, исходное описание и стиль текста. Шаблон можно выбрать заранее.
            </p>
          </div>
        )}
      </article>
    </section>
  )
}
