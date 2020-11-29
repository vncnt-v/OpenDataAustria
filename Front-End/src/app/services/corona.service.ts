import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';
import { MapService } from './map.service';
import { UICoronaComponent } from '../ui-corona/ui-corona.component';

let assets;
let m_coronaData = new THREE.MeshLambertMaterial( {color: 0x2194ce, transparent: true, opacity: 0.5, emissive: 0x7a2c2c} );
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var scene;
var storage;

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
      this.saveData(data)
    );
  }

  saveData(data){
    storage = data;
    CoronaService.visualizeData(5);
  }

  static visualizeData(dataID) {
    scene.remove(assets);
    assets = new THREE.Group();
      // CovidFaelle_GKZ.csv bezirke durch Newlines getrennt
      var bezirke = storage.split('\n');
      var coordinates = [[47.84565,16.52327],[48.2999988,15.916663],[47.84565,16.52327],[47.0666664,16.3166654],[46.93848,16.14158],[47.73333,16.4],[47.94901,16.8417],[47.494970,16.508790],[47.28971,16.20595],[46.636460,14.312225],[46.61028,13.85583],[46.62722,13.36722]];
      var maxValue = 0;
      var value = 0;
      var nextBiggerScale = 0;
      maxValue = this.calculateMax(dataID,bezirke);
      nextBiggerScale = this.calculateNextBiggerScale(maxValue);
      for (var i = 0; i < bezirke.length && i < 12; i++){
        var bezirk = bezirke[i+1].split(';');
        value = this.calculateValue(dataID,bezirk);
        // Scale to max
        value = (value/100*(400/(nextBiggerScale/100)));
        this.visualizeEntry(coordinates[i][0],coordinates[i][1],value);
      }
      scene.add(assets);
      MapService.setMaxValue(nextBiggerScale);
  }

  static calculateNextBiggerScale(maxValue){
    // Skala ist bis zur nächsten geraden Stelle größer als maxValue
    if (maxValue < 400){
      return (maxValue-(maxValue%50)+50);
    }
    if (maxValue < 1000){
      return (maxValue-(maxValue%100)+100);
    }
    if (maxValue < 10000){
      return (maxValue-(maxValue%500)+500);
    }
    if (maxValue < 100000){
      return (maxValue-(maxValue%1000)+1000);
    }
    if (maxValue < 1000000){
      return (maxValue-(maxValue%10000)+10000);
    }
    return (maxValue-(maxValue%100000)+100000);
  }

  static calculateValue(dataID,bezirk){
    // [0] Bezirk, [1] GKZ, [2] AnzEinwohner, [3] Bevölkerung, [4] AnzahlTod, [5] AnzahlFaelle7Tage, [6] Bevölkerung/100.000, [7] AnzahlTod/100.000, [8] AnzahlFaelle7Tage/100.000
    if (dataID == 6){
      return (bezirk[3]/bezirk[2]*100000);
    }
    if (dataID == 7){
      return (bezirk[4]/bezirk[2]*100000);
    }
    if (dataID == 8){
      return (bezirk[5]/bezirk[2]*100000);
    }
    return parseInt(bezirk[dataID],10);
  }

  static calculateMax(dataID,bezirke){
    var maxValue = 0;
    var value = 0;
    for (var i = 0; i < bezirke.length && i < 12; i++){
      var bezirk = bezirke[i+1].split(';');
      value = this.calculateValue(dataID,bezirk);
      if (maxValue < value){
          maxValue = value;
      }
    }
    return maxValue;
  }

  static visualizeEntry(lat,long,height){
      var geometry = new THREE.BoxGeometry( 2, 2, height);
      var cube = new THREE.Mesh( geometry, m_coronaData );
      cube.position.z = height/2;
      cube.position.y = lat * factor - deltaY;
      cube.position.x = long * factor - deltaX;
      assets.add(cube);
  }
}
