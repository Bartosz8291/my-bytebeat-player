let audioCtx = null
let scriptNode = null
let isPlaying = false

const formulaEl = document.getElementById("formula")
const sampleRateEl = document.getElementById("sampleRate")
const playBtn = document.getElementById("play")
const stopBtn = document.getElementById("stop")
const statusEl = document.getElementById("status")
const errorEl = document.getElementById("error")
const presetsEl = document.getElementById("presets")
const toggleThemeBtn = document.getElementById("toggleTheme")
const waveformCanvas = document.getElementById("waveform")
const ctx = waveformCanvas.getContext("2d")

let t = 0
let waveformData = []

function compileFormula(formula) {
  try {
    const fn = new Function("t", `return ${formula};`)
    fn(0) // test run
    errorEl.textContent = ""
    return fn
  } catch (e) {
    errorEl.textContent = "Formula error: " + e.message
    return () => 0
  }
}

function start() {
  if (isPlaying) return
  t = 0
  const sampleRateKhz = Math.min(Math.max(parseInt(sampleRateEl.value, 10) || 8, 1), 48)
  audioCtx = new AudioContext({ sampleRate: sampleRateKhz * 1000 })

  const bufferSize = 4096
  const fn = compileFormula(formulaEl.value.trim())

  scriptNode = audioCtx.createScriptProcessor(bufferSize, 0, 1)
  scriptNode.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0)
    waveformData = []
    for (let i = 0; i < bufferSize; i++) {
      const val = fn(t) & 0xff
      output[i] = val / 128 - 1
      waveformData.push(output[i])
      t++
    }
    drawWaveform()
  }

  scriptNode.connect(audioCtx.destination)
  isPlaying = true
  statusEl.textContent = `Status: Playing @ ${sampleRateKhz} kHz`
}

function stop() {
  if (!isPlaying) return
  scriptNode?.disconnect()
  audioCtx?.close()
  scriptNode = null
  audioCtx = null
  isPlaying = false
  statusEl.textContent = "Status: Stopped"
  clearWaveform()
}

function drawWaveform() {
  const w = waveformCanvas.width
  const h = waveformCanvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = getComputedStyle(document.body).color

  const step = Math.max(1, Math.floor(waveformData.length / w))

  for (let i = 0; i < w; i++) {
    const v = waveformData[i * step] || 0
    const y = (1 - (v + 1) / 2) * h
    if (i === 0) ctx.moveTo(i, y)
    else ctx.lineTo(i, y)
  }

  ctx.stroke()
}

function clearWaveform() {
  ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height)
}

playBtn.addEventListener("click", () => {
  if (audioCtx?.state === "suspended") audioCtx.resume()
  start()
})

stopBtn.addEventListener("click", stop)

presetsEl.addEventListener("change", () => {
  formulaEl.value = presetsEl.value
  errorEl.textContent = ""
})

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light")
  drawWaveform()
})

clearWaveform()
