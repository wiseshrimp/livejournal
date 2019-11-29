
class Home {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.testButton = document.getElementById('test')
    this.homeContainer = document.getElementById('home-container')
    this.space = null
    this.objectLoader = new THREE.OBJLoader()
    this.textureLoader = new THREE.TextureLoader()
    this.mtlLoader = new THREE.MTLLoader()
    this.objects = []
    this.loadObjects()
    this.setHomeVisibility(false)
    this.addEventListeners()
  }

  addEventListeners() {
    this.testButton.addEventListener('click', this.displayTest)
  }

  loadObjects () {
    this.mtlLoader
    .setMaterialOptions({
      invertTrProperty: true
    })
    .load(
      './capsule.mtl',
      materials => {
        materials.preload()
        this.objectLoader
        .setMaterials(materials)
        this.objectLoader.load(
          './capsule.obj',
          obj => {
            obj.scale.set(.3, .3, .3)
            obj.position.z = -1
            obj.rotation.x = -Math.PI / 2
            obj.castShadow = true
            this.objects.push(obj)
          },
          xhr => {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
          },
          err => {
            console.log(err)
          }
        )
      }
    )
  }

  displayTest = ev => {
    this.space = new Space()
    this.space.addObjects(this.objects)
    this.setHomeVisibility(true)
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

  addTestBoxes() {
    const boxWidth = 1
    const boxHeight = 1
    const boxDepth = 1
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)
    // let cubes = this.cubes = [
    //   this.addGeometry(geometry, 0x44aa88,  0),
    //   this.addGeometry(geometry, 0x8844aa, -2),
    //   this.addGeometry(geometry, 0xaa8844,  2)
    // ]
  }

  addGeometry(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color})
    const cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
    cube.position.x = x
    return cube
  }

  addObjects(objects) {
    this.objects = objects
    objects.forEach(obj => {
      this.scene.add(obj)
    })
  }

  render = time => {
    // time *= 0.001
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }

    // this.cubes.forEach((cube, ndx) => {
    //   const speed = 1 + ndx * .1
    //   const rot = time * speed
    //   cube.rotation.x = rot
    //   cube.rotation.y = rot
    // })

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render)
  }

  onClick = ev => {
    let mouse = new THREE.Vector2()
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(mouse, this.camera)
    var intersects = this.raycaster.intersectObjects(this.objects, true)
    console.log(intersects)
    for ( var i = 0; i < intersects.length; i++ ) {
      console.log(intersects[i])
  
      intersects[ i ].object.material.color.set( 0xff0000 );
  
    }
  
    this.renderer.render( this.scene, this.camera );
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
