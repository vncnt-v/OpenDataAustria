import { Component } from '@angular/core';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapService } from '../services/map.service';
import * as THREE from 'three';


@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent {
  module: string;
  constructor(public map: MapService) { }

  start(request) {
    const scene = new THREE.Scene();
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(2);
    const mouse = new THREE.Vector2();
    const mouse_r = new THREE.Vector2();
    mouse.x = 0;
    mouse.y = 0;
    let INTERSECTED;
    // Perspektivische Kamera mit einer Sichtweite von min 0.1 und max 10.000 sowie 50 als Krümmung der Perspektive
    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.x = 142.93;
    camera.position.y = 174.46;
    camera.position.z = 432.38;
    camera.lookAt( 0, 0, 0 );
    camera.layers.enable(2);
    var renderer =  new THREE.WebGLRenderer({antialias: true});
    // Background
    renderer.setClearColor("#050505");
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(innerWidth, innerHeight);
    //renderer.setSize(innerWidth,innerHeight);
    document.body.appendChild(renderer.domElement);
    // Add Orbit Controls
    var controls = new OrbitControls( camera, renderer.domElement );
    // Add Light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(0,-1,1);
    scene.add( directionalLight );
    // Update function
    var render = function(){
        controls.update();
        //

        raycaster.setFromCamera( mouse, camera );
        // calculate objects intersecting the picking ray
        
        const intersects = raycaster.intersectObjects( scene.children, true );
				if (intersects.length > 0 && intersects[0]) {
					if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            if (document.getElementById('info-text') != null){
              document.getElementById('info-text').innerHTML = String(intersects[0].object.userData.name+"<br>"+intersects[0].object.userData.value);
              document.getElementById('info-box').style.display = "block";
              document.getElementById('info-box').style.top = String(mouse_r.y)+"px";
              document.getElementById('info-box').style.left = String(mouse_r.x+10)+"px";
            }
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						INTERSECTED.material.emissive.setHex( 0xff0000 );
					}
				} else {
					if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
          INTERSECTED = null;
          if (document.getElementById('info-text') != null){
            document.getElementById('info-box').style.display = "none";
          }
        }
        requestAnimationFrame(render);
        renderer.render(scene,camera);
    }
    // Resize function
    window.addEventListener('resize',() => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    })
    // Raycast
    window.addEventListener( 'mousemove',(event) => {
      event.preventDefault();
      mouse_r.x = event.clientX;
      mouse_r.y = event.clientY;
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    })
    render();
    this.map.setUp(scene);
    request.setUp(scene);
  }
}
