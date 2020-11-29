import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';

var scene;
var m_bundesland = new THREE.LineBasicMaterial( {color: 0xDE1232,});
var m_bundeslandAxes = new THREE.LineBasicMaterial( {color: 0x777777 });
var m_bundeslandAxesFilled = new THREE.MeshLambertMaterial( {color: 0x000000 });
var m_scala = new THREE.LineDashedMaterial( {color: 0x777777, scale: 1.1, dashSize: 4.5, gapSize: 4.5,});
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var map = new THREE.Group();
var axes = new THREE.Group();
var axes_filled = new THREE.Group();
var scala = new THREE.Group();
var axes_scala = new THREE.Line();

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient, ) { 
  }

  getData(){
    return this.http.get('/map', {responseType: 'text'});
  }

  setUp(sceneTmp) {
    scene = sceneTmp;
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
            // Draw red line Bundesland
            this.drawBundesland(vectors);
            // Draw white line Bundesland (kann bei z.B.: 1.000 als "Achse" stehen, teils als Fläche um nur die zu sehen welche die 1.000 Grenze überschreiten oder nur als Linie)
            this.drawBundeslandAxes(vectors);
            // ** TEST ** Draw Kärnten Fläche **
            this.drawBundeslandAxesFilled(vectors);
        }
    }
    //Scala
    this.drawZeroScala();
    this.drawNormalScala();
    this.drawMiniScala();
    scala.visible = false;
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
  drawBundesland(vectors){
    var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    var line = new THREE.Line( geometry, m_bundesland );
    map.add( line );
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
    points.push(new THREE.Vector2(9.5*factor-deltaX,49*factor-deltaY));
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
    axes.position.z = (value/100*(400/(500/100)));
    axes_scala.position.z = (value/100*(400/(500/100)));
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

  static setMaxValue(value){
    // ToDo, coronaService übermittelt schon value, Beschriftung der Scala anpassen
    console.log(value);
  }
/*
  // 
  static setMaxValue(value){
    const loader = new THREE.FontLoader();

    loader.load( 'https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json', function ( font ) {
         var materials = [
            new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, emissive: 0xffffff } ), // front
            new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0xffffff} ) // side
        ];
        var geo = new THREE.TextGeometry( '0', {
            font: font,
            size: 5,
            height: 0,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 5
        } );
        var geo2 = new THREE.BufferGeometry().fromGeometry( geo );
        var obj = new THREE.Mesh( geo2, materials );
        obj.position.x = -250;
        obj.position.y = -30;
        scene.add(obj);
        geo = new THREE.TextGeometry( '100', {
            font: font,
            size: 5,
            height: 0,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 5
        } );
        geo2 = new THREE.BufferGeometry().fromGeometry( geo );
        obj = new THREE.Mesh( geo2, materials );
        obj.position.x = -250;
        obj.position.y = -30;
        obj.position.z = 100;
        scene.add(obj);
    } );
  }
  */
}
