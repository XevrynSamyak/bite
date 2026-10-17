import * as THREE from 'three'
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)
const randomNearZero = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const smoothStep = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start), 0, 1)
  return t * t * (3 - 2 * t)
}

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
function shuffle<T>(list: T[]) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

const SPARK_COLORS = ['#ffe7c2', '#fff6ea', '#ffb347', '#ff6a3d', '#f4b41a', '#a6cf6a'].map(
  hexToRgb,
)
const SEED_COLORS = ['#d9a066', '#fff1dc'].map(hexToRgb)
const DUST_COLORS = ['#ffd9a0', '#f4b41a', '#ff8a3d', '#e8452c', '#fff1dc'].map(hexToRgb)

type TextPoints = {
  spots: Float32Array
  heightToWidth: number
  canvas: HTMLCanvasElement
  inkBox: [number, number, number, number]
}

// Draw the text on a hidden canvas and give each spark one of the letter pixels to fly to.
function textToPoints(
  lines: string[],
  fontSize: number,
  fontWeight: number,
  sparkCount: number,
): TextPoints {
  const canvas = document.createElement('canvas'),
    draw = canvas.getContext('2d')!
  const lineHeight = fontSize * 1.15,
    font = `${fontWeight} ${fontSize}px "Baloo 2", sans-serif`
  draw.font = font
  draw.letterSpacing = `${fontSize * 0.06}px`
  canvas.width = Math.ceil(
    Math.max(...lines.map((line) => draw.measureText(line).width)) + fontSize,
  )
  canvas.height = Math.ceil(lineHeight * lines.length + fontSize)
  // resizing wipes the context state, so set it again
  draw.font = font
  draw.letterSpacing = `${fontSize * 0.06}px`
  draw.textBaseline = 'middle'
  draw.textAlign = 'center'
  draw.fillStyle = '#fff3e0'
  lines.forEach((line, i) => draw.fillText(line, canvas.width / 2, fontSize + i * lineHeight))

  const pixels = draw.getImageData(0, 0, canvas.width, canvas.height).data,
    letterPixels: [number, number][] = []
  let left = canvas.width,
    right = 0,
    top = canvas.height,
    bottom = 0
  for (let y = 0; y < canvas.height; y += 2)
    for (let x = 0; x < canvas.width; x += 2) {
      if (pixels[(y * canvas.width + x) * 4 + 3] < 128) continue // transparent: not part of a letter
      letterPixels.push([x, y])
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  shuffle(letterPixels)
  const width = right - left,
    middleX = (left + right) / 2,
    middleY = (top + bottom) / 2,
    spots = new Float32Array(sparkCount * 2)
  for (let i = 0; i < sparkCount; i++) {
    const [x, y] = letterPixels[i % letterPixels.length]
    spots[i * 2] = (x - middleX + randomBetween(-1, 1)) / width
    spots[i * 2 + 1] = (y - middleY + randomBetween(-1, 1)) / width
  }
  return {
    spots,
    heightToWidth: (bottom - top) / width,
    canvas,
    inkBox: [left, top, width, bottom - top],
  }
}

// Same idea for the logo, but only its darker pixels (the letters and the cookie).
function logoToPoints(logo: HTMLImageElement, sparkCount: number) {
  const canvas = document.createElement('canvas'),
    draw = canvas.getContext('2d')!
  const width = 240,
    height = Math.round((width * logo.naturalHeight) / logo.naturalWidth)
  canvas.width = width
  canvas.height = height
  draw.drawImage(logo, 0, 0, width, height)
  const pixels = draw.getImageData(0, 0, width, height).data,
    darkPixels: [number, number][] = []
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const brightness = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]
      if (pixels[i + 3] > 200 && brightness < 160) darkPixels.push([x, y])
    }
  shuffle(darkPixels)
  const spots = new Float32Array(sparkCount * 2)
  for (let i = 0; i < sparkCount; i++) {
    const [x, y] = darkPixels[i % darkPixels.length]
    spots[i * 2] = (x - width / 2 + randomBetween(-0.5, 0.5)) / width
    spots[i * 2 + 1] = (y - height / 2 + randomBetween(-0.5, 0.5)) / width
  }
  return spots
}

// Bake a glow around the image so we don't have to do it in a shader.
function glowTexture(
  source: CanvasImageSource,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  glowSize: number,
  glowColor: string,
) {
  const padding = Math.ceil(glowSize * 2),
    canvas = document.createElement('canvas'),
    draw = canvas.getContext('2d')!
  canvas.width = sourceWidth + padding * 2
  canvas.height = sourceHeight + padding * 2
  draw.shadowColor = glowColor
  draw.shadowBlur = glowSize
  draw.drawImage(
    source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    padding,
    padding,
    sourceWidth,
    sourceHeight,
  )
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return {
    texture,
    sizeWithGlow: canvas.width / sourceWidth,
    heightToWidth: canvas.height / canvas.width,
  }
}

// MOVE shaders place each particle (vertex shaders), PIXEL shaders colour it (fragment shaders).

// One round soft spark, white-hot in the middle; seeds are rotated ovals.
const PARTICLE_PIXEL_SHADER = /* glsl */ `
varying vec3 vColor; varying float vOpacity; varying float vSeedAngle;
void main() {
  vec2 point = gl_PointCoord - .5;
  if (vSeedAngle >= 0.) {
    float c = cos(vSeedAngle), s = sin(vSeedAngle);
    point = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
    float oval = length(vec2(point.x / .34, point.y / .11));
    float opacity = vOpacity * (1. - smoothstep(.75, 1.4, oval));
    if (opacity <= 0.) discard;
    gl_FragColor = vec4(vColor, opacity);
    return;
  }
  float distanceFromCentre = length(point) * 2.;
  if (distanceFromCentre > 1.) discard;
  float d = distanceFromCentre;
  float opacity = d < .14 ? 1. : d < .4 ? mix(1., .27, (d - .14) / .26) : mix(.27, 0., (d - .4) / .6);
  gl_FragColor = vec4(mix(vec3(1.), vColor, smoothstep(0., .14, d)), opacity * vOpacity);
}`

const SPARK_MOVE_SHADER = /* glsl */ `
attribute vec2 aScatteredSpot; attribute vec2 aPhraseSpot; attribute vec2 aLogoSpot;
attribute vec3 aColor; attribute float aSize; attribute float aOpacity; attribute float aTwinklePhase; attribute float aSeedAngle;
uniform vec2 uScreenSize;
uniform float uTime, uGather, uToLogo, uPhraseSolid, uLogoSolid, uPhraseWidth, uLogoWidth, uCenterY, uScrollShift, uSizeScale, uPixelRatio;
varying vec3 vColor; varying float vOpacity; varying float vSeedAngle;
void main() {
  vec2 centre = vec2(uScreenSize.x * .5, uCenterY);
  vec2 scattered = vec2(centre.x + aScatteredSpot.x * uScreenSize.x * 1.1, uScreenSize.y * .5 + uScrollShift + aScatteredSpot.y * uScreenSize.y * 1.1);
  vec2 inPhrase = centre + aPhraseSpot * uPhraseWidth;
  vec2 inLogo = centre + aLogoSpot * uLogoWidth;
  vec2 position = mix(mix(scattered, inPhrase, uGather), inLogo, uToLogo);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0., 1.);
  float twinkle = .75 + .25 * sin(uTime * 1.5 + aTwinklePhase);
  vOpacity = min(1., aOpacity * twinkle * (.55 + .45 * uGather) + .35 * uGather) * (1. - .85 * uPhraseSolid) * (1. - .9 * uLogoSolid);
  gl_PointSize = aSize * uSizeScale * (1. - .3 * uGather * (1. - uToLogo) - .2 * uToLogo) * uPixelRatio;  // smaller sparks keep letters crisp
  vColor = aColor; vSeedAngle = aSeedAngle;
}`

const EMBER_MOVE_SHADER = /* glsl */ `
attribute vec2 aStartSpot; attribute float aSpeed, aSway, aSwayPhase, aSize, aOpacity; attribute vec3 aColor;
uniform vec2 uScreenSize; uniform float uTime, uPixelRatio;
varying vec3 vColor; varying float vOpacity; varying float vSeedAngle;
void main() {
  float y = uScreenSize.y + 20. - mod(aStartSpot.y * (uScreenSize.y + 40.) + uTime * aSpeed, uScreenSize.y + 40.);
  float x = aStartSpot.x * uScreenSize.x + sin(uTime * .4 + aSwayPhase) * aSway;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, 0., 1.);
  vOpacity = aOpacity * clamp((y + 20.) / (uScreenSize.y * .7), 0., 1.);  // fade out as they rise
  gl_PointSize = aSize * 7. * uPixelRatio;
  vColor = aColor; vSeedAngle = -1.;
}`

const DUST_MOVE_SHADER = /* glsl */ `
attribute vec2 aStartSpot; attribute float aSize, aOpacity; attribute vec3 aColor;
uniform vec2 uScreenSize; uniform float uPixelRatio;
varying vec3 vColor; varying float vOpacity;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(aStartSpot * uScreenSize, 0., 1.);
  gl_PointSize = aSize * uPixelRatio; vColor = aColor; vOpacity = aOpacity;
}`
const DUST_PIXEL_SHADER = /* glsl */ `varying vec3 vColor; varying float vOpacity; void main() { gl_FragColor = vec4(vColor, vOpacity); }`

// attributes: { name: [values per particle, (i) => value] }
function makeParticles(
  count: number,
  attributes: Record<string, [number, (i: number) => number[] | number]>,
  material: THREE.ShaderMaterial,
) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)) // unused; the move shaders place them
  for (const [name, [perParticle, make]] of Object.entries(attributes)) {
    const values = new Float32Array(count * perParticle)
    for (let i = 0; i < count; i++) {
      const v = make(i)
      typeof v === 'number' ? (values[i] = v) : values.set(v, i * perParticle)
    }
    geometry.setAttribute(name, new THREE.BufferAttribute(values, perParticle))
  }
  const particles = new THREE.Points(geometry, material)
  particles.frustumCulled = false
  return particles
}

export function startHeroAnimation(canvas: HTMLCanvasElement, hero: HTMLElement, logoUrl: string) {
  const isPhone = innerWidth < 700,
    sparkCount = isPhone ? 2400 : 3600
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  })
  // pixel units with y pointing down, same as the DOM
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1)
  const screenSize = new THREE.Vector2(1, 1)
  const sharedSettings = {
    uScreenSize: { value: screenSize },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
  }

  const dust = makeParticles(
    Math.round((innerWidth * innerHeight) / 3200),
    {
      aStartSpot: [2, () => [Math.random(), Math.random()]],
      aSize: [1, () => (Math.random() < 0.1 ? 1.6 : 0.9)],
      aOpacity: [1, () => randomBetween(0.12, 0.55)],
      aColor: [3, () => DUST_COLORS[(Math.random() * DUST_COLORS.length) | 0]],
    },
    new THREE.ShaderMaterial({
      vertexShader: DUST_MOVE_SHADER,
      fragmentShader: DUST_PIXEL_SHADER,
      uniforms: sharedSettings,
      transparent: true,
      depthTest: false,
    }),
  )

  const embers = makeParticles(
    isPhone ? 60 : 120,
    {
      aStartSpot: [2, () => [Math.random(), Math.random()]],
      aSpeed: [1, () => randomBetween(10, 28)],
      aSway: [1, () => randomBetween(6, 18)],
      aSwayPhase: [1, () => randomBetween(0, 6.283)],
      aSize: [1, () => randomBetween(0.8, 2.2)],
      aOpacity: [1, () => randomBetween(0.3, 0.75)],
      aColor: [3, () => SPARK_COLORS[[2, 3, 4][(Math.random() * 3) | 0]]], // saffron, chilli or turmeric
    },
    new THREE.ShaderMaterial({
      vertexShader: EMBER_MOVE_SHADER,
      fragmentShader: PARTICLE_PIXEL_SHADER,
      uniforms: sharedSettings,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }),
  )

  const sparkSettings = {
    ...sharedSettings,
    uGather: { value: 0 },
    uToLogo: { value: 0 },
    uPhraseSolid: { value: 0 },
    uLogoSolid: { value: 0 },
    uPhraseWidth: { value: 1 },
    uLogoWidth: { value: 1 },
    uCenterY: { value: 0 },
    uScrollShift: { value: 0 },
    uSizeScale: { value: 6 },
  }
  const sparks = makeParticles(
    sparkCount,
    {
      aScatteredSpot: [2, () => [randomBetween(-0.55, 0.55), randomBetween(-0.55, 0.55)]],
      aPhraseSpot: [2, () => [randomNearZero() * 0.5, randomNearZero() * 0.12]],
      aLogoSpot: [2, () => [randomNearZero() * 0.5, randomNearZero() * 0.12]],
      aSize: [1, () => (Math.random() < 0.06 ? randomBetween(2.4, 4.2) : randomBetween(0.6, 1.8))],
      aOpacity: [1, () => randomBetween(0.35, 1)],
      aTwinklePhase: [1, () => randomBetween(0, 6.283)],
      aSeedAngle: [
        1,
        () => (Math.random() < 0.22 ? (((Math.random() * 6) | 0) * Math.PI) / 6 : -1),
      ],
      aColor: [
        3,
        () => {
          const roll = Math.random()
          return SPARK_COLORS[
            roll < 0.04
              ? 5
              : roll < 0.12
                ? 3
                : roll < 0.24
                  ? 4
                  : roll < 0.45
                    ? 2
                    : roll < 0.75
                      ? 0
                      : 1
          ]
        },
      ],
    },
    new THREE.ShaderMaterial({
      vertexShader: SPARK_MOVE_SHADER,
      fragmentShader: PARTICLE_PIXEL_SHADER,
      uniforms: sparkSettings,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  // seeds take their own colours
  const sparkColors = sparks.geometry.getAttribute('aColor') as THREE.BufferAttribute
  const seedAngles = sparks.geometry.getAttribute('aSeedAngle') as THREE.BufferAttribute
  for (let i = 0; i < sparkCount; i++) {
    if (seedAngles.getX(i) >= 0)
      sparkColors.setXYZ(i, ...(SEED_COLORS[(Math.random() * 2) | 0] as [number, number, number]))
  }

  // solid versions of the phrase and logo, drawn where their sparks land.
  // scale.y is negative (y points down) so they need DoubleSide
  const flatPicture = () => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthTest: false,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    )
    mesh.visible = false
    return mesh
  }
  const solidPhrase = flatPicture(),
    solidLogo = flatPicture()
  let phraseHeightToWidth = 0.3,
    phraseSizeWithGlow = 1,
    phrasePictureHeightToWidth = 1,
    logoSizeWithGlow = 1,
    logoPictureHeightToWidth = 1
  dust.renderOrder = 0
  embers.renderOrder = 1
  sparks.renderOrder = 2
  solidPhrase.renderOrder = 3
  solidLogo.renderOrder = 4
  scene.add(dust, embers, sparks, solidPhrase, solidLogo)

  const phraseLines = isPhone
    ? ['Beyond', 'ratings.', 'Into your', 'taste.']
    : ['Beyond ratings.', 'Into your taste.']
  const logo = new Image()
  logo.src = logoUrl
  let running = true
  Promise.all([
    document.fonts.load('800 240px "Baloo 2"').catch(() => {}),
    logo.decode().catch(() => {}),
  ]).then(() => {
    if (!running) return
    const phrase = textToPoints(phraseLines, 240, 800, sparkCount)
    ;(sparks.geometry.getAttribute('aPhraseSpot') as THREE.BufferAttribute).copyArray(
      phrase.spots,
    ).needsUpdate = true
    phraseHeightToWidth = phrase.heightToWidth
    const phraseGlow = glowTexture(phrase.canvas, ...phrase.inkBox, 28, 'rgba(255,140,40,.55)')
    const phraseMaterial = solidPhrase.material as THREE.MeshBasicMaterial
    phraseMaterial.map = phraseGlow.texture
    phraseMaterial.needsUpdate = true // rebuild the material now it has a picture
    phraseSizeWithGlow = phraseGlow.sizeWithGlow
    phrasePictureHeightToWidth = phraseGlow.heightToWidth

    if (logo.naturalWidth) {
      ;(sparks.geometry.getAttribute('aLogoSpot') as THREE.BufferAttribute).copyArray(
        logoToPoints(logo, sparkCount),
      ).needsUpdate = true
      const logoGlow = glowTexture(
        logo,
        0,
        0,
        logo.naturalWidth,
        logo.naturalHeight,
        52,
        'rgba(255,140,40,.45)',
      )
      const logoMaterial = solidLogo.material as THREE.MeshBasicMaterial
      logoMaterial.map = logoGlow.texture
      logoMaterial.needsUpdate = true
      logoSizeWithGlow = logoGlow.sizeWithGlow
      logoPictureHeightToWidth = logoGlow.heightToWidth
    }
  })

  let screenWidth = 0,
    screenHeight = 0
  function resize() {
    screenWidth = innerWidth
    screenHeight = innerHeight
    const pixelRatio = Math.min(devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(screenWidth, screenHeight, false)
    camera.right = screenWidth
    camera.bottom = screenHeight
    camera.updateProjectionMatrix()
    screenSize.set(screenWidth, screenHeight)
    sharedSettings.uPixelRatio.value = pixelRatio
    sparkSettings.uSizeScale.value = 6 * (0.6 + 0.4 * Math.min(1, screenWidth / 1000))
  }
  addEventListener('resize', resize)
  resize()

  let nextFrame = 0
  function drawFrame(now: number) {
    nextFrame = requestAnimationFrame(drawFrame)
    if (!screenWidth || !screenHeight) return

    const heroBox = hero.getBoundingClientRect(),
      scrollableHeight = heroBox.height - screenHeight
    const scrollProgress = scrollableHeight > 0 ? clamp(-heroBox.top / scrollableHeight, 0, 1) : 1
    const scrollShift = Math.min(0, heroBox.bottom - screenHeight)
    const heroOffScreen = scrollShift < -screenHeight * 1.3
    hero.style.setProperty('--scroll-progress', scrollProgress.toFixed(3))
    sharedSettings.uTime.value = reduceMotion ? 0 : now / 1000

    // animation stages
    const gather = smoothStep(0, 0.26, scrollProgress)
    const phraseSolid =
      smoothStep(0.26, 0.34, scrollProgress) * (1 - smoothStep(0.47, 0.54, scrollProgress))
    const toLogo = smoothStep(0.54, 0.8, scrollProgress) // phrase -> logo
    const logoSolid = smoothStep(0.8, 0.88, scrollProgress) // the real logo fades in

    const phraseWidth = Math.min(
      screenWidth * 0.86,
      1000,
      (screenHeight * 0.58) / phraseHeightToWidth,
    )
    const logoWidth = Math.min(screenWidth * 0.62, screenHeight * 0.52, 440)
    const centerY = screenHeight * 0.44 + scrollShift
    sparkSettings.uGather.value = gather
    sparkSettings.uToLogo.value = toLogo
    sparkSettings.uPhraseSolid.value = phraseSolid
    sparkSettings.uLogoSolid.value = logoSolid
    sparkSettings.uPhraseWidth.value = phraseWidth
    sparkSettings.uLogoWidth.value = logoWidth
    sparkSettings.uCenterY.value = centerY
    sparkSettings.uScrollShift.value = scrollShift
    sparks.visible = !heroOffScreen

    const phraseMaterial = solidPhrase.material as THREE.MeshBasicMaterial
    solidPhrase.visible = !heroOffScreen && phraseSolid > 0 && !!phraseMaterial.map
    if (solidPhrase.visible) {
      phraseMaterial.opacity = phraseSolid
      solidPhrase.position.set(screenWidth / 2, centerY, 0)
      solidPhrase.scale.set(
        phraseWidth * phraseSizeWithGlow,
        -phraseWidth * phraseSizeWithGlow * phrasePictureHeightToWidth,
        1,
      ) // negative: y goes down
    }
    const logoMaterial = solidLogo.material as THREE.MeshBasicMaterial
    solidLogo.visible = !heroOffScreen && logoSolid > 0 && !!logoMaterial.map
    if (solidLogo.visible) {
      logoMaterial.opacity = logoSolid
      solidLogo.position.set(screenWidth / 2, centerY, 0)
      solidLogo.scale.set(
        logoWidth * logoSizeWithGlow,
        -logoWidth * logoSizeWithGlow * logoPictureHeightToWidth,
        1,
      )
    }
    renderer.render(scene, camera)
  }
  nextFrame = requestAnimationFrame(drawFrame)

  // cleanup for when React unmounts the hero
  return () => {
    running = false
    cancelAnimationFrame(nextFrame)
    removeEventListener('resize', resize)
    scene.traverse((object) => {
      if (object instanceof THREE.Points || object instanceof THREE.Mesh) {
        object.geometry.dispose()
        const material = object.material as THREE.Material & { map?: THREE.Texture | null }
        material.map?.dispose()
        material.dispose()
      }
    })
    renderer.dispose()
  }
}
