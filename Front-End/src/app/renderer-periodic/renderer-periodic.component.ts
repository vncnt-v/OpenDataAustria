import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

import TWEEN from '@tweenjs/tween.js';

var table = [];

var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };

@Component({
  selector: 'app-renderer-periodic',
  templateUrl: './renderer-periodic.component.html',
  styleUrls: ['./renderer-periodic.component.css']
})
export class RendererPeriodicComponent {

  static scene;
  static camera;
  static renderer;
  static controls;

  constructor() { }

  Init(data) {
    table = [];
    for (var i = 0; i < data.length; i++){
      table.push(data[i].name.substring(0,2),data[i].name,data[i].count,(i%18)+1,Math.trunc(i/18)+1);
    }
    this.setUpScene();
  }
  ngAfterViewInit(): void {
    var button = document.getElementById( 'table' );
    button.addEventListener( 'click', function ( event ) {
      RendererPeriodicComponent.transform( targets.table, 2000 );
    }, false );
    var button = document.getElementById( 'sphere' );
    button.addEventListener( 'click', function ( event ) {
      RendererPeriodicComponent.transform( targets.sphere, 2000 );
    }, false );
    var button = document.getElementById( 'helix' );
    button.addEventListener( 'click', function ( event ) {
      RendererPeriodicComponent.transform( targets.helix, 2000 );
    }, false );
    var button = document.getElementById( 'grid' );
    button.addEventListener( 'click', function ( event ) {
      RendererPeriodicComponent.transform( targets.grid, 2000 );
    }, false );
  }

  setUpScene() {
    RendererPeriodicComponent.scene = new THREE.Scene();
    // table
    for ( var i = 0; i < table.length; i += 5 ) {
      var element = document.createElement( 'div' );
      element.className = 'element';
      element.style.width = '120px';
      element.style.height = '160px';
      element.style.boxShadow = '0px 0px 12px rgba(0,255,255,0.5)';
      element.style.border = '1px solid rgba(127,255,255,0.25)';
      element.style.textAlign = 'center';
      element.style.cursor = 'default';
      element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
      var number = document.createElement( 'div' );
      number.className = 'number';
      number.style.position = 'absolute';
      number.style.top = '20px';
      number.style.right = '20px';
      number.style.fontSize = '12px';
      number.style.color = 'rgba(127,255,255,0.75)';
      number.textContent = ((i/5) + 1).toString();
      element.appendChild( number );
      var symbol = document.createElement( 'div' );
      symbol.className = 'symbol';
      symbol.style.position = 'absolute';
      symbol.style.top = '40px';
      symbol.style.left = '0px';
      symbol.style.right = '0px';
      symbol.style.fontSize = '60px';
      symbol.style.fontWeight = 'bold';
      symbol.style.color = 'rgba(255,255,255,0.75)';
      symbol.style.textShadow = '0 0 10px rgba(0,255,255,0.95)';
      symbol.textContent = table[ i ].toString();
      element.appendChild( symbol );
      var details = document.createElement( 'div' );
      details.className = 'details';
      details.style.position = 'absolute';
      details.style.bottom = '15px';
      details.style.left = '0px';
      details.style.right = '0px';
      details.style.fontSize = '12px';
      details.style.color = 'rgba(127,255,255,0.75)';
      details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
      element.appendChild( details );
      var object = new CSS3DObject( element );
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      RendererPeriodicComponent.scene.add( object );
      objects.push( object );
      //
      var object2 = new THREE.Object3D();
      object2.position.x = ( +table[ i + 3 ] * 140 ) - 1260;
      object2.position.y = - ( +table[ i + 4 ] * 180 ) + 990;
      targets.table.push( object2 );
    }
    // sphere
    var vector = new THREE.Vector3();
    for ( var i = 0, l = objects.length; i < l; i ++ ) {
      var phi = Math.acos( -1 + ( 2 * i ) / l );
      var theta = Math.sqrt( l * Math.PI ) * phi;
      var object2 = new THREE.Object3D();
      object2.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
      object2.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
      object2.position.z = 800 * Math.cos( phi );
      vector.copy( object2.position ).multiplyScalar( 2 );
      object2.lookAt( vector );
      targets.sphere.push( object2 );
    }
    // helix
    var vector = new THREE.Vector3();
    for ( var i = 0, l = objects.length; i < l; i ++ ) {
      var phi = i * 0.175 + Math.PI;
      var object2 = new THREE.Object3D();
      object2.position.x = 900 * Math.sin( phi );
      object2.position.y = - ( i * 8 ) + 450;
      object2.position.z = 900 * Math.cos( phi );
      vector.x = object2.position.x * 2;
      vector.y = object2.position.y;
      vector.z = object2.position.z * 2;
      object2.lookAt( vector );
      targets.helix.push( object2 );
    }
    // grid
    for ( var i = 0; i < objects.length; i ++ ) {
      var object2 = new THREE.Object3D();
      object2.position.x = ( ( i % 5 ) * 400 ) - 800;
      object2.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
      object2.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
      targets.grid.push( object2 );
    }

    RendererPeriodicComponent.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    RendererPeriodicComponent.camera.position.z = 3000;

    RendererPeriodicComponent.renderer =  new CSS3DRenderer;
    //renderer.setPixelRatio( window.devicePixelRatio );
    RendererPeriodicComponent.renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(RendererPeriodicComponent.renderer.domElement);

    // Add Controls
    //RendererPeriodicComponent.controls = new OrbitControls( RendererPeriodicComponent.camera, RendererPeriodicComponent.renderer.domElement );
    //controls.rotateSpeed = 0.5;
    //controls.minDistance = 500;
    //controls.maxDistance = 6000;
    //controls.addEventListener( 'change', render );
    RendererPeriodicComponent.controls = new TrackballControls( RendererPeriodicComponent.camera, RendererPeriodicComponent.renderer.domElement );
		RendererPeriodicComponent.controls.rotateSpeed = 0.5;
		RendererPeriodicComponent.controls.minDistance = 500;
		RendererPeriodicComponent.controls.maxDistance = 6000;
		RendererPeriodicComponent.controls.addEventListener( 'change', RendererPeriodicComponent.render );

    // THREE JS Resize function

    RendererPeriodicComponent.transform( targets.table, 2000);
    
    RendererPeriodicComponent.animate();
  }

  static transform( targets, duration ) {
    TWEEN.removeAll();
    for ( var i = 0; i < objects.length; i ++ ) {
    var object = objects[ i ];
    var target = targets[ i ];
    new TWEEN.Tween( object.position )
    .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
    .easing( TWEEN.Easing.Exponential.InOut )
    .start();
    new TWEEN.Tween( object.rotation )
    .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
    .easing( TWEEN.Easing.Exponential.InOut )
    .start();
    }
    new TWEEN.Tween( this )
    .to( {}, duration * 2 )
    .onUpdate( RendererPeriodicComponent.render )
    .start();
  }

  static animate() {

    requestAnimationFrame( RendererPeriodicComponent.animate );

    TWEEN.update();

    RendererPeriodicComponent.controls.update();

  }

  static render() {
    RendererPeriodicComponent.renderer.render(RendererPeriodicComponent.scene,RendererPeriodicComponent.camera);
  }
}
