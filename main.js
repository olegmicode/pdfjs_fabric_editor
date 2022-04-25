import { fabric } from 'fabric'
import {
    documentToSVG,
    elementToSVG,
    inlineResources,
    formatXML
} from 'dom-to-svg'

const pdfjsLib = require('pdfjs-dist')
const pdfjsViewer = require('pdfjs-dist/web/pdf_viewer')
import { sampleSVGStr } from './svg'
import { sampleSVGStr1 } from './svg1'

import 'pdfjs-dist/web/pdf_viewer.css'
import './main.css'

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

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
// canvas action

const loadFabricElement = async (viewerContainer) => {
    const canvas = new fabric.Canvas('fabric-editor')
    canvas.setHeight(1000)
    canvas.setWidth(500)

    // const selector = 'g[clip-path^="url(#clippath"][clip-path$=")"]'
    // Capture specific element

    const selector = '.canvasWrapper>svg'
    await sleep(3000)

    const clips = viewerContainer.querySelectorAll(selector)

    if (clips && clips.length > 0) {
        const svgClip = clips[0]
        const svgDocument = elementToSVG(svgClip)
        // Inline external resources (fonts, images, etc) as data: URIs
        await inlineResources(svgDocument.documentElement)
        // Get SVG string
        const svgString = new XMLSerializer().serializeToString(svgDocument)
        console.log('[svgClipStr]', svgString)
        // fabric.loadSVGFromString(svgString, function (objects, options) {
        //     const obj = fabric.util.groupSVGElements(objects, options)
        //     obj.scale(1.0)
        //     canvas.add(obj)
        //     console.log('[add obj]', obj)
        // })
        // fabric.loadSVGFromURL('/docs/test4.svg', function (objects, options) {
        //     const obj = fabric.util.groupSVGElements(objects, options)
        //     obj.scale(1.0)
        //     canvas.add(obj)
        //     console.log('[test4.svg obj]', obj)
        // })

        // console.log('[loadSVGFromURL obj]', svgClip)
        // fabric.loadSVGFromURL('/docs/tiger2.svg', function (objects, options) {
        //     const obj = fabric.util.groupSVGElements(objects, options)
        //     obj.scale(1.0)
        //     canvas.add(obj)
        //     console.log('[sample.svg obj]', obj)
        // })
    }
}

// entry point
document.addEventListener('DOMContentLoaded', async () => {
    const pdfFileLoader = document.getElementById('pdf-file-status')
    const viewerContainer = document.getElementById('viewerContainer')

    // document
    //     .getElementById('pdf-file-loader')
    //     .addEventListener('change', async (e) => {
    //         pdfFileLoader.innerText = 'loading...'
    //         const targetFile = e.target.files[0]
    //         if (targetFile.type == 'application/pdf') {
    //             // await loadingPDF(
    //             //     targetFile,
    //             //     viewerContainer
    //             // )
    //             // loadFabricElement()

    //             pdfFileLoader.innerText = 'loaded'
    //         } else {
    //             pdfFileLoader.innerText = 'failed'
    //         }
    //     })

    // await loadingPDFFromURL('/docs/test4.pdf', viewerContainer)
    await loadingPDFFromURL('/docs/test1.pdf', viewerContainer)
    // await loadingPDFFromURL('/docs/sample.pdf', viewerContainer)
    loadFabricElement(viewerContainer)
})
