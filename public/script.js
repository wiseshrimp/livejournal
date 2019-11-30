
const Models = [
  {
    name: 'boobies',
    rotation: [0, Math.PI / 4, -Math.PI * 2],
    position: [0, 0, -1],
    scale: [.1, .1, .1]
  }
]
class Home {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.testButton = document.getElementById('test')
    this.homeContainer = document.getElementById('home-container')
    this.optionContainer = document.getElementById('option-container')
    this.loadingEl = document.getElementById('loading')
    this.space = null
    this.objectLoader = new THREE.OBJLoader()
    this.mtlLoader = new THREE.MTLLoader()
    this.objects = []
    this.isLoading = true
    this.renderLoading()
    this.loadObjects()
    this.setHomeVisibility(false)
    this.addEventListeners()
  }

  addEventListeners() {
    this.testButton.addEventListener('click', this.displayTest)
  }

  loadObject = (model, idx) => {
    this.mtlLoader.load(
      `./${model.name}/${model.name}.mtl`,
      materials => {
        materials.preload()
        this.objectLoader.setMaterials(materials)
        this.objectLoader.setPath(`./${model.name}`)
        this.objectLoader.load(
          `/${model.name}.obj`,
          obj => {
            obj.scale.set(...model.scale)
            obj.position.set(...model.position)
            obj.rotation.set(...model.rotation)
            obj.castShadow = true
            this.objects.push(obj)
            if (Models.length === this.objects.length) {
              this.isLoading = false
              this.renderLoading()
            }
          },
          xhr => {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
          },
          err => {
            console.log(err)
          }
        )
        })
      }

  loadObjects () {
    Models.forEach(this.loadObject)
  }

  displayTest = ev => {
    this.space = new Space()
    this.space.addObjects(this.objects)
    this.setHomeVisibility(true)
  }

  renderLoading() {
    this.optionContainer.style.display = this.isLoading ? 'none' : 'block'
    this.loadingEl.style.display = this.isLoading ? 'block' : 'none'
  }

  setHomeVisibility(isHidden) {
    this.homeContainer.style.display = isHidden ? 'none' : 'block'
    this.canvas.style.display = isHidden ? 'block' : 'none'
  }
}

class Space {
  constructor() {
    let canvas = this.canvas = document.getElementById('canvas')
    this.scene = new THREE.Scene()
    this
    this.renderer = new THREE.WebGLRenderer({
      canvas
    })
    this.renderer.shadowMap.enabled = true
    this.raycaster = new THREE.Raycaster()
    this.fov = 75
    this.aspect = 2 // Canvas default
    this.near = 0.1
    this.far = 100
    this.addEventListeners()
    this.setCamera()
    this.setControls()
    this.addLighting()
    this.setLight()
    this.addTestBoxes()
    this.addBackground()
    this.render(this.renderer)
  }

  addBackground() {
    const loader = new THREE.CubeTextureLoader()
    const texture = loader.load([
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg'
    ])
    this.scene.background = texture
  }

  addEventListeners() {
    this.canvas.addEventListener('click', this.onClick)
  }

  addLighting() {
    var light = new THREE.AmbientLight( 0x404040 ) // soft white light
    this.scene.add( light )
  }

  addObjects(objects) {
    this.objects = objects
    objects.forEach(obj => {
      this.scene.add(obj)
    })
  }

  render = time => {
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render)
  }

  onClick = ev => {
    let mouse = new THREE.Vector2()
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(mouse, this.camera)
    var intersects = this.raycaster.intersectObjects(this.objects, true)
    for ( var i = 0; i < intersects.length; i++ ) {  
      intersects[ i ].object.material.color.set( 0xff0000 ) // set intersects to red
    }
    this.renderer.render(this.scene, this.camera)
  }

  resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      this.renderer.setSize(
        width, 
        height, 
        false
      )
    }
    return needResize
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.aspect,
      this.near,
      this.far
    )
    this.camera.position.z = 3
  }

  setControls() {
    let controls = this.controls = new THREE.OrbitControls(
      this.camera, 
      this.canvas
    )
    controls.target.set(0, 0, 0)
    // Setting min and max zoom
    controls.minDistance = 1
    controls.maxDistance = 10
    controls.update()
  }

  setLight() {
    let color = 0xFFFFFF
    let intensity = 1
    let light = this.light = new THREE.DirectionalLight(color, intensity)
    light.position.set(-1, 2, 4)
    this.scene.add(light)
  }
}

let home = new Home()
