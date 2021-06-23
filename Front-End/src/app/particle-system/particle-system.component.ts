import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import * as Stats from 'stats-js';
import { MapService } from '../services/map.service';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Vector4 } from 'three';
import { animate } from '@angular/animations';
import {HttpClient} from '@angular/common/http';

var scale;
var container;
 var stats;

let particles;
 var count = 0;

var	mouseX = 0;
var  mouseY = 0;

var	windowHalfX = window.innerWidth / 2;
var	windowHalfY = window.innerHeight / 2;
var renderer;
var camera;
var scene;
const SEPARATION = 20, AMOUNTX = 50, AMOUNTY = 50;

const numParticles = AMOUNTX * AMOUNTY;

const positions = new Float32Array( numParticles * 3 );
const scales = new Float32Array( numParticles );
var deltaX = 730;
var deltaY = 2600;
var factor = 55;

@Component({
  selector: 'app-particle-system',
  templateUrl: './particle-system.component.html',
  styleUrls: ['./particle-system.component.css']
})

export class ParticleSystemComponent implements OnInit{

  constructor(private http: HttpClient, ) { 
  }
  
  init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();

    //

    

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

      for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

        positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
        positions[ i + 1 ] = 0; // y
        positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

        scales[ j ] = 1;

        i += 3;
        j ++;

      }

    }
    const geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
				geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

				const material = new THREE.ShaderMaterial( {

					uniforms: {
						color: { value: new THREE.Color( 0xffffff ) },
					},
					vertexShader: "attribute float scale; void main() { vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = scale * ( 300.0 / - mvPosition.z ); gl_Position = projectionMatrix * mvPosition; }",
          fragmentShader: "uniform vec3 color; void main() { if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard; gl_FragColor = vec4( color, 1.0 ); }"

				} );

				//

				particles = new THREE.Points( geometry, material );
				scene.add( particles );

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				stats = new Stats();
				container.appendChild( stats.dom );

				container.style.touchAction = 'none';
				container.addEventListener( 'pointermove', this.onPointerMove );

				//

				window.addEventListener( 'resize', this.onWindowResize );

			}

      onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

      onPointerMove( event ) {

				if ( event.isPrimary === false ) return;

				mouseX = event.clientX - windowHalfX;
				mouseY = event.clientY - windowHalfY;

			}
      
  

  ngOnInit(): void {
    

    this.init();

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    this.animate2();
    document.body.appendChild( renderer.domElement );
    

  }

  animate2() {
    requestAnimationFrame( this.animate2.bind(this) );
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05+20;
    camera.lookAt( scene.position );

    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

      for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

        positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 20 ) +
                ( Math.sin( ( iy + count ) * 0.5 ) * 3 );

        //scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 10 +
                //( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 10;
                scales[ j ]=10;
        i += 3;
        j ++;

      }

    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    renderer.render( scene, camera );

    count += 0.1;
    stats.update();
    }

    getData(){
      return this.http.get('/map-data', {responseType: 'text'});
    }
  
    setUp(sceneTmp) {
      scene = sceneTmp;
      this.getData().subscribe(data =>
        this.visualizeData(data)
      );
    }
  
    visualizeData(data) {
      var obj = JSON.parse(data);
      var vectors = [];
      // austria.json
      // obj['features'][ ** BUNDENLAND ** ]['geometry']['coordinates'][ ** immer 0 außer Tirol dort 0,1 ** ][ ** KOORDINATEN INDEX **] - [0] x koodinate, [1] y koordinate
      // Ausnahe bei Tirol
      for (var i = 0; i < obj['features'].length; i++){
          for (var j = 0; j < obj['features'][i]['geometry']['coordinates'].length; j++){
              vectors=[];
              if (i != 1){
                  for (var k = 0; k < obj['features'][i]['geometry']['coordinates'][j].length; k++){
                      vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][k][1]*factor-deltaY));
                  }
              } else {
                  for (var k = 0; k < obj['features'][i]['geometry']['coordinates'][j][0].length; k++){
                      vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][0][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][0][k][1]*factor-deltaY));
                  }
              }
          }
          console.log(vectors);
      }
    }

  

  
  
}
