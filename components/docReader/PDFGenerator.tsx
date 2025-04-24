import { PDFDocument } from 'pdf-lib'

interface PDFGeneratorProps {
  images: string[]
}

export const PDFGenerator = ({ images }: PDFGeneratorProps) => {
  const generatePDF = async () => {
    if (images.length === 0) return

    const pdfDoc = await PDFDocument.create()
    
    for (const imageUrl of images) {
      const response = await fetch(imageUrl)
      const imageBytes = await response.arrayBuffer()
      const image = await pdfDoc.embedJpg(imageBytes)
      
      const page = pdfDoc.addPage([image.width, image.height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (images.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Генерация PDF</h2>
      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Скачать PDF
      </button>
    </div>
  )
} 