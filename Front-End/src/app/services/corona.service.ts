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
      var coordinates = [[47.84927,16.52513],[47.79857,16.67285],[47.83194,16.58406],[47.47372,15.33401],[46.96564,16.10505],[47.72463,16.39832],[  47.92127,16.85852],[ 47.49500,16.50750],[47.29067,16.21588],[ 46.62103,14.28867],[ 46.61272,13.84832],[ 46.63154,13.36316],[ 46.56763,14.29043],[46.77052,14.37407],[46.80825,13.48634],[46.70837,13.79844],[ 46.65367,14.63372],[ 46.84313,15.65815],[46.70568,14.13326],[ 48.41201,15.61387],[ 48.20440,15.62291],[ 47.95872,14.77524],[ 47.81515,16.20135],[ 48.08226,14.83975],[ 48.00857,16.23350],[ 48.02313,16.78843],[ 48.32616,16.71142],[ 48.76870,14.98266],[ 48.57770,16.07394],[ 48.67603,15.67031],[ 48.34854,16.32971],[48.420198, 15.582176],[ 47.95573,15.59591],[48.21224,15.25647],[48.58455,16.57021],[48.07517,16.29150],[ 47.70866,16.04503],[48.190289, 15.629074],[ 47.91546,15.09719],[48.32742,16.06479],[ 48.83029,15.31421],[47.850043, 16.062528],[ 48.60293,15.16988],[ 48.30640,14.28610],[ 48.04702,14.41187],[ 48.16857,14.02376],[ 48.25442,13.04164],[ 48.30312,14.01181],[ 48.50534,14.51290],[ 47.79332,13.94720],[ 48.24764,13.80727],[ 47.90459,14.11779],[48.22376,14.28031],[ 48.25298,14.63943],[48.21296,13.49173],[ 48.59612,13.99442],[ 48.40196,13.55617],[47.90832,14.47703],[ 48.39565,14.29796],[ 48.00208,13.68613],[ 48.11873,13.99293],[ 47.79940,13.04400],[ 47.67939,13.11905],[47.81206,13.19901],[ 47.34503,13.22031],[ 47.12663,13.79250],[47.28589,12.69913],[ 47.07269,15.43614],[46.83005,15.19009],[47.07054,15.43746],[ 46.79038,15.52670],[ 47.37260,15.08956],[47.56555,14.24201],[ 47.10172,14.18910],[47.03326,15.15087],[47.22178,15.63566],[ 47.18507,14.69001],[47.42025,15.27768],[ 47.24785,15.97046],[46.89100,15.84306],[47.27054,11.39509],[ 47.22562,10.72594],[47.23316,11.37635],[ 47.44281,12.39889],[ 47.56576,12.14181],[ 47.12254,10.58013],[ 46.83113,12.76942],[ 47.48598,10.71663],[ 47.34371,11.72865],[ 47.16279,9.82104],[ 47.47733,9.75324],[ 47.42075,9.73708],[47.25995,9.60236],[ 48.19231,16.37136]];
      var maxValue = 0;
      var value = 0;
      var nextBiggerScale = 0;
      maxValue = this.calculateMax(dataID,bezirke);
      nextBiggerScale = this.calculateNextBiggerScale(maxValue);
      for (var i = 0; i < bezirke.length-1; i++){
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
