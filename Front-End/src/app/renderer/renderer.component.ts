import { Component, OnInit } from '@angular/core';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapService } from '../services/map.service';
import * as THREE from 'three';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

var deltaX = 730;
var deltaY = 2600;
var factor = 55;

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements OnInit {
  url: string;
  private sub: any;

  module: string;
  // REQUEST MAP
  constructor(public map: MapService, private route: ActivatedRoute, private http: HttpClient) { }
  // THREE JS Main Scene
  static scene;
  static entries = new THREE.Group;
  static noScaleEntries = new THREE.Group;
  // Bundesländer Group
  static bundeslaenderGroup = new THREE.Group;
  // Bezirke Group
  static bezirkDataGroup = new THREE.Group;
  static bundeslandDataGroup = new THREE.Group;

  static selected = false;
  static selectedBundesland = 0;

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.url = params['url'];
      this.start();
    });
  }

  start() {
    // Create new THREE JS Scene
    RendererComponent.scene = new THREE.Scene();
    RendererComponent.bezirkDataGroup.visible = false;

    // Obj Size Stay Same
    var scaleVector = new THREE.Vector3();

    // Set Camera
    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.x = 142.93;
    camera.position.y = 174.46;
    camera.position.z = 432.38;
    camera.lookAt( 0, 0, 0 );
    camera.layers.enable(2);
    camera.layers.enable(3);

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
    RendererComponent.scene.add( directionalLight );

    // Update function
    var render = function(){
      controls.update();
      var scaleFactor = 80;
      RendererComponent.entries.children.forEach(function(elem) {
        var scale = scaleVector.subVectors(elem.position, camera.position).length() / scaleFactor;
        elem.scale.set(scale,scale,1)
      });
      // THREE JS Components
      requestAnimationFrame(render);
      renderer.render(RendererComponent.scene,camera);
    }

    // THREE JS Resize function
    window.addEventListener('resize',() => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    })

    render();
    this.map.setUp();
    RendererComponent.scene.add(RendererComponent.bundeslaenderGroup);
    RendererComponent.scene.add(RendererComponent.bundeslandDataGroup);
    RendererComponent.scene.add(RendererComponent.entries);
    RendererComponent.entries.clear();
    RendererComponent.scene.add(RendererComponent.noScaleEntries);
    RendererComponent.noScaleEntries.clear();
    //this.http.get('/nodejs/katalog-item?url='+ this.url, {responseType: 'text'}).subscribe(data =>
    this.http.get('/katalog-item?url='+ this.url, {responseType: 'text'}).subscribe(data =>
      this.mapper(data)
    );
  }

  IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  mapper(data) {
    if (this.IsJsonString(data)) {
      this.mapJson(data);
    }
  }

  mapJson(data){
    var counter = 0;
    var json = JSON.parse(data);
    json['features'].forEach(element => {
      if (element['geometry']['type'] == "Point") {
        this.spawnPoint(element['geometry']['coordinates'][0],element['geometry']['coordinates'][1]);
        console.log(element['geometry']['coordinates'][0],element['geometry']['coordinates'][1]);
      } else if (element['geometry']['type'] == "MultiLineString") {
        this.spawnMultiLineString(element['geometry']['coordinates']);
      } else if (element['geometry']['type'] == "Polygon") {
        this.spawnPolygon(element['geometry']['coordinates']);
      } else if (element['geometry']['type'] == "MultiPolygon") {
        this.spawnMultiPolygon(element['geometry']['coordinates']);
      } else if (element['geometry']['type'] == "LineString") {
        this.spawnLineString(element['geometry']['coordinates']);
      } else {
        console.log(element);
      }
    });
    console.log("finish");
  }

  spawnPoint(posX, posY) {
    let m_color = new THREE.MeshLambertMaterial( {color: 0x0221F7, transparent: true, opacity: 0.7, emissive: 0x0221F7} );
    var geometry = new THREE.BoxGeometry( .5, .5, .5);
    var cube = new THREE.Mesh( geometry, m_color );
    cube.position.z = 1;
    cube.position.y = posY * factor - deltaY;
    cube.position.x = posX * factor - deltaX;
    RendererComponent.entries.add(cube);
  }

  spawnLineString(array) {
    const material = new THREE.LineBasicMaterial({ color: 0x0221F7, transparent: true, opacity: 0.7 });
    const points = [];
    array.forEach(point => {
      points.push( new THREE.Vector3( point[0] * factor - deltaX, point[1] * factor - deltaY, 1 ) );
    });
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    RendererComponent.noScaleEntries.add(line);
  }

  spawnMultiLineString(array) {
    const material = new THREE.LineBasicMaterial({ color: 0x0221F7, transparent: true, opacity: 0.7 });
    array.forEach(element => {
      const points = [];
      element.forEach(point => {
        points.push( new THREE.Vector3( point[0] * factor - deltaX, point[1] * factor - deltaY, 1 ) );
      });
      const geometry = new THREE.BufferGeometry().setFromPoints( points );
      const line = new THREE.Line( geometry, material );
      RendererComponent.noScaleEntries.add(line);
    });
  }

  spawnPolygon(array) {
    var material = [];
    material.push (new THREE.MeshBasicMaterial({ color: 0xCB4335 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x76448A }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x6C3483 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x1F618D }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x2874A6 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x148F77 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x117A65 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x1E8449 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x239B56 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xB7950B }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xB9770E }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xAF601A }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xA04000 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xB3B6B7 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x909497 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x717D7E }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x616A6B }));
    array.forEach(element => {
      var shapePoints = [];
      element.forEach(point => {
        shapePoints.push( new THREE.Vector3(point[0] * factor - deltaX, point[1] * factor - deltaY, 1 ) );
      });
      var geomShape = new THREE.ShapeBufferGeometry(new THREE.Shape(shapePoints));
      const shape = new THREE.Mesh( geomShape, material[Math.floor(Math.random()*material.length)]);
      RendererComponent.noScaleEntries.add(shape);
    });
  }

  spawnMultiPolygon(array) {
    var material = [];
    material.push (new THREE.MeshBasicMaterial({ color: 0xCB4335 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x76448A }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x6C3483 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x1F618D }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x2874A6 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x148F77 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x117A65 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x1E8449 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x239B56 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xB7950B }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xB9770E }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xAF601A }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xA04000 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0xB3B6B7 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x909497 }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x717D7E }));
    material.push (new THREE.MeshBasicMaterial({ color: 0x616A6B }));
    array.forEach(element => {
      var shapePoints = [];
      element.forEach(polygon => {
        polygon.forEach(point => {
          shapePoints.push( new THREE.Vector3(point[0] * factor - deltaX, point[1] * factor - deltaY, 1 ) );
        });
      });
      var geomShape = new THREE.ShapeBufferGeometry(new THREE.Shape(shapePoints));
      const shape = new THREE.Mesh( geomShape, material[Math.floor(Math.random()*material.length)]);
      RendererComponent.noScaleEntries.add(shape);
    });
  }
}