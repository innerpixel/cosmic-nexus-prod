<template>
  <div ref="container" class="fixed inset-0 w-screen h-screen">
    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
      Loading Space Station...
    </div>
    <div class="absolute bottom-4 left-4 text-white space-y-2">
      <button @click="toggleView" class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        {{ isInterior ? 'Exit Station' : 'Enter Station' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const container = ref(null)
const loading = ref(true)
const isInterior = ref(false)

onMounted(() => {
  // Scene setup
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.0003)
  
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
  })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  container.value.appendChild(renderer.domElement)

  // Post-processing
  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,    // Increased strength
    0.5,    // Increased radius
    0.3     // Lower threshold for more bloom
  )
  composer.addPass(bloomPass)

  // Add orbit controls with constraints
  let controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxDistance = 100
  controls.minDistance = 10
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5

  // Create enhanced stars
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    vertexColors: true
  })

  const starsVertices = []
  const starsColors = []
  for (let i = 0; i < 15000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)

    // Random star colors (white, blue, yellow)
    const color = new THREE.Color()
    color.setHSL(Math.random() * 0.2 + 0.5, 0.8, Math.random() * 0.2 + 0.8)
    starsColors.push(color.r, color.g, color.b)
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
  starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3))
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)

  // Create enhanced space station
  const stationGroup = new THREE.Group()
  
  // Main body
  const mainBodyGeometry = new THREE.CylinderGeometry(3, 3, 12, 32)
  const stationMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x114444,
    emissiveIntensity: 0.5,
    envMapIntensity: 1
  })
  let mainBody = new THREE.Mesh(mainBodyGeometry, stationMaterial)
  stationGroup.add(mainBody)

  // Add rings around the station
  const ringGeometry = new THREE.TorusGeometry(3.5, 0.2, 16, 100)
  const ring1 = new THREE.Mesh(ringGeometry, stationMaterial)
  ring1.rotation.x = Math.PI / 2
  ring1.position.y = 3
  stationGroup.add(ring1)

  const ring2 = ring1.clone()
  ring2.position.y = -3
  stationGroup.add(ring2)

  // Add windows to each ring
  function createWindowsForRing(ring, radius) {
    const windowCount = 12
    const windowGroup = new THREE.Group()
    
    // Window material with glow
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x88ccff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    })

    // Create windows around the ring
    for (let i = 0; i < windowCount; i++) {
      const angle = (i / windowCount) * Math.PI * 2
      const windowGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.1) 
      const window = new THREE.Mesh(windowGeometry, windowMaterial)
      
      // Position window on ring - swap y and z for vertical orientation
      window.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      )
      
      // Make window face outward - adjusted for vertical orientation
      window.lookAt(
        Math.cos(angle) * (radius + 1),
        Math.sin(angle) * (radius + 1),
        0
      )

      // Add window frame - adjusted dimensions for vertical orientation
      const frameGeometry = new THREE.BoxGeometry(0.5, 1, 0.05)
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
      })
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      frame.position.copy(window.position)
      frame.rotation.copy(window.rotation)
      frame.position.z -= 0.02

      // Add point light inside window
      const light = new THREE.PointLight(0x88ccff, 0.5, 2)
      light.position.copy(window.position)
      
      windowGroup.add(frame, window, light)
    }
    
    ring.add(windowGroup)
    return windowGroup
  }

  const ringWindows = []
  const rings = [ring1, ring2]
  const ringRadii = [3.5, 3.5]
  rings.forEach((ring, i) => {
    const windows = createWindowsForRing(ring, ringRadii[i])
    ringWindows.push(windows)
  })

  // Enhanced solar panels
  const panelGeometry = new THREE.BoxGeometry(12, 0.1, 4)
  const panelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2244ff,
    metalness: 0.5,
    roughness: 0.1,
    emissive: 0x001133,
    emissiveIntensity: 0.5,
    envMapIntensity: 1
  })
  
  // Create solar panel groups with support structures
  function createSolarPanelArray(xPos) {
    const panelGroup = new THREE.Group()
    
    // Main panel
    const panel = new THREE.Mesh(panelGeometry, panelMaterial)
    
    // Support arm
    const supportGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8)
    const support = new THREE.Mesh(supportGeometry, stationMaterial)
    support.rotation.z = Math.PI / 2
    
    panelGroup.add(panel)
    panelGroup.add(support)
    panelGroup.position.x = xPos
    
    return panelGroup
  }

  const leftPanelArray = createSolarPanelArray(-8)
  const rightPanelArray = createSolarPanelArray(8)
  stationGroup.add(leftPanelArray)
  stationGroup.add(rightPanelArray)

  // Add docking ports
  function createDockingPort() {
    const portGroup = new THREE.Group()
    
    // Main port cylinder
    const portGeometry = new THREE.CylinderGeometry(1, 1, 2, 16)
    const portMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2
    })
    const port = new THREE.Mesh(portGeometry, portMaterial)
    
    // Port rings
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 8, 24)
    const ring = new THREE.Mesh(ringGeometry, portMaterial)
    ring.rotation.x = Math.PI / 2
    
    // Warning lights
    const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8)
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    })
    
    const light1 = new THREE.Mesh(lightGeometry, lightMaterial)
    light1.position.set(1.2, 0.5, 0)
    const light2 = light1.clone()
    light2.position.set(-1.2, 0.5, 0)
    
    portGroup.add(port, ring, light1, light2)
    return portGroup
  }

  // Add 4 docking ports
  const dockingPorts = []
  for(let i = 0; i < 4; i++) {
    const port = createDockingPort()
    port.rotation.y = (Math.PI / 2) * i
    port.position.set(
      Math.cos(i * Math.PI/2) * 4,
      0,
      Math.sin(i * Math.PI/2) * 4
    )
    dockingPorts.push(port)
    stationGroup.add(port)
  }

  // Create defense turret
  function createTurret() {
    const turretGroup = new THREE.Group()
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1, 8)
    const turretMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.9,
      roughness: 0.1
    })
    const base = new THREE.Mesh(baseGeometry, turretMaterial)
    
    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8)
    const barrel = new THREE.Mesh(barrelGeometry, turretMaterial)
    barrel.rotation.z = Math.PI / 2
    barrel.position.x = 1
    
    // Radar dish
    const radarGeometry = new THREE.SphereGeometry(0.3, 8, 4, 0, Math.PI)
    const radar = new THREE.Mesh(radarGeometry, turretMaterial)
    radar.rotation.x = Math.PI / 2
    radar.position.y = 0.5
    
    turretGroup.add(base, barrel, radar)
    return turretGroup
  }

  // Add defense turrets
  const turrets = []
  for(let i = 0; i < 6; i++) {
    const turret = createTurret()
    turret.position.set(
      Math.cos(i * Math.PI/3) * 3,
      4,
      Math.sin(i * Math.PI/3) * 3
    )
    turret.lookAt(new THREE.Vector3(
      Math.cos(i * Math.PI/3) * 10,
      4,
      Math.sin(i * Math.PI/3) * 10
    ))
    turrets.push(turret)
    stationGroup.add(turret)
  }

  // After creating the main station body, add interior
  const interiorGroup = new THREE.Group()

  // Interior walls
  const interiorWallGeometry = new THREE.CylinderGeometry(2.8, 2.8, 11, 32, 1, true)
  const interiorWallMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.BackSide
  })
  const interiorWalls = new THREE.Mesh(interiorWallGeometry, interiorWallMaterial)
  interiorGroup.add(interiorWalls)

  // Floor sections
  const floorGeometry = new THREE.CircleGeometry(2.8, 32)
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x111111
  })

  // Add floors every 2 units
  for (let i = -5; i <= 5; i += 2) {
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = i
    interiorGroup.add(floor)
  }

  // Add interior lights
  const interiorLights = []
  for (let i = -4; i <= 4; i += 2) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
      // Light fixture
      const fixtureGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.2)
      const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        emissive: 0x444444,
        metalness: 0.9,
        roughness: 0.1
      })
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial)
      fixture.position.set(
        2.7 * Math.cos(angle),
        i,
        2.7 * Math.sin(angle)
      )
      fixture.lookAt(new THREE.Vector3(0, i, 0))

      // Add point light
      const light = new THREE.PointLight(0xffffcc, 0.5, 3)
      light.position.copy(fixture.position)
      
      interiorGroup.add(fixture, light)
      interiorLights.push({ fixture, light })
    }
  }

  // Add computer terminals
  const terminalGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1)
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x001133,
    emissive: 0x001133,
    emissiveIntensity: 0.5
  })

  const terminals = []
  for (let i = -3; i <= 3; i += 2) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI) {
      const terminal = new THREE.Mesh(terminalGeometry, screenMaterial)
      terminal.position.set(
        2.7 * Math.cos(angle),
        i,
        2.7 * Math.sin(angle)
      )
      terminal.lookAt(new THREE.Vector3(0, i, 0))
      
      // Add blinking lights
      const lightsGroup = new THREE.Group()
      for (let j = 0; j < 6; j++) {
        const light = new THREE.Mesh(
          new THREE.CircleGeometry(0.02, 8),
          new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
            emissive: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
            emissiveIntensity: 1
          })
        )
        light.position.set(
          (j % 3) * 0.2 - 0.2,
          Math.floor(j / 3) * 0.15 - 0.15,
          0.06
        )
        lightsGroup.add(light)
      }
      terminal.add(lightsGroup)
      terminals.push(terminal)
      interiorGroup.add(terminal)
    }
  }

  // Add pipes and conduits
  const pipeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 11, 8)
  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.8,
    roughness: 0.2
  })

  for (let i = 0; i < 8; i++) {
    const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial)
    const angle = (i * Math.PI / 4)
    pipe.position.set(
      2.6 * Math.cos(angle),
      0,
      2.6 * Math.sin(angle)
    )
    interiorGroup.add(pipe)
  }

  stationGroup.add(interiorGroup)

  scene.add(stationGroup)

  // Enhanced satellite with more details
  const satelliteGroup = new THREE.Group()
  
  // Main body
  const satelliteBody = new THREE.SphereGeometry(0.8, 32, 32)
  const satelliteMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.1
  })
  const satellite = new THREE.Mesh(satelliteBody, satelliteMaterial)
  satelliteGroup.add(satellite)
  
  // Solar panels for satellite
  const satPanelGeometry = new THREE.BoxGeometry(2, 0.05, 1)
  const satPanelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2244ff,
    metalness: 0.5,
    roughness: 0.1
  })
  
  const satPanel1 = new THREE.Mesh(satPanelGeometry, satPanelMaterial)
  satPanel1.position.x = 1.5
  satelliteGroup.add(satPanel1)
  
  const satPanel2 = new THREE.Mesh(satPanelGeometry, satPanelMaterial)
  satPanel2.position.x = -1.5
  satelliteGroup.add(satPanel2)

  // Add multiple antennas
  const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8)
  const antenna1 = new THREE.Mesh(antennaGeometry, satelliteMaterial)
  antenna1.rotation.z = Math.PI / 2
  antenna1.position.x = 0.8
  satelliteGroup.add(antenna1)

  const antenna2 = new THREE.Mesh(antennaGeometry, satelliteMaterial)
  antenna2.rotation.x = Math.PI / 2
  antenna2.position.z = 0.8
  satelliteGroup.add(antenna2)

  scene.add(satelliteGroup)

  // Enhanced lighting
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
  mainLight.position.set(10, 10, 10)
  scene.add(mainLight)

  const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
  scene.add(ambientLight)

  // Add a point light to simulate sun with lens flare effect
  const sunLight = new THREE.PointLight(0xffffcc, 2, 100)
  sunLight.position.set(50, 50, 50)
  scene.add(sunLight)

  // Add subtle rim light
  const rimLight = new THREE.DirectionalLight(0x0044ff, 0.3)
  rimLight.position.set(-10, 0, -10)
  scene.add(rimLight)

  camera.position.set(20, 15, 20)
  camera.lookAt(stationGroup.position)

  // Create glowing material for accents
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 1,
    metalness: 0.9,
    roughness: 0.2
  })

  // Create accent lights for the station
  function createAccentLight() {
    const lightGroup = new THREE.Group()
    
    // Glowing ring
    const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16)
    const ring = new THREE.Mesh(ringGeometry, glowMaterial)
    
    // Center point light
    const pointLight = new THREE.PointLight(0x00ffff, 0.5, 3)
    pointLight.position.set(0, 0, 0)
    
    lightGroup.add(ring, pointLight)
    return lightGroup
  }

  // Add accent lights around the station
  const accentLights = []
  for(let i = 0; i < 12; i++) {
    const light = createAccentLight()
    const y = (i % 3 - 1) * 4  // Distribute in 3 rows
    const angle = (Math.floor(i / 3) * Math.PI / 2)  // 4 lights per row
    light.position.set(
      Math.cos(angle) * 3.5,
      y,
      Math.sin(angle) * 3.5
    )
    light.rotation.z = Math.random() * Math.PI * 2
    accentLights.push(light)
    stationGroup.add(light)
  }

  // Add glowing lines along the station
  function createGlowLine() {
    const lineGeometry = new THREE.BoxGeometry(0.1, 8, 0.1)
    const line = new THREE.Mesh(lineGeometry, glowMaterial.clone())
    line.material.emissiveIntensity = 0.7
    return line
  }

  // Add vertical glow lines
  for(let i = 0; i < 8; i++) {
    const line = createGlowLine()
    const angle = (i * Math.PI / 4)
    line.position.set(
      Math.cos(angle) * 2.8,
      0,
      Math.sin(angle) * 2.8
    )
    stationGroup.add(line)
  }

  // Add pulsing energy core
  const coreGeometry = new THREE.SphereGeometry(1, 16, 16)
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 2,
    metalness: 1,
    roughness: 0,
    transparent: true,
    opacity: 0.8
  })
  const energyCore = new THREE.Mesh(coreGeometry, coreMaterial)
  stationGroup.add(energyCore)

  // Add core light
  const coreLight = new THREE.PointLight(0x00ffff, 2, 10)
  energyCore.add(coreLight)

  // Animation variables
  let time = 0
  const satelliteOrbitRadius = 15
  const satelliteOrbitSpeed = 0.0005
  const stationRotationSpeed = 0.0002

  // Animation loop
  function animate() {
    requestAnimationFrame(animate)
    
    // Rotate space station and solar panels
    stationGroup.rotation.y += stationRotationSpeed
    leftPanelArray.rotation.x = Math.sin(time * 0.1) * 0.1
    rightPanelArray.rotation.x = Math.sin(time * 0.1) * 0.1

    // Update turret rotations - scan for threats
    turrets.forEach((turret, i) => {
      turret.rotation.y = Math.sin(time * 0.5 + i) * 0.5
    })

    // Update docking port lights
    dockingPorts.forEach((port, i) => {
      const lights = port.children.slice(2) // Get the warning lights
      lights.forEach(light => {
        light.material.emissiveIntensity = Math.sin(time * 3 + i) * 0.3 + 0.5
      })
    })

    // Animate accent lights
    accentLights.forEach((light, i) => {
      const ring = light.children[0]
      ring.rotation.z = time * 0.5
      ring.rotation.x = Math.sin(time + i) * 0.2
      
      const pointLight = light.children[1]
      pointLight.intensity = 0.3 + Math.sin(time * 2 + i) * 0.2
    })

    // Animate energy core
    energyCore.scale.setScalar(0.9 + Math.sin(time * 2) * 0.1)
    coreMaterial.emissiveIntensity = 1.5 + Math.sin(time * 3) * 0.5
    coreLight.intensity = 1.5 + Math.sin(time * 3) * 0.5

    // Animate glow lines
    stationGroup.children.forEach(child => {
      if (child.geometry && child.geometry.type === 'BoxGeometry' && 
          child.geometry.parameters.width === 0.1) {
        child.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + child.position.x) * 0.3
      }
    })

    // Animate terminal lights
    terminals.forEach(terminal => {
      terminal.children[0].children.forEach(light => {
        if (Math.random() < 0.02) {
          light.material.emissiveIntensity = Math.random()
        }
      })
    })

    // Animate interior lights
    interiorLights.forEach(({ light }) => {
      light.intensity = 0.3 + Math.sin(time * 2) * 0.1
    })

    // Animate window lights
    ringWindows.forEach(windowGroup => {
      windowGroup.children.forEach((child, index) => {
        if (child.type === 'PointLight') {
          child.intensity = 0.3 + Math.sin(time * 2 + index) * 0.2
        } else if (child.material && child.material.emissive) {
          child.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + index) * 0.2
        }
      })
    })

    // Update controls
    controls.update()

    time += 0.01
    composer.render()
  }

  function toggleView() {
    isInterior.value = !isInterior.value
    if (isInterior.value) {
      camera.position.set(0, 0, 1)
      camera.lookAt(2, 0, 0)
      controls.maxDistance = 3
      controls.minDistance = 0.5
      mainBody.material.side = THREE.BackSide
      mainBody.material.transparent = true
      mainBody.material.opacity = 0.3
    } else {
      camera.position.set(20, 15, 20)
      camera.lookAt(stationGroup.position)
      controls.maxDistance = 100
      controls.minDistance = 10
      mainBody.material.side = THREE.FrontSide
      mainBody.material.transparent = false
      mainBody.material.opacity = 1
    }
  }

  animate()
  loading.value = false

  // Enhanced window resize handler
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
    
    // Update bloom pass resolution
    const bloomPass = composer.passes[1]
    bloomPass.resolution.set(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', onWindowResize)
})
</script>

<style scoped>
.loading-overlay {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 1.2rem;
}
</style>
