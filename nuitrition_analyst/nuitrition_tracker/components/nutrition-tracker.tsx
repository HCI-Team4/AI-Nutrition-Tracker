"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Camera, Upload, Sparkles, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type InputMode = "select" | "camera" | "preview"

interface AnalysisResult {
  food: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function NutritionTracker() {
  const [mode, setMode] = useState<InputMode>("select")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setMode("camera")
    } catch (error) {
      console.error("[v0] Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setImagePreview(url)
        setCapturedImage(blob)
        stopCamera()
        setMode("preview")
      }
    }, "image/png")
  }, [stopCamera])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Convert to PNG
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              setImagePreview(url)
              setCapturedImage(blob)
              setMode("preview")
            }
          }, "image/png")
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  // Analyze food (mock API call)
  const analyzeFood = useCallback(async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock analysis result
    const mockResult: AnalysisResult = {
      food: "Grilled Chicken Salad",
      calories: 385,
      protein: 42,
      carbs: 18,
      fat: 15,
    }

    setAnalysisResult(mockResult)
    setIsAnalyzing(false)

    console.log("[v0] Image blob ready for API:", capturedImage)
  }, [capturedImage])

  // Reset to initial state
  const reset = useCallback(() => {
    stopCamera()
    setMode("select")
    setImagePreview(null)
    setCapturedImage(null)
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }, [stopCamera])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <header className="px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">{"NutriScan AI"}</h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            {
              "Snap a photo of your meal and instantly track calories, protein, carbs, and fats with AI-powered analysis"
            }
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden shadow-xl">
            {/* Select Mode */}
            {mode === "select" && (
              <div className="p-8 md:p-12 space-y-6">
                <h2 className="text-2xl font-semibold text-center mb-8">{"Choose how to capture your food"}</h2>

                <div className="grid gap-4 md:gap-6">
                  <Button size="lg" className="h-auto py-6 text-lg rounded-2xl" onClick={startCamera}>
                    <Camera className="w-6 h-6 mr-3" />
                    {"Take a Photo"}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-auto py-6 text-lg rounded-2xl border-2 bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 mr-3" />
                    {"Upload a Photo"}
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    {"Our AI works best with clear, well-lit photos of your meals"}
                  </p>
                </div>
              </div>
            )}

            {/* Camera Mode */}
            {mode === "camera" && (
              <div className="relative bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-center gap-4">
                    <Button size="lg" variant="outline" className="rounded-full bg-transparent" onClick={reset}>
                      <X className="w-5 h-5 mr-2" />
                      {"Cancel"}
                    </Button>

                    <Button size="lg" className="rounded-full px-8" onClick={capturePhoto}>
                      <Camera className="w-5 h-5 mr-2" />
                      {"Capture"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Mode */}
            {mode === "preview" && imagePreview && (
              <div className="space-y-6 p-6 md:p-8">
                {/* Image Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Food preview"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>

                {/* Analysis Result */}
                {analysisResult && !isAnalyzing && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{analysisResult.food}</h3>
                        <p className="text-sm text-muted-foreground">{"Nutrition breakdown"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">{"Calories"}</p>
                        <p className="text-2xl font-bold text-primary">{analysisResult.calories}</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">{"Protein"}</p>
                        <p className="text-2xl font-bold text-accent">{`${analysisResult.protein}g`}</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">{"Carbs"}</p>
                        <p className="text-2xl font-bold text-chart-3">{`${analysisResult.carbs}g`}</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">{"Fat"}</p>
                        <p className="text-2xl font-bold text-chart-4">{`${analysisResult.fat}g`}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  {!analysisResult && (
                    <Button size="lg" className="rounded-xl" onClick={analyzeFood} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {"Analyzing..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {"Analyze Food"}
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant={analysisResult ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={reset}
                  >
                    {analysisResult ? "Scan Another Meal" : "Cancel"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{"Instant Scanning"}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{"Capture or upload any meal photo"}</p>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{"AI-Powered"}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{"Advanced recognition technology"}</p>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{"Track Everything"}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{"Calories, macros, and more"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
