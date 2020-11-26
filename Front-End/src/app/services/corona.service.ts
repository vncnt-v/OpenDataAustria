import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';

let assets;
let m_coronaData = new THREE.MeshLambertMaterial( {color: 0x2194ce, transparent: true, opacity: 0.5, emissive: 0x7a2c2c} );
var dataID = 5;
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var scene;

@Injectable({
  providedIn: 'root'
})
export class CoronaService {
  constructor(private http: HttpClient, ) { 
  }

  getData(){
    return this.http.get('/corona', {responseType: 'text'});
  }

  setUp(sceneTmp) {
    scene = sceneTmp;
    this.getData().subscribe(data =>
      this.visualizeData(data)
    );
  }

  visualizeData(data) {
    assets = new THREE.Group();
      // CovidFaelle_GKZ.csv bezirke durch Newlines getrennt
      var bezirke = data.split('\n');
      var coordinates = [[47.84565,16.52327],[48.2999988,15.916663],[47.84565,16.52327],[47.0666664,16.3166654],[46.93848,16.14158],[47.73333,16.4],[47.94901,16.8417],[47.494970,16.508790],[47.28971,16.20595],[46.636460,14.312225],[46.61028,13.85583],[46.62722,13.36722]];
      for (var i = 0; i < bezirke.length && i < 12; i++){
          // bezirk daten werden durch ";" getrennt
          // [0] Bezirk, [1] GKZ, [2] AnzEinwohner, [3] Anzahl, [4] AnzahlTot, [5] AnzahlFaelle7Tage
          var bezirk = bezirke[i].split(';');
          this.visualizeEntry(coordinates[i][0],coordinates[i][1],bezirk[dataID]);
      }
      // **Test** Wien
      var bezirk = bezirke[bezirke.length-1].split(';');
      this.visualizeEntry(48.210033,16.363449,bezirk[dataID]);
      // add to Scene
      scene.add(assets);
  }

  visualizeEntry(lat,long,height){
      // Max höhe festlegen und alle Einträge dazu in relation setzen, um ausbrüche wie bei Wien zuvermeiden
      // ** ToDo **
      var geometry = new THREE.BoxGeometry( 2, 2, height);
      var cube = new THREE.Mesh( geometry, m_coronaData );
      // deltaY, deltaX, factor von Map.js (Zentrierung der Map)
      cube.position.z = height/2;
      cube.position.y = lat * factor - deltaY;
      cube.position.x = long * factor - deltaX;
      assets.add(cube);
  }
}
