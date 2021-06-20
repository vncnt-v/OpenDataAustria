import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


@Component({
  selector: 'app-renderer-particle',
  templateUrl: './renderer-particle.component.html',
  styleUrls: ['./renderer-particle.component.css']
})
export class RendererParticleComponent {

  static scene;
  static pointsGroup = new THREE.Group;

  constructor() { }

  start() {
    this.setUpScene();
  }

  setUpScene() {
    RendererParticleComponent.scene = new THREE.Scene();

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    var INTERSECTED;

    // Get Mouse Position
    const mouse_r = new THREE.Vector2();
    const mouse = new THREE.Vector2();
    mouse.x = 0;
    mouse.y = 0;

    RendererParticleComponent.scene.add( RendererParticleComponent.pointsGroup );

    // Set Camera
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 200;
    camera.layers.enable(1);

    // THREE JS Components
    var renderer =  new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#050505");
    //renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add Controls
    var controls = new OrbitControls( camera, renderer.domElement );
    // Add Light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(0,-1,1);
    RendererParticleComponent.scene.add( directionalLight );
    var render = function(){
      controls.update();

      raycaster.setFromCamera( mouse, camera );
      const intersects = raycaster.intersectObjects( RendererParticleComponent.scene.children, true );
      if (intersects.length > 0 && intersects[0]) {
        if (INTERSECTED != intersects[0].object){
          if ( INTERSECTED ) INTERSECTED.material.uniforms.color.value.setHex( INTERSECTED.currentHex );
          if (document.getElementById('info-text') != null){
            INTERSECTED = intersects[0].object;
            document.getElementById('info-text').innerHTML = String(intersects[0].object.userData.name+"<br>"+Math.ceil(intersects[0].object.userData.value));
            document.getElementById('info-box').style.display = "block";
            document.getElementById('info-box').style.top = String(mouse_r.y)+"px";
            document.getElementById('info-box').style.left = String(mouse_r.x+10)+"px";
            INTERSECTED.currentHex = INTERSECTED.material.uniforms.color.value.getHex();
            INTERSECTED.material.uniforms.color.value.setHex( 0xff0000 );
          }
        }
      } else {
        if ( INTERSECTED ) INTERSECTED.material.uniforms.color.value.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
        if (document.getElementById('info-text') != null){
          document.getElementById('info-box').style.display = "none";
        }
      }

      requestAnimationFrame(render);
      renderer.render(RendererParticleComponent.scene,camera);
    }

    // THREE JS Resize function
    window.addEventListener('resize',() => {
      renderer.setSize(window.innerWidth,window.innerHeight);
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
    })
    
    // Add mousemove event
    window.addEventListener( 'mousemove',(event) => {
      event.preventDefault();
      mouse_r.x = event.clientX;
      mouse_r.y = event.clientY;
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    })

    // 
    //RendererParticleComponent.createPoint(50);
    render();
  }

  static deletePoints() {
    RendererParticleComponent.pointsGroup.clear();
  }

  static createPoint(value: number, name: string){
    const vertices = [];
    const size = [];
    const parent_x = THREE.MathUtils.randFloatSpread( 500 );
    const parent_y = THREE.MathUtils.randFloatSpread( 500 );
    const parent_z = THREE.MathUtils.randFloatSpread( 500 );
    for ( let i = 0; i < value; i ++ ) {
      const x = THREE.MathUtils.randFloatSpread( 10 + value / 10);
      const y = THREE.MathUtils.randFloatSpread( 10 + value / 10);
      const z = THREE.MathUtils.randFloatSpread( 10 + value / 10);
      vertices.push( x+parent_x, y+parent_y, z+parent_z );
      size.push(5);
    }
    var material = new THREE.ShaderMaterial( {
      uniforms: {
        color: { value: new THREE.Color( 0xffffff ) },
      },
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader()
    } );
    if (value == 0){
      vertices.push( parent_x, parent_y, parent_z );
      size.push(8);
      material = new THREE.ShaderMaterial( {
        uniforms: {
          color: { value: new THREE.Color( 0x2ade36 ) },
        },
        vertexShader: vertexShader(),
        fragmentShader: fragmentShader()
  
      } );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'scale', new THREE.Float32BufferAttribute( size, 1 ) );
    
    const points = new THREE.Points( geometry, material );
    points.userData.name = name;
    points.userData.value = value;
    points.layers.set(1);
    this.pointsGroup.add(points);
  }
}

function vertexShader() {
  return `
  attribute float scale;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = scale * ( 300.0 / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
  `
}

function fragmentShader() {
  return `
  uniform vec3 color;
  void main() {
    if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
    gl_FragColor = vec4( color, 1.0 );
  }
  `
}