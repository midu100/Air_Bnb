import React, { useEffect, useRef, useState } from 'react'

const ThreeSixtyViewer = ({ imageSrc, className = '' }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // WebGL & render control refs
  const glRef = useRef(null)
  const programRef = useRef(null)
  const textureRef = useRef(null)
  const positionBufferRef = useRef(null)

  // Interactive state refs (to avoid frequent React state updates on mouse move)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const fovRef = useRef(75) // Default FOV in degrees
  const isDraggingRef = useRef(false)
  const startMouseRef = useRef({ x: 0, y: 0 })
  const startAngleRef = useRef({ yaw: 0, pitch: 0 })

  const defaultYaw = 0
  const defaultPitch = 0
  const defaultFov = 75

  // Shader sources
  const vsSource = `
    attribute vec2 position;
    varying vec2 v_uv;
    void main() {
      v_uv = position;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const fsSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_texture;
    uniform float u_yaw;
    uniform float u_pitch;
    uniform float u_fov;
    uniform float u_aspect;

    #define PI 3.14159265359

    void main() {
      // Calculate ray direction in camera space
      float tanHalfFov = tan(radians(u_fov) * 0.5);
      vec3 ray = vec3(v_uv.x * u_aspect * tanHalfFov, v_uv.y * tanHalfFov, -1.0);
      ray = normalize(ray);

      // Rotate pitch (X-axis)
      float cp = cos(u_pitch);
      float sp = sin(u_pitch);
      vec3 r1 = ray;
      ray.y = r1.y * cp - r1.z * sp;
      ray.z = r1.y * sp + r1.z * cp;

      // Rotate yaw (Y-axis)
      float cy = cos(u_yaw);
      float sy = sin(u_yaw);
      vec3 r2 = ray;
      ray.x = r2.x * cy + r2.z * sy;
      ray.z = -r2.x * sy + r2.z * cy;

      ray = normalize(ray);

      // Map ray to spherical coordinates
      float longitude = atan(ray.x, -ray.z); // -PI to PI
      float latitude = acos(ray.y);         // 0 to PI

      // Convert to UV coordinates
      float u = (longitude + PI) / (2.0 * PI);
      float v = latitude / PI;

      gl_FragColor = texture2D(u_texture, vec2(u, v));
    }
  `

  // Helper: Compile shader
  const compileShader = (gl, source, type) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  // Setup WebGL Program and buffer
  const initWebGL = () => {
    const canvas = canvasRef.current
    if (!canvas) return false

    // Initialize context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      console.error('WebGL not supported')
      setError(true)
      return false
    }
    glRef.current = gl

    // Compile shaders
    const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER)
    const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER)
    if (!vs || !fs) {
      setError(true)
      return false
    }

    // Link program
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      setError(true)
      return false
    }
    programRef.current = program

    // Locate variables
    program.positionLocation = gl.getAttribLocation(program, 'position')
    program.yawLocation = gl.getUniformLocation(program, 'u_yaw')
    program.pitchLocation = gl.getUniformLocation(program, 'u_pitch')
    program.fovLocation = gl.getUniformLocation(program, 'u_fov')
    program.aspectLocation = gl.getUniformLocation(program, 'u_aspect')
    program.textureLocation = gl.getUniformLocation(program, 'u_texture')

    // Create a simple full-screen quad (triangle strip)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    positionBufferRef.current = positionBuffer

    // Create Texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // Set parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    textureRef.current = texture

    return true
  }

  // Draw call
  const draw = () => {
    const gl = glRef.current
    const program = programRef.current
    const canvas = canvasRef.current
    if (!gl || !program || !canvas) return

    // Fit canvas resolution to screen layout
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    // Bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current)
    gl.enableVertexAttribArray(program.positionLocation)
    gl.vertexAttribPointer(program.positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Set uniforms
    gl.uniform1f(program.yawLocation, yawRef.current)
    gl.uniform1f(program.pitchLocation, pitchRef.current)
    gl.uniform1f(program.fovLocation, fovRef.current)
    gl.uniform1f(program.aspectLocation, canvas.width / canvas.height)

    // Bind texture
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureRef.current)
    gl.uniform1i(program.textureLocation, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  // Load image texture
  const loadTexture = (url) => {
    setLoading(true)
    setError(false)

    const img = new Image()
    img.crossOrigin = 'anonymous' // Support CORS
    img.onload = () => {
      const gl = glRef.current
      if (!gl) return

      gl.bindTexture(gl.TEXTURE_2D, textureRef.current)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

      setLoading(false)
      draw()
    }
    img.onerror = () => {
      console.error('Failed to load 360 image:', url)
      setError(true)
      setLoading(false)
    }
    img.src = url
  }

  // Initialize
  useEffect(() => {
    const success = initWebGL()
    if (success && imageSrc) {
      loadTexture(imageSrc)
    }

    // Resize observer to handle canvas dimensions changes
    const resizeObserver = new ResizeObserver(() => {
      draw()
    })
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
      const gl = glRef.current
      if (gl) {
        if (textureRef.current) gl.deleteTexture(textureRef.current)
        if (positionBufferRef.current) gl.deleteBuffer(positionBufferRef.current)
        if (programRef.current) gl.deleteProgram(programRef.current)
      }
    }
  }, [imageSrc])

  // Mouse interaction event handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true
    startMouseRef.current = { x: e.clientX, y: e.clientY }
    startAngleRef.current = { yaw: yawRef.current, pitch: pitchRef.current }
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - startMouseRef.current.x
    const dy = e.clientY - startMouseRef.current.y

    // Adjust sensitivity based on FOV (zoomed in -> slower panning)
    const sensitivity = (fovRef.current / 360) * 0.005

    yawRef.current = startAngleRef.current.yaw - dx * sensitivity
    // Clamp pitch to avoid turning completely upside down (avoid singularity)
    const pitchLimit = Math.PI / 2 - 0.08
    pitchRef.current = Math.max(-pitchLimit, Math.min(pitchLimit, startAngleRef.current.pitch + dy * sensitivity))

    draw()
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    isDraggingRef.current = true
    startMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    startAngleRef.current = { yaw: yawRef.current, pitch: pitchRef.current }
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - startMouseRef.current.x
    const dy = e.touches[0].clientY - startMouseRef.current.y

    const sensitivity = (fovRef.current / 360) * 0.007

    yawRef.current = startAngleRef.current.yaw - dx * sensitivity
    const pitchLimit = Math.PI / 2 - 0.08
    pitchRef.current = Math.max(-pitchLimit, Math.min(pitchLimit, startAngleRef.current.pitch + dy * sensitivity))

    draw()
  }

  // Mouse wheel scroll to zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const zoomFactor = 0.05
    fovRef.current = Math.max(30, Math.min(110, fovRef.current + e.deltaY * zoomFactor))
    draw()
  }

  // Button actions
  const zoomIn = () => {
    fovRef.current = Math.max(30, fovRef.current - 10)
    draw()
  }

  const zoomOut = () => {
    fovRef.current = Math.min(110, fovRef.current + 10)
    draw()
  }

  const resetView = () => {
    yawRef.current = defaultYaw
    pitchRef.current = defaultPitch
    fovRef.current = defaultFov
    draw()
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error entering fullscreen:', err)
      })
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Watch for external fullscreen changes (like Esc key press)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setTimeout(draw, 100) // Small delay to let container resize
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden bg-black flex items-center justify-center rounded-2xl md:rounded-3xl border border-gray-100 ${className}`}
      style={{ height: '100%', width: '100%', touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white z-10">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-semibold tracking-wider text-gray-200">Preparing 360° smartVIEW...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-bold text-gray-100">Failed to load smartVIEW panorama</span>
          <span className="text-xs text-gray-400 mt-1 max-w-xs">Please verify your internet connection or check if the source image is accessible.</span>
        </div>
      )}

      {/* Interactive Controls Overlay */}
      {!loading && !error && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          {/* Zoom In */}
          <button
            onClick={zoomIn}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {/* Zoom Out */}
          <button
            onClick={zoomOut}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>

          {/* Reset */}
          <button
            onClick={resetView}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Reset Angle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
            </svg>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Floating Instructions */}
      {!loading && !error && (
        <div className="absolute top-4 left-4 pointer-events-none bg-black/45 backdrop-blur-xs text-[10px] text-white px-3 py-1.5 rounded-lg border border-white/10 hidden sm:block">
          🖱️ Click + Drag to look around | 📜 Scroll to zoom
        </div>
      )}
    </div>
  )
}

export default ThreeSixtyViewer
