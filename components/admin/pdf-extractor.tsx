"use client"

import { useRef, useState, useCallback } from "react"
import { toast } from "sonner"
import { Upload, FileText, Loader2, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

interface ExtractedRoom {
  name:         string
  dimensions:  string
  area_sqm:    number | null
  wall_length: number | null
  cabinet_zones: string[]
  notes:       string
}

interface AnalysisResult {
  fileName:   string
  rooms:     ExtractedRoom[]
  summary:   string
  confidence: number
}

interface RoomOverride {
  name:         string
  dimensions:  string
  area_sqm:    number | null
  wall_length: number | null
  cabinet_zones: string[]
}

export function PDFExtractor() {
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null)

  const [file, setFile]           = useState<File | null>(null)
  const [previewPages, setPreviewPages] = useState<string[]>([]) // base64 previews
  const [selectedPage, setSelectedPage] = useState(0)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult]       = useState<AnalysisResult | null>(null)
  const [error, setError]        = useState<string | null>(null)

  // Manual overrides after AI extraction
  const [overrides, setOverrides] = useState<Record<number, Partial<RoomOverride>>>({})

  // Load PDF.js lazily (client-side only)
  const loadPdfJs = useCallback(async () => {
    if (pdfjsLib) return pdfjsLib
    const pdfjs = await import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
    setPdfjsLib(pdfjs)
    return pdfjs
  }, [pdfjsLib])

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file")
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File too large. Max 20MB.")
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
    setOverrides({})

    try {
      const pdfjs = await loadPdfJs()
      const arrayBuffer = await f.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      const pages: string[] = []
      const maxPages = Math.min(pdf.numPages, 5) // cap at 5 pages

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const scale = 1.5 // render at 1.5x for quality
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement("canvas")
        canvas.width  = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext("2d")!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport } as any).promise
        pages.push(canvas.toDataURL("image/jpeg", 0.85))
      }

      setPreviewPages(pages)
      setSelectedPage(0)
      toast.success(`Loaded ${pages.length} page${pages.length > 1 ? "s" : ""}`)
    } catch (err) {
      console.error("PDF render error", err)
      toast.error("Failed to read PDF. Try a different file.")
    }
  }, [loadPdfJs])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleExtract = useCallback(async () => {
    if (!previewPages[selectedPage]) return
    setExtracting(true)
    setError(null)

    try {
      const res = await fetch("/api/pdf-extract", {
        method: "POST",
        body: (() => {
          const fd = new FormData()
          fd.append("image", previewPages[selectedPage])
          fd.append("fileName", file?.name || "floor_plan.pdf")
          return fd
        })(),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Extraction failed")
      }
      setResult(data)
      toast.success(`Analyzed! ${data.rooms.length} room${data.rooms.length !== 1 ? "s" : ""} found`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
      toast.error(msg)
    } finally {
      setExtracting(false)
    }
  }, [previewPages, selectedPage, file])

  const sendToCalculator = useCallback((room: ExtractedRoom) => {
    // Pre-fill estimate URL with room data as query params
    const params = new URLSearchParams({
      type:     "kitchen",
      room:     room.name,
      area:     room.area_sqm?.toString() || "",
      walls:    room.wall_length?.toString() || "",
      cabinets: room.cabinet_zones.join(", "),
    })
    window.open(`/calculator?${params.toString()}`, "_blank")
    toast.info("Opening calculator with pre-filled data...")
  }, [])

  const confidenceColor = (c: number) =>
    c >= 0.8 ? "text-green-600" : c >= 0.5 ? "text-amber-600" : "text-red-600"

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">PDF Floor Plan Extractor</h2>
          <p className="text-sm text-muted-foreground">
            Upload an architectural floor plan PDF — AI extracts room dimensions and cabinet zones
          </p>
        </div>
      </div>

      {/* ── Upload Zone ── */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium">Drop a floor plan PDF here</p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse — max 5 pages analyzed, 20MB limit
        </p>
      </div>

      {/* ── Preview Strip ── */}
      {previewPages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{file?.name}</p>
            <button
              onClick={() => { setFile(null); setPreviewPages([]); setResult(null); setError(null) }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕ Clear
            </button>
          </div>

          {/* Page thumbnails */}
          {previewPages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previewPages.map((page, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPage(i)}
                  className={`flex-shrink-0 w-16 h-20 rounded border-2 overflow-hidden transition-colors ${
                    selectedPage === i ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={page} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                  <span className="text-xs block text-center bg-muted">{i + 1}</span>
                </button>
              ))}
            </div>
          )}

          {/* Main preview */}
          <div className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
            <img
              src={previewPages[selectedPage]}
              alt={`Page ${selectedPage + 1}`}
              className="w-full max-h-[500px] object-contain mx-auto"
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              {previewPages.length > 1 && (
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Page {selectedPage + 1} / {previewPages.length}
                </div>
              )}
            </div>
          </div>

          {/* Extract button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {extracting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><FileText className="w-4 h-4" /> Extract Floor Plan</>
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              Uses Claude AI vision • Results in 5–15 seconds
            </span>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Extraction failed</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {error.includes("ANTHROPIC_API_KEY") && (
              <p className="text-xs text-red-500 mt-1">
                Add <code className="bg-red-100 px-1 rounded">ANTHROPIC_API_KEY</code> to your .env.local file.
              </p>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Summary header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">{result.rooms.length} room{result.rooms.length !== 1 ? "s" : ""} detected</span>
            </div>
            <div className={`text-sm font-medium ${confidenceColor(result.confidence)}`}>
              {Math.round(result.confidence * 100)}% confidence
            </div>
          </div>

          {result.summary && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
              {result.summary}
            </p>
          )}

          {/* Rooms list */}
          <div className="space-y-3">
            {result.rooms.map((room, i) => {
              const override = overrides[i]
              const hasCabinets = (override?.cabinet_zones || room.cabinet_zones).length > 0

              return (
                <div key={i} className="border rounded-xl p-4 space-y-3">
                  {/* Room header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {override?.dimensions || room.dimensions || "Dimensions unknown"}
                        {room.area_sqm && (
                          <span className="ml-2">
                            • <span className="font-medium">{room.area_sqm.toFixed(1)} sqm</span>
                          </span>
                        )}
                        {room.wall_length && (
                          <span className="ml-2">
                            • Wall: {room.wall_length.toFixed(1)} lm
                          </span>
                        )}
                      </p>
                    </div>
                    {hasCabinets && (
                      <button
                        onClick={() => sendToCalculator({
                          ...room,
                          dimensions:  override?.dimensions || room.dimensions,
                          area_sqm:   override?.area_sqm ?? room.area_sqm,
                          wall_length: override?.wall_length ?? room.wall_length,
                          cabinet_zones: override?.cabinet_zones || room.cabinet_zones,
                        })}
                        className="flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <span>Send to Calculator</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Cabinet zones */}
                  {hasCabinets && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Cabinet Zones
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(override?.cabinet_zones || room.cabinet_zones).map((zone, zi) => (
                          <span key={zi} className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full text-sm">
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {room.notes && (
                    <p className="text-sm text-muted-foreground italic">{room.notes}</p>
                  )}

                  {/* Override panel */}
                  <details className="group">
                    <summary className="text-xs text-muted-foreground hover:text-foreground cursor-pointer list-none flex items-center gap-1">
                      <ChevronDown className="w-3 h-3 group-open:hidden" />
                      <ChevronUp className="w-3 h-3 hidden group-open:block" />
                      Override dimensions
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Dimensions</label>
                        <input
                          className="w-full border rounded px-2 py-1 text-sm"
                          defaultValue={room.dimensions}
                          onChange={(e) => setOverrides((prev) => ({
                            ...prev,
                            [i]: { ...prev[i], dimensions: e.target.value }
                          }))}
                          placeholder="e.g. 3.5m x 4.0m"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Area (sqm)</label>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-sm"
                          defaultValue={room.area_sqm ?? ""}
                          onChange={(e) => setOverrides((prev) => ({
                            ...prev,
                            [i]: { ...prev[i], area_sqm: parseFloat(e.target.value) || null }
                          }))}
                          placeholder="14.0"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">Cabinet Zones (one per line)</label>
                        <textarea
                          className="w-full border rounded px-2 py-1 text-sm"
                          rows={2}
                          defaultValue={(override?.cabinet_zones || room.cabinet_zones).join("\n")}
                          onChange={(e) => setOverrides((prev) => ({
                            ...prev,
                            [i]: {
                              ...prev[i],
                              cabinet_zones: e.target.value.split("\n").filter(Boolean)
                            }
                          }))}
                          placeholder="upper cabinets along north wall (3.5m)"
                        />
                      </div>
                    </div>
                  </details>
                </div>
              )
            })}
          </div>

          {/* Re-extract button */}
          <div className="flex justify-center">
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${extracting ? "animate-spin" : ""}`} />
              Re-extract
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
