import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';
import { MapService } from '../services/map.service';
import { RendererComponent } from '../renderer/renderer.component';
import { ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { RendererParticleComponent } from '../renderer-particle/renderer-particle.component';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { RendererPeriodicComponent } from '../renderer-periodic/renderer-periodic.component';

var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var storage;
var param; 

interface Data {
  value: string;
  viewValue: string;
}

export interface TableElement {
  name: string;
  count: number;
}

var tableDataBundesland = [];

@Component({
  selector: 'app-impfung',
  templateUrl: './impfung.component.html',
  styleUrls: ['./impfung.component.css']
})
export class ImpfungComponent implements OnInit {
  
  constructor(private router: Router, private http: HttpClient, private renderer: RendererComponent, private renderer_particle: RendererParticleComponent, private renderer_periodic: RendererPeriodicComponent, private activatedRoute: ActivatedRoute) { 
    this.activatedRoute.queryParams.subscribe(params => {
      param = params['visual'];
    });
  }

  visual_map = false;
  visual_particle = false;
  visual_periodic = false;

  ngOnInit(): void {
    if (param != null){
      if (param == "particle"){
        this.visual_particle = true;
        this.renderer_particle.start();
        this.getData().subscribe(data =>
          this.saveData(data)
        );
      } else if (param == "periodic") {
        this.visual_periodic = true;
        this.getData().subscribe(data =>
          this.saveData(data)
        );
      } else {
        this.visual_map = true;
        this.renderer.start();
        this.setUp();
      }
    } else {
      this.visual_map = true;
      this.renderer.start();
      this.setUp();
    }
  }

  loadMap() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/impfung?visual=map';
    });
  }

  loadParticle() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/impfung?visual=particle';
    });
  }

  loadPeriodic() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/impfung?visual=periodic';
    });
  }

  displayedColumns: string[] = ['name', 'count'];
  static sortedData: TableElement[] = [];
  @ViewChild(MatTable) table: MatTable<TableElement>;

  data: Data[] = [
    {value: '1', viewValue: 'Auslieferungen'},
    {value: '3', viewValue: 'Bestellungen'},
    {value: '5', viewValue: 'Bevölkerung'}
  ];
  selectedData = this.data[0].value;

  getStaticList() {
    return ImpfungComponent.sortedData;
  }

  getData(){
    return this.http.get('/impfung-data', {responseType: 'text'});
  }

  setUp() {
    this.getData().subscribe(data =>
      this.saveData(data)
    );
  }

  saveData(data){
    storage = data;
    if (this.visual_particle){
      this.createParticle(5);
    } else if (this.visual_periodic){
      var bezirke = storage.split('\n');
      tableDataBundesland = [];
      for (var i = 0; i < bezirke.length-1; i++){
        var bezirk = bezirke[i+1].split(';');
        var value = ImpfungComponent.calculateValue(1,bezirk);
        tableDataBundesland.push({name: bezirk[0], count: Math.ceil(value)});
      }
      const sortPeriodicData = tableDataBundesland.slice();
      ImpfungComponent.sortedData = sortPeriodicData.sort((a, b) => {
        return ImpfungComponent.compare(a.count, b.count, false);
      });
      this.renderer_periodic.Init(sortPeriodicData);
    } else {
      this.visualizeData(1);
    }
  }

  createParticle(dataID) {
    var bezirke = storage.split('\n');
    RendererParticleComponent.deletePoints();
    tableDataBundesland = [];
    for (var i = 0; i < bezirke.length-1; i++){
      var bezirk = bezirke[i+1].split(';');
      var value = ImpfungComponent.calculateValue(dataID,bezirk);
      RendererParticleComponent.createPoint(value,bezirk[0]);
      tableDataBundesland.push({name: bezirk[0], count: Math.ceil(value)});
    }
    const table = tableDataBundesland.slice();
    ImpfungComponent.sortedData = table.sort((a, b) => {
      return ImpfungComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
  }

  visualizeData(dataID) {
    RendererComponent.bezirkDataGroup.clear();
    RendererComponent.bundeslandDataGroup.clear();

      // CovidFaelle_GKZ.csv bezirke durch Newlines getrennt
      var bezirke = storage.split('\n');
      var coordinates = [[47.51192,16.39530],[46.74337,13.83628],[48.33653,15.74331],[48.25269,14.00175 ],[47.79940,13.04400 ],[47.20891,15.21711 ],[47.22132,11.30193 ],[47.22757,9.89605 ],[ 48.19231,16.37136]];
      var maxValue = 0;
      var value = 0;
      var nextBiggerScale = 0;
      maxValue = ImpfungComponent.calculateMax(dataID,bezirke);
      nextBiggerScale = ImpfungComponent.calculateNextBiggerScale(maxValue);
      tableDataBundesland = [];
      for (var i = 0; i < bezirke.length-3; i++){
        var bezirk = bezirke[i+1].split(';');
        value = ImpfungComponent.calculateValue(dataID,bezirk);
        // Scale to max
        var value_scaled = (value/100*(400/(nextBiggerScale/100)));
        //this.visualizeEntry(coordinates[i][0],coordinates[i][1],value_scaled,bezirk[0],value);
        ImpfungComponent.visualizeEntry(coordinates[i][0],coordinates[i][1],value_scaled,bezirk[i],value);
        tableDataBundesland.push({name: bezirk[i], count: Math.ceil(value)});
      }
      MapService.setMaxValue(nextBiggerScale,maxValue);
      const data = tableDataBundesland.slice();
      ImpfungComponent.sortedData = data.sort((a, b) => {
        return ImpfungComponent.compare(a.count, b.count, false);
      });
      this.table.renderRows();
      document.getElementById("date").innerHTML = "Stand: "+bezirke[bezirke.length-1].split(';')[dataID];
  }

  static changeTable(tmpSort: number){
    ImpfungComponent.sortedData = tableDataBundesland.sort((a, b) => {
      return ImpfungComponent.compare(a.count, b.count, false);
    });
  }

  sortData(sort: Sort) {
    var data = tableDataBundesland.slice();
    if (!sort.active || sort.direction === '') {
      ImpfungComponent.sortedData = data;
      return;
    }
    ImpfungComponent.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return ImpfungComponent.compare(a.name, b.name, isAsc);
        case 'count': return ImpfungComponent.compare(a.count, b.count, isAsc);
        default: return 0;
      }
    });
  }

  static compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  static calculateNextBiggerScale(maxValue){
    // Skala ist bis zur nächsten geraden Stelle größer als maxValue
    if (maxValue < 50){
      return (maxValue-(maxValue%5)+5);
    }
    if (maxValue < 100){
      return (maxValue-(maxValue%10)+10);
    }
    if (maxValue < 200){
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
      let m_coronaData = new THREE.MeshLambertMaterial( {color: 0x2194ce, transparent: true, opacity: 0.7, emissive: 0x2194ce} );
      if (height < 1){
        if (height <= 0){
          m_coronaData = new THREE.MeshLambertMaterial( {color: 0x77dd77, transparent: false, opacity: 0.7} );
        }
        height = 1;
      }
      var geometry = new THREE.BoxGeometry( 5, 5, height);
      var cube = new THREE.Mesh( geometry, m_coronaData );
      cube.position.z = height/2;
      cube.position.y = lat * factor - deltaY;
      cube.position.x = long * factor - deltaX;
      cube.layers.set(2);
      cube.userData.name = name;
      cube.userData.value = Math.floor(value*100)/100;
      RendererComponent.addBundesland(cube);
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
        this.visualizeData(2);
      } else if (this.selectedData == '3'){
        this.visualizeData(4);
      } else {
        console.log("Error: selectData...");
      }
    } else {
      this.visualizeData(this.selectedData);
    }
  }

  // Check Scale und welcher Datensatz gewählt wurde, keine Rechnung beim 2 (Bevölkerung)
  scaleTo100000(event){
    this.checkScale = event.checked;
    if (this.selectedData == '1' || this.selectedData == '2'){
      if (event.checked){
        this.visualizeData(2);
      } else {
        this.visualizeData(1);
      }
    } else if (this.selectedData == '3' || this.selectedData == '4'){
      if (event.checked){
        this.visualizeData(4);
      } else {
        this.visualizeData(3);
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
