import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import TWEEN from '@tweenjs/tween.js';

var table = [];
var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };
var katalog_items_json;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  static scene;
  static camera;
  static renderer;
  static controls;
  static cameraPosition;
  searchTerm: string;

  constructor(private http: HttpClient, private router: Router) { 
  }

  ngOnInit(): void {
    this.setUp()
  }

  setUp() {
    //.get('/nodejs/open-data-wfs-katalog', {responseType: 'text'});
    this.http
      .get('/open-data-wfs-katalog', {responseType: 'text'})
      .subscribe(
        data => this.setKatalogItemJson(data),
        error => this.showError()
    );
  }

  showError() {
    document.getElementById("loader").classList.add("hide");
    document.getElementById("error").classList.remove("hide");
  }

  search(): void {
    if (katalog_items_json['result']['results'].length <= 0) {
      return;
    }
    document.getElementById("loader").classList.remove("hide");
    document.getElementById("menu").classList.add("hide");
    document.getElementById("error").classList.add("hide");
    for( var i = HomeComponent.scene.children.length - 1; i >= 0; i--) { 
      var obj = HomeComponent.scene.children[i];
      HomeComponent.scene.remove(obj); 
    }
    HomeComponent.controls.reset();
    if (this.searchTerm == null || this.searchTerm == "" || this.searchTerm == " ") {
      var result = [];
      for( var i = 0; i < katalog_items_json['result']['results'].length - 1; i++) {
        result.push( katalog_items_json['result']['results'][i] );
      }
      this.show(result);
    } else {
      var result = [];
      for( var i = 0; i < katalog_items_json['result']['results'].length - 1; i++) {
          var el = katalog_items_json['result']['results'][i]['title'];
          if( el.toLowerCase().includes(this.searchTerm.toLowerCase()) ) {
              result.push( katalog_items_json['result']['results'][i] );
          }
      }
      this.show(result);
    } 
    this.createVisualisation();
    document.getElementById("loader").classList.add("hide");
    document.getElementById("menu").classList.remove("hide");
  }

  setKatalogItemJson(data) {
    katalog_items_json = JSON.parse(data);
    var result = [];
    for( var i = 0; i < katalog_items_json['result']['results'].length - 1; i++) {
      result.push( katalog_items_json['result']['results'][i] );
    }
    this.show(result);
    this.setUpScene();
    document.getElementById("loader").classList.add("hide");
    document.getElementById("menu").classList.remove("hide");
  }
  show(data){
    table = [];
    objects = [];
    targets = { table: [], sphere: [], helix: [], grid: [] };
    var counter = 0;
    for( var i = 0; i < data.length - 1; i++) {
      var url = "";
      for (var j = 0; j < data[i]['resources'].length; j++){
        if (data[i]['resources'][j].format.toLowerCase() == "json" || data[i]['resources'][j].format.toLowerCase() == ".csv" || data[i]['resources'][j].format.toLowerCase() == "json (wfs)"){
          url = data[i]['resources'][j].url;
          break;
        }
      }
      table.push(data[i]['title'].substring(0,2),data[i]['title'],counter,(counter%6)+1,Math.trunc(counter/6)+1,url);
      counter++;
    }
  }

  ngAfterViewInit(): void {
    var button = document.getElementById( 'table' );
    button.addEventListener( 'click', function ( event ) {
      HomeComponent.transform( targets.table, 2000 );
    }, false );
    var button = document.getElementById( 'sphere' );
    button.addEventListener( 'click', function ( event ) {
      HomeComponent.transform( targets.sphere, 2000 );
    }, false );
    var button = document.getElementById( 'helix' );
    button.addEventListener( 'click', function ( event ) {
      HomeComponent.transform( targets.helix, 2000 );
    }, false );
    var button = document.getElementById( 'grid' );
    button.addEventListener( 'click', function ( event ) {
      HomeComponent.transform( targets.grid, 2000 );
    }, false );
  }

  setUpScene() {
    HomeComponent.scene = new THREE.Scene();
    this.createVisualisation();
    HomeComponent.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    HomeComponent.cameraPosition = HomeComponent.camera.position;
    HomeComponent.camera.position.z = 3000;
    HomeComponent.renderer = new CSS3DRenderer;
    //HomeComponent.renderer.setPixelRatio( window.devicePixelRatio );
    HomeComponent.renderer.setSize(innerWidth, innerHeight);
    document.getElementById('container').appendChild(HomeComponent.renderer.domElement);
    HomeComponent.controls = new TrackballControls( HomeComponent.camera, HomeComponent.renderer.domElement );
		HomeComponent.controls.rotateSpeed = 0.5;
		HomeComponent.controls.minDistance = 500;
		HomeComponent.controls.maxDistance = 20000;
		HomeComponent.controls.addEventListener( 'change', HomeComponent.render );
    // THREE JS Resize function
    window.addEventListener('resize',() => {
      HomeComponent.renderer.setSize(window.innerWidth,window.innerHeight);
      HomeComponent.camera.aspect = window.innerWidth/window.innerHeight;
      HomeComponent.camera.updateProjectionMatrix();
    })
    HomeComponent.animate();
  }

  createVisualisation(){
    // table
    for ( var i = 0; i < table.length; i += 6 ) {
      var url = table[i+5];
      var element = document.createElement( 'div' );
      element.className = 'element';
      element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
      element.dataset.data = url;
      element.addEventListener('click', (e) => this.openRenderer((<HTMLTextAreaElement>e.target).dataset.data))
      var number = document.createElement( 'div' );
      number.className = 'number';
      number.style.position = 'absolute';
      number.style.top = '20px';
      number.style.right = '20px';
      number.style.fontSize = '22px';
      number.style.color = 'rgba(127,255,255,0.75)';
      number.textContent = ((i/6) + 1).toString();
      number.dataset.data = url;
      element.appendChild( number );
      var symbol = document.createElement( 'div' );
      symbol.className = 'symbol';
      symbol.style.position = 'absolute';
      symbol.style.top = '80px';
      symbol.style.left = '0px';
      symbol.style.right = '0px';
      symbol.style.fontSize = '160px';
      symbol.style.fontWeight = 'bold';
      symbol.style.color = 'rgba(255,255,255,0.75)';
      symbol.style.textShadow = '0 0 10px rgba(0,255,255,0.95)';
      symbol.textContent = table[ i ].toString();
      symbol.dataset.data = url;
      element.appendChild( symbol );
      var details = document.createElement( 'div' );
      details.className = 'details';
      details.style.position = 'absolute';
      details.style.bottom = '15px';
      details.style.wordWrap = 'break-word';
      details.style.left = '0px';
      details.style.right = '15px';
      details.style.left = '15px';
      details.style.lineHeight = '1.2';
      details.style.top = '190px';
      details.style.fontSize = '32px';
      details.style.color = 'rgba(127,255,255,0.75)';
      details.dataset.data = url;
      details.innerHTML = table[ i + 1 ]
      element.appendChild( details );
      var object = new CSS3DObject( element );
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      HomeComponent.scene.add( object );
      objects.push( object );
      var object2 = new THREE.Object3D();
      object2.position.x = ( +table[ i + 3 ] * 480 ) - 1400;
      object2.position.y = - ( +table[ i + 4 ] * 400 ) + 990;
      targets.table.push( object2 );
    }
    // sphere
    var vector = new THREE.Vector3();
    for ( var i = 0, l = objects.length; i < l; i ++ ) {
      var phi = Math.acos( -1 + ( 2 * i ) / l );
      var theta = Math.sqrt( l * Math.PI ) * phi;
      var object2 = new THREE.Object3D();
      object2.position.x = 9 * katalog_items_json['result']['results'].length * Math.cos( theta ) * Math.sin( phi );
      object2.position.y = 9 * katalog_items_json['result']['results'].length * Math.sin( theta ) * Math.sin( phi );
      object2.position.z = 9 * katalog_items_json['result']['results'].length * Math.cos( phi );
      vector.copy( object2.position ).multiplyScalar( 2 );
      object2.lookAt( vector );
      targets.sphere.push( object2 );
    }
    // helix
    var vector = new THREE.Vector3();
    for ( var i = 0, l = objects.length; i < l; i ++ ) {
      var phi = i * 0.625 + Math.PI;
      var object2 = new THREE.Object3D();
      object2.position.x = 900 * Math.sin( phi );
      object2.position.y = - ( i * 40 ) + 450;
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
      object2.position.x = ( ( i % 5 ) * 480 ) - 800;
      object2.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 410 ) + 800;
      object2.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
      targets.grid.push( object2 );
    }
    HomeComponent.transform( targets.table, 2000);
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
    .onUpdate( HomeComponent.render )
    .start();
  }

  static animate() {
    requestAnimationFrame( HomeComponent.animate );
    TWEEN.update();
    HomeComponent.controls.update();
  }

  static render() {
    HomeComponent.renderer.render(HomeComponent.scene,HomeComponent.camera);
  }

  openRenderer(url: String) {
    this.router.navigate(['/renderer', url]);
  }
}
