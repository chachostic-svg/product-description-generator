export async function downloadCardPdf(element, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const background = readBackground(element)
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: background,
    useCORS: true,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 12
  const printableWidth = pageWidth - margin * 2
  const printableHeight = pageHeight - margin * 2
  const imgWidth = printableWidth
  const pageCanvasHeight = Math.max(1, Math.floor((printableHeight * canvas.width) / imgWidth))

  let offsetY = 0
  let page = 0

  while (offsetY < canvas.height && page < 20) {
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offsetY)
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    const context = pageCanvas.getContext('2d')
    context.fillStyle = background
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    context.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )

    const sliceMm = (sliceHeight * imgWidth) / canvas.width
    if (page > 0) pdf.addPage()
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, sliceMm, undefined, 'FAST')
    offsetY += sliceHeight
    page += 1
  }

  pdf.save(filename)
}

export function pdfFileName(title) {
  const clean = title.replace(/[\\/:*?"<>|]+/g, '').trim() || 'описание'
  return `${clean}.pdf`
}

function readBackground(element) {
  const color = getComputedStyle(element).backgroundColor
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return '#ffffff'
  return color
}
