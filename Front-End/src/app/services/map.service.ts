import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';
import { RendererComponent } from '../renderer/renderer.component';
import { Identifiers } from '@angular/compiler';

var scene;
var m_bundesland = new THREE.LineBasicMaterial( {color: 0x323232 });
var m_bundeslandAxes = new THREE.LineBasicMaterial( {color: 0x777777 });
var m_bundeslandAxesFilled = new THREE.MeshLambertMaterial( {color: 0x323232 });
var m_scala = new THREE.LineDashedMaterial( {color: 0x777777, scale: 1.1, dashSize: 4.5, gapSize: 4.5,});
var m_lables = [
  new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, emissive: 0xffffff } ), // front
  new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0xffffff} ) // side
];
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var map = new THREE.Group();
var axes = new THREE.Group();
var axes_filled = new THREE.Group();
var scala = new THREE.Group();
var axes_scala = new THREE.Line();
var lables = new THREE.Group();
var axes_lable;
var maxValue;
var bundeslandMaxValue = [];
var currentZ = 125;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient, ) { 
  }

  getData(){
    return this.http.get('/map-data', {responseType: 'text'});
  }

  setUp() {
    scene = RendererComponent.scene;
    this.getData().subscribe(data =>
      this.visualizeData(data)
    );
  }

  visualizeData(data) {
    var obj = JSON.parse(data);
    // austria.json
    // obj['features'][ ** BUNDENLAND ** ]['geometry']['coordinates'][ ** immer 0 außer Tirol dort 0,1 ** ][ ** KOORDINATEN INDEX **] - [0] x koodinate, [1] y koordinate
    // Ausnahe bei Tirol
    for (var i = 0; i < obj['features'].length; i++){
        for (var j = 0; j < obj['features'][i]['geometry']['coordinates'].length; j++){
          if (i == 4 && j != 0){
            continue;
          }
            var vectors = [];
            if (i != 1){
                for (var k = 0; k < obj['features'][i]['geometry']['coordinates'][j].length; k++){
                    vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][k][1]*factor-deltaY));
                }
            } else {
                for (var k = 0; k < obj['features'][i]['geometry']['coordinates'][j][0].length; k++){
                    vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][0][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][0][k][1]*factor-deltaY));
                }
            }
            // Draw Bundesland
            if (i == 5){
              this.drawBundesland(4,vectors,false);
            } else {
              this.drawBundesland(i,vectors,true);
            }
            // Draw white line Bundesland (kann bei z.B.: 1.000 als "Achse" stehen, teils als Fläche um nur die zu sehen welche die 1.000 Grenze überschreiten oder nur als Linie)
            this.drawBundeslandAxes(vectors);
            this.drawBundeslandAxesFilled(vectors);
        }
    }
    //Scala
    this.drawZeroScala();
    this.drawNormalScala();
    this.drawMiniScala();
    scala.visible = true;
    axes.add(axes_filled);
    // ToDo
    // Übereinstimmung mit UI Slider
    axes.position.z = 100;
    axes_scala.position.z = 100;
    scene.add( map );
    scene.add( axes );
    scene.add( scala );
  }

  // Grundriss
  drawBundesland(id,vectors,fill){
    var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    var line = new THREE.Line( geometry, m_bundesland );
    if (fill){
      const extrudeSettings = {
        steps: 2,
        depth: 16,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 1
      };
      const shape = new THREE.Shape( vectors );
      const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
      const material = new THREE.MeshBasicMaterial( { color: 0xad0000 } );
      const mesh = new THREE.Mesh( geometry, material ) ;
      mesh.userData.name = "id";
      mesh.userData.value = id;
      mesh.layers.set(2);
      mesh.position.z = -16.5;
      const tempGroup = new THREE.Group;
      tempGroup.add(line);
      tempGroup.add(mesh);
      
      tempGroup.userData.name = "id";
      tempGroup.userData.value = id;
      RendererComponent.bundeslaenderGroup.add(tempGroup);
    } else {
      line.userData.name = "id";
      line.userData.value = id;
      RendererComponent.bundeslaenderGroup.add(line);
    }
  }
  // Querschnitt & Achse des Querschnitts -> Default not visible
  drawBundeslandAxes(vectors){
    var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    var line = new THREE.Line( geometry, m_bundeslandAxes );
    var points = [];
    // Achse des Querschnittes, axes_scala (weil sichtbarkeit von zwei veschiedenen Objekten abängt -> scala.add(axes_scala) && axes.add(axes_scala))
    points.push(new THREE.Vector2(10*factor-deltaX,46.35*factor-deltaY));
    points.push(new THREE.Vector2(17*factor-deltaX,46.35*factor-deltaY));
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var lineAxes = new THREE.Line( geometry, m_scala );
    lineAxes.computeLineDistances();
    axes_scala = lineAxes;
    scala.add(axes_scala);
    axes.add(line);
    axes.visible = false;
    axes_scala.visible = false;
  }
  // Gefüllte Flächen -> Default not visible
  drawBundeslandAxesFilled(vectors){
    var geometry = new THREE.ShapeBufferGeometry(new THREE.Shape(vectors));
    var mesh = new THREE.Mesh( geometry, m_bundeslandAxesFilled );
    mesh.position.z = -0.5;
    axes_filled.add(mesh);
    axes_filled.visible = false;
  }

  // Null Linie (z = 0) ist länger
  drawZeroScala(){
    var points = [];
    points.push(new THREE.Vector2(9.5*factor-deltaX,48.85*factor-deltaY));
    points.push(new THREE.Vector2(9.5*factor-deltaX,46.35*factor-deltaY));
    points.push(new THREE.Vector2(17*factor-deltaX,46.35*factor-deltaY));
    this.drawScala(points,0);
  }

  // 4 Linien z.B.: maxValue = 5; 1. Linie bei 175; 2. Linie bei 250; ... ; 4. Linie bei 500
  drawNormalScala(){
    var points = [];
    points.push(new THREE.Vector2(9.5*factor-deltaX,47*factor-deltaY));
    points.push(new THREE.Vector2(9.5*factor-deltaX,46.35*factor-deltaY));
    points.push(new THREE.Vector2(10*factor-deltaX,46.35*factor-deltaY));
    for (var i = 0; i < 4; i++){
      this.drawScala(points,i*100+100);
    }
  }

  // Mini Skala zwischen den 4 normalen und der 0 Linie.
  drawMiniScala(){
    var points = [];
    points.push(new THREE.Vector2(9.5*factor-deltaX,46.35*factor-deltaY));
    points.push(new THREE.Vector2(10*factor-deltaX,46.35*factor-deltaY));
    for (var i = 0; i < 40; i++){
      if (i%10 == 0){
        continue;
      }
      this.drawScala(points,i*10);
    }
  }

  // Erstellt aus Punkten ein Objekt in der Scene
  drawScala(points,z){
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( geometry, m_scala );
    line.position.z = z;
    line.computeLineDistances();
    scala.add(line);
  }

  // Schaltet den Querschnitt ein und aus (Auch die Skala des Querschnitts)
  static changeAxes(value){
    axes.visible = value;
    axes_scala.visible = value;
  }

  // Schaltet die Skala ein und aus (in der Scala befindet sich auch die Skala des Querschnitts)
  static changeScala(value){
    scala.visible = value;
  }

  // Setzt den Querschnitt auf z Koordinate
  static setAxes(value){
    axes_scala.remove(axes_lable);
    this.createAxesLabel(value);
    axes.position.z = (value/100*(400/(500/100)));
    axes_scala.position.z = (value/100*(400/(500/100)));
    currentZ = value;
    if (value <= 0){
        axes.visible = false;
        axes_scala.visible = false;
    } else {
        axes.visible = true;
        axes_scala.visible = true;
    }
  }

  // Füllt die Flächen
  static changeFill(value){
    axes_filled.visible = value;
  }

  static setMaxValue(value,bundeslandValue){
    maxValue = value;
    bundeslandMaxValue = bundeslandValue;
    this.createLables(value);
    this.createAxesLabel(currentZ);
  }
  static setMaxValueAll(){
    this.createLables(maxValue);
    this.createAxesLabel(currentZ);
  }
  static setBundeslandScala(id: number) {
    this.createLables(bundeslandMaxValue[id]);
    this.createAxesLabel(currentZ);
  }

  static createLables(value: number){
    scala.remove(lables);
    lables = new THREE.Group;
    this.drawLables("0",9.5,49,0);
    this.drawLables((value*0.25).toString(),9.5,47.2,100);
    this.drawLables((value*0.5).toString(),9.5,47.2,200);
    this.drawLables((value*0.75).toString(),9.5,47.2,300);
    this.drawLables((value).toString(),9.5,47.2,400);
    scala.add(lables);
  }

  static drawLables(text: string,x ,y ,z ){
    const loader = new THREE.FontLoader();
    loader.load( 'https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json', function ( font ) {
      var geometry = new THREE.TextGeometry( text, {
        font: font,
        size: 8,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
      } );
      var buff_geometry = new THREE.BufferGeometry().fromGeometry( geometry );
      var obj_text = new THREE.Mesh( buff_geometry, m_lables );
      lables.add(obj_text);
      obj_text.position.x = x*factor-deltaX;
      obj_text.position.y = y*factor-deltaY;
      obj_text.position.z = z;
    });
  }

  static createAxesLabel(value: number){
    axes_scala.remove(axes_lable)
    const loader = new THREE.FontLoader();
    loader.load( 'https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json', function ( font ) {
      var geometry = new THREE.TextGeometry( (maxValue*(value/500)).toString(), {
        font: font,
        size: 8,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
      } );
      var buff_geometry = new THREE.BufferGeometry().fromGeometry( geometry );
      axes_lable = new THREE.Mesh( buff_geometry, m_lables );
      axes_scala.add(axes_lable);
      axes_lable.position.x = 17.1*factor-deltaX;
      axes_lable.position.y = 46.35*factor-deltaY;
    });
  }
}
