import { useEffect, useRef, useState } from 'react'
import ProductForm from './components/ProductForm.jsx'
import Preview from './components/Preview.jsx'
import { generateDescription } from './generator.js'
import { downloadCardPdf, pdfFileName } from './pdf.js'

function readTheme() {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(readTheme)
  const [template, setTemplate] = useState('minimal')
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const cardRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  function handleGenerate(values) {
    setResult(generateDescription(values))
    setPdfError('')
    if (window.innerWidth < 960) {
      window.requestAnimationFrame(() => {
        document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  async function handleDownload() {
    if (!cardRef.current || !result) return
    setSaving(true)
    setPdfError('')
    try {
      await downloadCardPdf(cardRef.current, pdfFileName(result.title))
    } catch {
      setPdfError('Не удалось сохранить PDF. Попробуйте ещё раз.')
    } finally {
      setSaving(false)
    }
  }

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Карточка товара</p>
          <h1>Генератор описаний</h1>
          <p className="lede">
            Соберите готовый текст из названия, исходных фактов и нужного тона. Сильные стороны
            выделяются отдельно, карточку можно сохранить в PDF.
          </p>
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme(nextTheme)}
        >
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </header>

      <main className="layout">
        <ProductForm onGenerate={handleGenerate} />
        <Preview
          result={result}
          template={template}
          onTemplateChange={setTemplate}
          onDownload={handleDownload}
          saving={saving}
          pdfError={pdfError}
          cardRef={cardRef}
        />
      </main>
    </div>
  )
}
