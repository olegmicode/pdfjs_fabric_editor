import 'pdfjs-dist/web/pdf_viewer.css'
import './main.css'

const pdfjsLib = require('pdfjs-dist')
const pdfjsViewer = require('pdfjs-dist/web/pdf_viewer')

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
    // eslint-disable-next-line no-alert
    alert('Please build the pdfjs-dist library using\n  `gulp dist-install`')
}
// Setting worker path to worker bundle.
pdfjsLib.GlobalWorkerOptions.workerSrc = './build/script/pdf.worker.bundle.js'

const Base64Prefix = 'data:application/pdf;base64,'
const CMAP_URL = './build/cmaps/'
const CMAP_PACKED = true

const eventBus = new pdfjsViewer.EventBus()

// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
    eventBus
})

function readBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result))
        reader.addEventListener('error', reject)
        reader.readAsDataURL(blob)
    })
}

// Loading a document.
async function loadingPDFData(pdfData) {
    return pdfData instanceof Blob ? await readBlob(pdfData) : pdfData
}
async function loadingPDFFromURL(pdfPath, container) {
    const pdfViewer = new pdfjsViewer.PDFViewer({
        container,
        eventBus,
        linkService: pdfLinkService,
        renderer: 'svg',
        textLayerMode: 0
    })
    pdfLinkService.setViewer(pdfViewer)

    eventBus.on('pagesinit', function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        pdfViewer.currentScaleValue = 'page-width'
    })

    // Loading document.
    const loadingTask = pdfjsLib.getDocument({
        url: pdfPath,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED
    })
    loadingTask.promise.then(function (pdfDocument) {
        // Document loaded, specifying document for the viewer and
        // the (optional) linkService.
        pdfViewer.setDocument(pdfDocument)
        pdfLinkService.setDocument(pdfDocument, null)
    })
}
async function loadingPDF(pdfPath, container) {
    const pdfData = await loadingPDFData(pdfPath)
    const data = atob(
        pdfData.startsWith(Base64Prefix)
            ? pdfData.substring(Base64Prefix.length)
            : pdfData
    )
    const pdfViewer = new pdfjsViewer.PDFViewer({
        container,
        eventBus,
        linkService: pdfLinkService,
        renderer: 'svg',
        textLayerMode: 0
    })
    pdfLinkService.setViewer(pdfViewer)

    eventBus.on('pagesinit', function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        pdfViewer.currentScaleValue = 'page-width'
    })

    // Loading document.
    const loadingTask = pdfjsLib.getDocument({
        data,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED
    })
    loadingTask.promise.then(function (pdfDocument) {
        // Document loaded, specifying document for the viewer and
        // the (optional) linkService.
        pdfViewer.setDocument(pdfDocument)
        pdfLinkService.setDocument(pdfDocument, null)
    })
}

// entry point
document.addEventListener('DOMContentLoaded', () => {
    const pdfFileLoader = document.getElementById('pdf-file-status')

    document
        .getElementById('pdf-file-loader')
        .addEventListener('change', async (e) => {
            pdfFileLoader.innerText = 'loading...'
            const targetFile = e.target.files[0]
            if (targetFile.type == 'application/pdf') {
                await loadingPDF(
                    targetFile,
                    document.getElementById('viewerContainer')
                )
                pdfFileLoader.innerText = 'loaded'
            } else {
                pdfFileLoader.innerText = 'failed'
            }
        })
})
