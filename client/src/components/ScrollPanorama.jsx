import React, { useEffect, useRef } from 'react'

// ====== Equirectangular panorama on a full-screen quad.
// The ray is built in camera space, rotated by pitch then yaw, and mapped back
// onto the sphere - so widening the field of view reads as stepping further
// into the room rather than zooming a flat photograph.
const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 v_uv;
  void main() {
    v_uv = position;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform float u_yaw;
  uniform float u_pitch;
  uniform float u_fov;
  uniform float u_aspect;
  uniform float u_fade;

  #define PI 3.14159265359

  void main() {
    float tanHalfFov = tan(radians(u_fov) * 0.5);
    vec3 ray = normalize(vec3(v_uv.x * u_aspect * tanHalfFov, v_uv.y * tanHalfFov, -1.0));

    float cp = cos(u_pitch);
    float sp = sin(u_pitch);
    vec3 r1 = ray;
    ray.y = r1.y * cp - r1.z * sp;
    ray.z = r1.y * sp + r1.z * cp;

    float cy = cos(u_yaw);
    float sy = sin(u_yaw);
    vec3 r2 = ray;
    ray.x = r2.x * cy + r2.z * sy;
    ray.z = -r2.x * sy + r2.z * cy;

    ray = normalize(ray);

    float longitude = atan(ray.x, -ray.z);
    float latitude = acos(ray.y);

    vec3 room = texture2D(u_texture, vec2((longitude + PI) / (2.0 * PI), latitude / PI)).rgb;

    // A soft vignette keeps the eye in the middle of the room, where the copy sits
    float vignette = 1.0 - 0.32 * dot(v_uv, v_uv);
    room *= vignette;

    // Fade up out of the page's own ground so the room arrives rather than
    // cuts in - this has to stay in step with --color-linen
    gl_FragColor = vec4(mix(vec3(0.992, 0.984, 0.969), room, u_fade), 1.0);
  }
`

const compile = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * ScrollPanorama - a room you fall into.
 *
 * `progressRef` is a live 0..1 value the parent drives from scroll. Reading it
 * inside the render loop rather than through props keeps every frame off the
 * React render path, which is what makes the motion feel attached to the wheel.
 *
 * The reveal is written straight to `canvas.style.opacity` rather than held in
 * state. Under StrictMode the effect runs twice, and a `setReady` from the pass
 * that gets torn down is dropped - which left the canvas invisible while the
 * shader was drawing the room perfectly well behind it.
 */
const ScrollPanorama = ({ imageSrc, progressRef, interactive = false, className = '' }) => {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const dragRef = useRef({ active: false, x: 0, y: 0, yaw: 0, pitch: 0 })
  const offsetRef = useRef({ yaw: 0, pitch: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: true })
    if (!gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertex || !fragment) return

    const program = gl.createProgram()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log('panorama link failed:', gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      texture: gl.getUniformLocation(program, 'u_texture'),
      yaw: gl.getUniformLocation(program, 'u_yaw'),
      pitch: gl.getUniformLocation(program, 'u_pitch'),
      fov: gl.getUniformLocation(program, 'u_fov'),
      aspect: gl.getUniformLocation(program, 'u_aspect'),
      fade: gl.getUniformLocation(program, 'u_fade'),
    }

    // A single linen pixel stands in until the photograph arrives, so a slow
    // network shows the page's own ground rather than a dark hole
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([253, 251, 247, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // An async image load can outlive the effect, so a late callback must not
    // upload into a texture this cleanup has already deleted
    let alive = true

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (!alive) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      canvas.style.opacity = '1'
    }
    image.onerror = () => {
      console.log('panorama image failed to load:', imageSrc)
    }
    image.src = imageSrc

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio, 2)
      const { clientWidth, clientHeight } = canvas
      canvas.width = clientWidth * ratio
      canvas.height = clientHeight * ratio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const render = () => {
      const progress = progressRef?.current ?? 1

      // Far outside the room the view is narrow; entering widens it
      const fov = 42 + progress * 58
      // Arrive facing the middle of the panorama - the windows and the garden -
      // rather than the corner the tungsten lamps wash yellow
      const drift = (progress - 1) * 0.55
      const fade = Math.min(1, Math.max(0, (progress - 0.05) / 0.45))

      gl.useProgram(program)
      gl.uniform1f(uniforms.yaw, drift + offsetRef.current.yaw)
      gl.uniform1f(uniforms.pitch, offsetRef.current.pitch)
      gl.uniform1f(uniforms.fov, fov)
      gl.uniform1f(uniforms.aspect, canvas.width / Math.max(1, canvas.height))
      gl.uniform1f(uniforms.fade, fade)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(uniforms.texture, 0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frameRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      alive = false
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      gl.deleteProgram(program)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
    }
  }, [imageSrc, progressRef])

  // ====== Look around once the room has been entered
  const onPointerDown = (event) => {
    if (!interactive) return
    dragRef.current = {
      active: true,
      x: event.clientX,
      y: event.clientY,
      yaw: offsetRef.current.yaw,
      pitch: offsetRef.current.pitch,
    }
  }

  const onPointerMove = (event) => {
    if (!interactive || !dragRef.current.active) return
    const dx = event.clientX - dragRef.current.x
    const dy = event.clientY - dragRef.current.y
    offsetRef.current.yaw = dragRef.current.yaw - dx * 0.004
    // Stop short of the poles, where an equirect map smears
    offsetRef.current.pitch = Math.max(-1.1, Math.min(1.1, dragRef.current.pitch - dy * 0.004))
  }

  const endDrag = () => {
    dragRef.current.active = false
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity: 0 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className={`h-full w-full transition-opacity duration-700 ${
        interactive ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
    />
  )
}

export default ScrollPanorama
