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
var tableData = [];

interface Data {
  value: string;
  viewValue: string;
}

export interface TableElement {
  name: string;
  count: number;
}

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
        this.renderer.start(true);
        this.setUp();
      }
    } else {
      this.visual_map = true;
      this.renderer.start(true);
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
    {value: '0', viewValue: 'Auslieferungen'},
    {value: '2', viewValue: 'Bestellungen'}
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
      this.createParticle(0);
    } else if (this.visual_periodic){
      this.createPeriodic(0);
    } else {
      this.visualizeData(0);
    }
  }

  createPeriodic(dataID) {
    var bezirke = storage.split('\n');
    var bundeslaender = [];
    for(var i = bezirke.length-1; i >= 0; i--) {
      var bezirk = bezirke[i].split(';');
      var tmp = false;
      bundeslaender.forEach(element => {
        if (element.id == bezirk[1]){
          tmp = true;
        }
      });
      if(!tmp && 1 <= bezirk[1] && bezirk[1] <= 9){
        bundeslaender.push({name: bezirk[3],id: bezirk[1],auslieferungen: bezirk[4], auslieferungenpro100: bezirk[5], bestellungen: bezirk[6], bestellungenpro100: bezirk[7]});
      }
      if (bundeslaender.length >= 9) {
        break;
      }
    }
    tableData = [];
    for (var i = 0; i < bundeslaender.length; i++) {
      var value = 0;
      if (dataID == 0){
        value = bundeslaender[i].auslieferungen;
      } else if (dataID == 1) {
        value = bundeslaender[i].auslieferungenpro100;
      } else if (dataID == 2) {
        value = bundeslaender[i].bestellungen;
      } else if (dataID == 3) {
        value = bundeslaender[i].bestellungenpro100;
      }
      tableData.push({name: bundeslaender[i].name,count: Math.ceil(value)});
    }

    const sortPeriodicData = tableData.slice();
    ImpfungComponent.sortedData = sortPeriodicData.sort((a, b) => {
      return ImpfungComponent.compare(a.count, b.count, false);
    });
    this.renderer_periodic.Init(sortPeriodicData);
    this.table.renderRows();
  }

  createParticle(dataID) {
    RendererParticleComponent.deletePoints();
    var bezirke = storage.split('\n');
    var bundeslaender = [];
    for(var i = bezirke.length-1; i >= 0; i--) {
      var bezirk = bezirke[i].split(';');
      var tmp = false;
      bundeslaender.forEach(element => {
        if (element.id == bezirk[1]){
          tmp = true;
        }
      });
      if(!tmp && 1 <= bezirk[1] && bezirk[1] <= 9){
        bundeslaender.push({name: bezirk[3],id: bezirk[1],auslieferungen: bezirk[4], auslieferungenpro100: bezirk[5], bestellungen: bezirk[6], bestellungenpro100: bezirk[7]});
      }
      if (bundeslaender.length >= 9) {
        break;
      }
    }
    var maxValue = 0;
    bundeslaender.forEach(element => {
      var value = 0;
      if (dataID == 0){
        value = element.auslieferungen;
      } else if (dataID == 1) {
        value = element.auslieferungenpro100;
      } else if (dataID == 2) {
        value = element.bestellungen;
      } else if (dataID == 3) {
        value = element.bestellungenpro100;
      }
      if (maxValue < element.auslieferungen){
        maxValue = value;
      }
    });
    tableData = [];
    for (var i = 0; i < bundeslaender.length; i++) {
      var value = 0;
      if (dataID == 0){
        value = bundeslaender[i].auslieferungen;
      } else if (dataID == 1) {
        value = bundeslaender[i].auslieferungenpro100;
      } else if (dataID == 2) {
        value = bundeslaender[i].bestellungen;
      } else if (dataID == 3) {
        value = bundeslaender[i].bestellungenpro100;
      }
      RendererParticleComponent.createPoint(value,bundeslaender[i].name,maxValue);
      tableData.push({name: bundeslaender[i].name,count: Math.ceil(value)});
    }
    ImpfungComponent.sortedData = tableData.slice().sort((a, b) => {
      return ImpfungComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
  }

  visualizeData(dataID) {
    RendererComponent.bezirkDataGroup.clear();
    RendererComponent.bundeslandDataGroup.clear();
    var bezirke = storage.split('\n');
    var bundeslaender = [];
    for(var i = bezirke.length-1; i >= 0; i--) {
      var bezirk = bezirke[i].split(';');
      var tmp = false;
      bundeslaender.forEach(element => {
        if (element.id == bezirk[1]){
          tmp = true;
        }
      });
      if(!tmp && 1 <= bezirk[1] && bezirk[1] <= 9){
        bundeslaender.push({name: bezirk[3],id: bezirk[1],auslieferungen: bezirk[4], auslieferungenpro100: bezirk[5], bestellungen: bezirk[6], bestellungenpro100: bezirk[7]});
      }
      if (bundeslaender.length >= 9) {
        break;
      }
    }
    var maxValue = 0;
    bundeslaender.forEach(element => {
      var value = 0;
      if (dataID == 0){
        value = element.auslieferungen;
      } else if (dataID == 1) {
        value = element.auslieferungenpro100;
      } else if (dataID == 2) {
        value = element.bestellungen;
      } else if (dataID == 3) {
        value = element.bestellungenpro100;
      }
      if (maxValue < element.auslieferungen){
        maxValue = ImpfungComponent.calculateNextBiggerScale(value);
      }
    });

    var b_coordinates = [];
    b_coordinates.push({name: 'Salzburg', x: 47.798135, y: 13.046481});
    b_coordinates.push({name: 'Oberösterreich', x: 48.305908, y: 14.286198});
    b_coordinates.push({name: 'Tirol', x: 47.26543, y: 11.392769});
    b_coordinates.push({name: 'Steiermark', x: 47.070868, y: 15.438279});
    b_coordinates.push({name: 'Burgenland', x: 47.838758, y: 16.536216});
    b_coordinates.push({name: 'Niederösterreich', x: 48.193315, y: 15.619872});
    b_coordinates.push({name: 'Wien', x: 48.208354, y: 16.372504});
    b_coordinates.push({name: 'Kärnten', x: 46.622816, y: 14.30796});
    b_coordinates.push({name: 'Vorarlberg', x: 47.502578, y: 9.747292});

    for (var i = 0; i < bundeslaender.length; i++) {
      var corX = 0;
      var corY = 0;
      for (var j = 0; j < b_coordinates.length; j++) {
        if (b_coordinates[j].name == bundeslaender[i].name){
          corX = b_coordinates[j].x;
          corY = b_coordinates[j].y;
          break;
        }
      }
      var value = 0;
      if (dataID == 0){
        value = bundeslaender[i].auslieferungen;
      } else if (dataID == 1) {
        value = bundeslaender[i].auslieferungenpro100;
      } else if (dataID == 2) {
        value = bundeslaender[i].bestellungen;
      } else if (dataID == 3) {
        value = bundeslaender[i].bestellungenpro100;
      }
      var value_scaled = (value/100*(400/(maxValue/100)));
      ImpfungComponent.visualizeEntry(corX,corY,value_scaled,bundeslaender[i].name,value);
    }
    MapService.setMaxValue(maxValue,[]);
    tableData = [];
    for (var i = 0; i < bundeslaender.length; i++){
      var value = 0;
      if (dataID == 0){
        value = bundeslaender[i].auslieferungen;
      } else if (dataID == 1) {
        value = bundeslaender[i].auslieferungenpro100;
      } else if (dataID == 2) {
        value = bundeslaender[i].bestellungen;
      } else if (dataID == 3) {
        value = bundeslaender[i].bestellungenpro100;
      }
      tableData.push({name: bundeslaender[i].name,count: Math.ceil(value)});
    }
    ImpfungComponent.sortedData = tableData.slice().sort((a, b) => {
      return ImpfungComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
  }

  static changeTable(tmpSort: number){
    ImpfungComponent.sortedData = tableData.sort((a, b) => {
      return ImpfungComponent.compare(a.count, b.count, false);
    });
  }

  sortData(sort: Sort) {
    var data = tableData.slice();
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
      cube.layers.set(3);
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
    if (!this.disabled && this.checkScale){
      if (this.selectedData == '0'){
        if (this.visual_particle){
          this.createParticle(1);
        } else {
          this.visualizeData(1);
        }
      } else if (this.selectedData == '2'){
        if (this.visual_particle){
          this.createParticle(3);
        } else {
          this.visualizeData(3);
        }
      } else {
        console.log("Error: selectData...");
      }
    } else {
      if (this.visual_particle){
        this.createParticle(this.selectedData);
      } else {
        this.visualizeData(this.selectedData);
      }
    }
  }

  // Check Scale und welcher Datensatz gewählt wurde, keine Rechnung beim 2 (Bevölkerung)
  scaleTo100000(event){
    this.checkScale = event.checked;
    if (this.selectedData == '0' || this.selectedData == '1'){
      if (event.checked){
        if (this.visual_particle){
          this.createParticle(1);
        } else {
          this.visualizeData(1);
        }
      } else {
        if (this.visual_particle){
          this.createParticle(0);
        } else {
          this.visualizeData(0);
        }
      }
    } else if (this.selectedData == '2' || this.selectedData == '3'){
      if (event.checked){
        if (this.visual_particle){
          this.createParticle(3);
        } else {
          this.visualizeData(3);
        }
      } else {
        if (this.visual_particle){
          this.createParticle(2);
        } else {
          this.visualizeData(2);
        }
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
