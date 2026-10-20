import { useRef, useState } from 'react'
import { TEXT_STYLES } from '../generator.js'

export default function ProductForm({ onGenerate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('selling')
  const [errors, setErrors] = useState({})
  const nameRef = useRef(null)
  const descriptionRef = useRef(null)

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Введите название продукта.'
    if (!description.trim()) nextErrors.description = 'Добавьте исходное описание товара.'
    setErrors(nextErrors)

    if (nextErrors.name) {
      nameRef.current?.focus()
      return
    }
    if (nextErrors.description) {
      descriptionRef.current?.focus()
      return
    }

    onGenerate({
      name: name.trim(),
      description: description.trim(),
      style,
    })
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="product-name">Название продукта</label>
        <input
          id="product-name"
          ref={nameRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например, керамическая кружка «Рассвет»"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'product-name-error' : undefined}
          autoComplete="off"
        />
        {errors.name && (
          <p id="product-name-error" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="product-description">Описание товара</label>
        <textarea
          id="product-description"
          ref={descriptionRef}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Объём, материалы, для кого товар и чем он удобен. Можно писать коротко, списком."
          rows={7}
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'product-description-error' : undefined}
        />
        {errors.description && (
          <p id="product-description-error" className="field-error">
            {errors.description}
          </p>
        )}
      </div>

      <fieldset className="style-fieldset">
        <legend>Стиль текста</legend>
        <div className="choice-list">
          {TEXT_STYLES.map((item) => (
            <label key={item.id} className={style === item.id ? 'choice is-selected' : 'choice'}>
              <input
                type="radio"
                name="text-style"
                value={item.id}
                checked={style === item.id}
                onChange={() => setStyle(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primary" type="submit">
        Собрать описание
      </button>
      <p className="form-note">Текст собирается в браузере из ваших фраз. Ключ и интернет не нужны.</p>
    </form>
  )
}
