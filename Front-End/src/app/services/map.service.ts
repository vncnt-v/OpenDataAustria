import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';
import { RendererComponent } from '../renderer/renderer.component';

var scene;
var m_bundesland = new THREE.LineBasicMaterial( {color: 0x323232 });
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var map = new THREE.Group();

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
        }
    }
    scene.add( map );
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
}
