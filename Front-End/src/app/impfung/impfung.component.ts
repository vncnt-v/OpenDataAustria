import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';
import { MapService } from '../services/map.service';
import { RendererComponent } from '../renderer/renderer.component';

let assets;
var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var scene;
var storage;

interface Data {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-impfung',
  templateUrl: './impfung.component.html',
  styleUrls: ['./impfung.component.css']
})
export class ImpfungComponent implements OnInit {
  
  constructor(private http: HttpClient, private renderer: RendererComponent) { 
  
  }

  ngOnInit(): void {
    this.renderer.start(this);
  }

  data: Data[] = [
    {value: '1', viewValue: 'Auslieferungen'},
    {value: '3', viewValue: 'Bestellungen'},
    {value: '5', viewValue: 'Bevölkerung'}
  ];
  selectedData = this.data[0].value;

  getData(){
    return this.http.get('/impfung-data', {responseType: 'text'});
  }

  getObjects(){
    return assets;
  }
  setUp(sceneTmp) {
    scene = sceneTmp;
    this.getData().subscribe(data =>
      this.saveData(data)
    );
  }

  saveData(data){
    storage = data;
    ImpfungComponent.visualizeData(1);
  }

  static visualizeData(dataID) {
    scene.remove(assets);
    assets = new THREE.Group();
      // CovidFaelle_GKZ.csv bezirke durch Newlines getrennt
      var bezirke = storage.split('\n');
      var coordinates = [[47.51192,16.39530],[46.74337,13.83628],[48.33653,15.74331],[48.25269,14.00175 ],[47.79940,13.04400 ],[47.20891,15.21711 ],[47.22132,11.30193 ],[47.22757,9.89605 ],[ 48.19231,16.37136]];
      var maxValue = 0;
      var value = 0;
      var nextBiggerScale = 0;
      maxValue = this.calculateMax(dataID,bezirke);
      nextBiggerScale = this.calculateNextBiggerScale(maxValue);
      for (var i = 0; i < bezirke.length-3; i++){
        var bezirk = bezirke[i+1].split(';');
        value = this.calculateValue(dataID,bezirk);
        // Scale to max
        var value_scaled = (value/100*(400/(nextBiggerScale/100)));
        this.visualizeEntry(coordinates[i][0],coordinates[i][1],value_scaled,bezirk[0],value);
      }
      document.getElementById("date").innerHTML = "Stand: "+bezirke[bezirke.length-1].split(';')[dataID];
      scene.add(assets);
      //MapService.setMaxValue(nextBiggerScale);
  }

  static calculateNextBiggerScale(maxValue){
    // Skala ist bis zur nächsten geraden Stelle größer als maxValue
    if (maxValue < 100){
      return (maxValue-(maxValue%10)+10);
    }
    if (maxValue < 150){
      return (maxValue-(maxValue%25)+25);
    }
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
    // [0] Bundeslandname, [1] Auslieferungen, [2] AuslieferungenPro100, [3] Bestellungen, [4] BestellungenPro100, [5] Bevölkerung
    if (dataID == 2){
      return (bezirk[1]/bezirk[5]*100);
    }
    if (dataID == 4){
      return (bezirk[3]/bezirk[5]*100);
    }
    return parseInt(bezirk[dataID],10);
  }

  static calculateMax(dataID,bezirke){
    var maxValue = 0;
    var value = 0;
    for (var i = 1; i < bezirke.length-2; i++){
      var bezirk = bezirke[i].split(';');
      value = this.calculateValue(dataID,bezirk);
      if (maxValue < value){
          maxValue = value;
      }
    }
    return maxValue;
  }

  static visualizeEntry(lat,long,height,name,value){
      var geometry = new THREE.BoxGeometry( 2, 2, height);
      let m_coronaData = new THREE.MeshLambertMaterial( {color: 0x2194ce, transparent: true, opacity: 0.7, emissive: 0x2194ce} );
      var cube = new THREE.Mesh( geometry, m_coronaData );
      cube.position.z = height/2;
      cube.position.y = lat * factor - deltaY;
      cube.position.x = long * factor - deltaX;
      cube.layers.set(2);
      cube.userData.name = name;
      cube.userData.value = Math.floor(value*100)/100;
      assets.add(cube);
  }

  checkedAxes = false;
  checkedFill = false;
  checkScale = false;
  disabled = false;
  checkedScala = true;
  disabledAxesOptions = true;


  
  // Wählt Datentyp aus und schaut ob Scale gesetzt ist, bzw schaltet Scale disable.
  selectData(event) {
    this.selectedData = event.value;
    if (this.selectedData == '5'){
      this.disabled = true;
    } else {
      this.disabled = false;
    }
    if (!this.disabled && this.checkScale){
      if (this.selectedData == '1'){
        ImpfungComponent.visualizeData(2);
      } else if (this.selectedData == '3'){
        ImpfungComponent.visualizeData(4);
      } else {
        console.log("Error: selectData...");
      }
    } else {
      ImpfungComponent.visualizeData(this.selectedData);
    }
  }

  // Check Scale und welcher Datensatz gewählt wurde, keine Rechnung beim 2 (Bevölkerung)
  scaleTo100000(event){
    this.checkScale = event.checked;
    if (this.selectedData == '1' || this.selectedData == '2'){
      if (event.checked){
        ImpfungComponent.visualizeData(2);
      } else {
        ImpfungComponent.visualizeData(1);
      }
    } else if (this.selectedData == '3' || this.selectedData == '4'){
      if (event.checked){
        ImpfungComponent.visualizeData(4);
      } else {
        ImpfungComponent.visualizeData(3);
      }
    }
  }

  toogleAxes(event) {
    if (event.checked){
      this.disabledAxesOptions = false;
      MapService.changeAxes(true);
    } else {
      this.disabledAxesOptions = true;
      MapService.changeAxes(false);
    }
  }

  toogleScala(event) {
    this.checkedScala = event.checked;
    MapService.changeScala(event.checked);
  }

  toggleFill(event){
    if (event.checked){
      MapService.changeFill(true);
    } else {
      MapService.changeFill(false);
    }
  }

  sliderChange(event){
    MapService.setAxes(event.value);
  }

  sliderChanged(event){
    MapService.createAxesLabel(event.value);
  }
}
