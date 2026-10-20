export const TEXT_STYLES = [
  { id: 'selling', label: 'Продающий' },
  { id: 'friendly', label: 'Дружелюбный' },
  { id: 'formal', label: 'Официальный' },
  { id: 'premium', label: 'Премиум' },
  { id: 'marketplace', label: 'Короткий для маркетплейса' },
]

const STYLE_PACKS = {
  selling: {
    label: 'Продающий',
    lead(name, items) {
      const [first, second] = items
      const opening = `${name} помогает увидеть пользу сразу. Главное преимущество — ${lower(first)}.`
      if (!second) return opening
      return `${opening} Вместе с этим — ${lower(second)}.`
    },
    closing(_name, items) {
      return `Описание можно публиковать сразу: сильные стороны названы прямо. ${toSentences(items)}`
    },
  },
  friendly: {
    label: 'Дружелюбный',
    lead(name, items) {
      const [first, second] = items
      const opening = `${name} легко вписывается в обычный рассказ о покупке. Приятная деталь — ${lower(first)}.`
      if (!second) return opening
      return `${opening} Ещё один плюс — ${lower(second)}.`
    },
    closing(_name, items) {
      return `Если говорить с покупателем прямо, достаточно честно назвать факты. ${toSentences(items)}`
    },
  },
  formal: {
    label: 'Официальный',
    lead(name, items) {
      const [first, second] = items
      const opening = `${name} подходит для каталога и витрины. Основная характеристика — ${lower(first)}.`
      if (!second) return opening
      return `${opening} Дополнительно указывается, что ${lower(second)}.`
    },
    closing(_name, items) {
      return `Сводное описание составлено по заявленным свойствам изделия. ${toSentences(items)}`
    },
  },
  premium: {
    label: 'Премиум',
    lead(name, items) {
      const [first, second] = items
      const opening = `${name} выглядит собранно и спокойно. В характере вещи — ${lower(first)}.`
      if (!second) return opening
      return `${opening} Рядом с этим — ${lower(second)}.`
    },
    closing(_name, items) {
      return `Достоинства остаются на первом плане. ${toSentences(items)}`
    },
  },
  marketplace: {
    label: 'Короткий для маркетплейса',
    lead(name, items) {
      const brief = items.slice(0, 2).map(lower).join(', ')
      return `${name}: ${brief}.`
    },
    full(_name, items, lead) {
      const bullets = items.map((item) => `• ${capitalize(stripEnd(item))}`).join('\n')
      return `${lead}\n\n${bullets}`
    },
  },
}

export function generateDescription({ name, description, style }) {
  const title = name.trim().replace(/\s+/g, ' ')
  const source = description.trim().replace(/\s+\n/g, '\n')
  const pack = STYLE_PACKS[style] || STYLE_PACKS.selling
  const strengths = pickStrengths(source)
  const lead = pack.lead(title, strengths)
  const fullText = pack.full ? pack.full(title, strengths, lead) : `${lead} ${pack.closing(title, strengths)}`

  return {
    title,
    lead,
    strengths: strengths.map((item) => capitalize(stripEnd(item))),
    fullText,
    styleId: STYLE_PACKS[style] ? style : 'selling',
    styleLabel: pack.label,
  }
}

function pickStrengths(description) {
  const raw = splitPhrases(description).flatMap(explodeLong)
  const cleaned = []
  const seen = new Set()

  for (const phrase of raw) {
    const text = phrase.replace(/\s+/g, ' ').trim()
    if (text.length < 8) continue
    const key = text.toLocaleLowerCase('ru-RU')
    if (seen.has(key)) continue
    seen.add(key)
    cleaned.push(text)
  }

  const fallback = description.replace(/\s+/g, ' ').trim()
  const pool = cleaned.length > 0 ? cleaned : fallback ? [fallback] : []
  const ranked = pool
    .map((text, index) => ({ text, index, score: scorePhrase(text) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)

  const chosen = []
  for (const item of ranked) {
    const key = item.text.toLocaleLowerCase('ru-RU')
    const overlaps = chosen.some((existing) => {
      const other = existing.toLocaleLowerCase('ru-RU')
      return other.includes(key) || key.includes(other)
    })
    if (overlaps) continue
    chosen.push(clampPhrase(item.text))
    if (chosen.length === 5) break
  }

  if (chosen.length > 0) return chosen
  return fallback ? [clampPhrase(fallback)] : ['Качество, которое стоит назвать прямо']
}

function splitPhrases(text) {
  return text
    .split(/\n+|[.;!?]+|(?<!\d),\s+(?!\d)/)
    .map((part) => part.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

function explodeLong(phrase) {
  if (phrase.length <= 160) return [phrase]
  const parts = phrase
    .split(/\s+[—–-]\s+|\s+и\s+/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 12)
  return parts.length > 1 ? parts : [phrase]
}

function scorePhrase(phrase) {
  let score = 0
  if (/\d/.test(phrase)) score += 4
  if (phrase.length >= 24 && phrase.length <= 110) score += 3
  else if (phrase.length >= 12) score += 1
  if (phrase.length > 150) score -= 2
  if (/[а-яё]/i.test(phrase)) score += 1
  return score
}

function clampPhrase(phrase, max = 180) {
  const text = phrase.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()
}

function stripEnd(value) {
  return value.replace(/[.!?…]+$/u, '').trim()
}

function capitalize(value) {
  const text = value.trim()
  if (!text) return text
  return text.charAt(0).toLocaleUpperCase('ru-RU') + text.slice(1)
}

function lower(value) {
  const text = stripEnd(value)
  if (!text) return text
  return text.charAt(0).toLocaleLowerCase('ru-RU') + text.slice(1)
}

function ensurePeriod(value) {
  const text = value.trim()
  if (!text) return text
  return /[.!?…]$/u.test(text) ? text : `${text}.`
}

function toSentences(items) {
  return items.map((item) => ensurePeriod(capitalize(stripEnd(item)))).join(' ')
}
