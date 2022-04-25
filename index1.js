import { fabric } from 'fabric'
import { Context as SVGCanvasContext } from 'svgcanvas'
const pdfjsLib = require('pdfjs-dist')
const Canvas2Svg = require('canvas2svg')
const pdfjsViewer = require('pdfjs-dist/web/pdf_viewer')
const Base64Prefix = 'data:application/pdf;base64,'
pdfjsLib.GlobalWorkerOptions.workerSrc = './build/script/pdf.worker.bundle.js'

function readBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result))
        reader.addEventListener('error', reject)
        reader.readAsDataURL(blob)
    })
}

async function loadPDFFromData(pdfData, pages) {
    pdfData = pdfData instanceof Blob ? await readBlob(pdfData) : pdfData
    const data = atob(
        pdfData.startsWith(Base64Prefix)
            ? pdfData.substring(Base64Prefix.length)
            : pdfData
    )
    // Using DocumentInitParameters object to load binary data.
    const loadingTask = pdfjsLib.getDocument({ data })
    return printPDF(loadingTask, pages)
}
async function loadPDFFromURL(pdfPath, pages) {
    const loadingTask = pdfjsLib.getDocument({ url: pdfPath })
    return printPDF(loadingTask, pages)
}
async function printPDF(loadingTask, pages) {
    return loadingTask.promise.then((pdf) => {
        const numPages = pdf.numPages
        return new Array(numPages).fill(0).map((__, i) => {
            const pageNumber = i + 1
            if (pages && pages.indexOf(pageNumber) == -1) {
                return
            }
            return pdf.getPage(pageNumber).then((page) => {
                //  retina scaling
                const viewport = page.getViewport({
                    scale: window.devicePixelRatio
                })
                // Prepare canvas using PDF page dimensions
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')
                canvas.height = viewport.height
                canvas.width = viewport.width
                const options = {
                    height: 1000, // falsy values get converted to 500
                    width: 1000, // falsy values get converted to 500
                    ctx: context, // existing Context to wrap around
                    enableMirroring: false, // whether canvas mirroring (get image data) is enabled (defaults to false)
                    document: undefined // overrides default document object
                }

                const virtualContext = new SVGCanvasContext(options)

                // console.log(context)
                // Render PDF page into canvas context
                const renderContext = {
                    canvasContext: virtualContext,
                    viewport
                }
                const renderTask = page.render(renderContext)
                return renderTask.promise.then(() => virtualContext)
            })
        })
    })
}

// async function pdfToImage(pdfData, canvas) {
//     const scale = 1 / window.devicePixelRatio
//     return (await loadPDFFromData(pdfData)).map(async (c) => {
//         const ctx = await c
//         console.log('[pdfToImage]', ctx)

//         // canvas.add(
//         //     new fabric.Image(await c, {
//         //         scaleX: scale,
//         //         scaleY: scale
//         //     })
//         // )
//     })
// }
async function pdfToImageFromURL(url, canvas) {
    const scale = 1 / window.devicePixelRatio
    return (await loadPDFFromURL(url)).map(async (c) => {
        const ctx = await c
        const svgStr = ctx.getSerializedSvg()
        fabric.loadSVGFromString(svgStr, function (objects, options) {
            const obj = fabric.util.groupSVGElements(objects, options)
            obj.scale(1.0)
            canvas.add(obj)
            console.log('[add obj]', obj)
        })
        // canvas.add(
        //     new fabric.Image(await c, {
        //         scaleX: scale,
        //         scaleY: scale
        //     })
        // )
    })
}

const canvas = new fabric.Canvas('c')
const text = new fabric.Text('Upload PDF')

// document.querySelector('input').addEventListener('change', async (e) => {
//     text.set('text', 'loading...')
//     canvas.requestRenderAll()
//     await Promise.all(pdfToImage(e.target.files[0], canvas))
//     canvas.remove(text)
// })
document.addEventListener('DOMContentLoaded', async () => {
    pdfToImageFromURL('/docs/test4.pdf', canvas)
})
