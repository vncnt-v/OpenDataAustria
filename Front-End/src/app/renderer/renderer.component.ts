import { Component, OnInit } from '@angular/core';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CoronaService } from '../services/corona.service';
import { MapService } from '../services/map.service';
import * as THREE from 'three';

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements OnInit {

  constructor(private corona: CoronaService, private map: MapService) { }

  ngOnInit(): void {
    const scene = new THREE.Scene();
    // Perspektivische Kamera mit einer Sichtweite von min 0.1 und max 10.000 sowie 50 als Krümmung der Perspektive
    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.x = 142.93;
    camera.position.y = 174.46;
    camera.position.z = 432.38;
    camera.lookAt( 0, 0, 0 );
    var renderer =  new THREE.WebGLRenderer({antialias: true});
    // Background
    renderer.setClearColor("#000000");
    renderer.setSize(window.innerWidth,window.innerHeight);
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
        requestAnimationFrame(render);
        renderer.render(scene,camera);
    }
    // Resize function
    window.addEventListener('resize',() => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    })
    render();

    this.map.setUp(scene);
    this.corona.setUp(scene);
    }
}
