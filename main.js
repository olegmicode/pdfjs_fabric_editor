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

const CMAP_URL = './build/cmaps/'
const CMAP_PACKED = true

const eventBus = new pdfjsViewer.EventBus()

// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
    eventBus
})

// Loading a document.
function loadingPDF(pdfPath, container) {
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
document.addEventListener('DOMContentLoaded', () => {
    loadingPDF('/docs/sample.pdf', document.getElementById('viewerContainer'))
})
