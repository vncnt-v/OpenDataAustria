import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';

var scene;
var m_bundesland = new THREE.LineBasicMaterial( {color: 0xDE1232,});
var m_bundeslandAxes = new THREE.LineBasicMaterial( {color: 0x424242 });
var m_bundeslandAxesFilled = new THREE.MeshLambertMaterial( {color: 0x000000 });
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var map = new THREE.Group();
var axes = new THREE.Group();
var axes_filled = new THREE.Group();

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
    axes.position.z = 100;
    // austria.json
    // obj['features'][ ** BUNDENLAND ** ]['geometry']['coordinates'][ ** immer 0 außer Tirol dort 0,1 ** ][ ** KOORDINATEN INDEX **] - [0] x koodinate, [1] y koordinate
    // Ausnahe bei Tirol
    for (var i = 0; i < obj['features'].length; i++){
        for (var j = 0; j < obj['features'][i]['geometry']['coordinates'].length; j++){
            var vectors = [];
            var points = [];
            if (i != 1){
                for (var k = 0; k < obj['features'][i]['geometry']['coordinates'][j].length; k++){
                    points.push(obj['features'][i]['geometry']['coordinates'][j][k][0]*factor-deltaX);
                    points.push(obj['features'][i]['geometry']['coordinates'][j][k][1]*factor-deltaY);
                    vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][k][1]*factor-deltaY));
                }
            } else {
                for (var k = 0; k < obj['features'][i]['geometry']['coordinates'][j][0].length; k++){
                    points.push(obj['features'][i]['geometry']['coordinates'][j][0][k][0]*factor-deltaX);
                    points.push(obj['features'][i]['geometry']['coordinates'][j][0][k][1]*factor-deltaY);
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
  
    axes_filled.visible = false;
    axes.add(axes_filled);
    scene.add( map );
    scene.add( axes );
  }

  drawBundesland(vectors){
    var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    var line = new THREE.Line( geometry, m_bundesland );
    map.add( line );
  }
  drawBundeslandAxes(vectors){
    // Linie
    var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    var line = new THREE.Line( geometry, m_bundeslandAxes );
    line.position.z = 1;
    axes.add(line);
  }
  drawBundeslandAxesFilled(vectors){
    // Fläche
    var geometry = new THREE.ShapeBufferGeometry(new THREE.Shape(vectors));
    var mesh = new THREE.Mesh( geometry, m_bundeslandAxesFilled );
    axes_filled.add(mesh);
  }
}
