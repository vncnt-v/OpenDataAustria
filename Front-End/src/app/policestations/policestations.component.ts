import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { element } from 'protractor';
import * as THREE from 'three';
import { RendererParticleComponent } from '../renderer-particle/renderer-particle.component';
import { RendererPeriodicComponent } from '../renderer-periodic/renderer-periodic.component';
import { RendererComponent } from '../renderer/renderer.component';

var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var param; 
// name, landID, land, bezirkID, bezirk, artLang, plz, ort, x, y
var storage = [];
var tableData = [];

export interface TableElement {
  name: string;
  count: number;
}

@Component({
  selector: 'app-policestations',
  templateUrl: './policestations.component.html',
  styleUrls: ['./policestations.component.css']
})
export class PolicestationsComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient, private renderer: RendererComponent, private renderer_particle: RendererParticleComponent, private renderer_periodic: RendererPeriodicComponent, private activatedRoute: ActivatedRoute) { 
    this.activatedRoute.queryParams.subscribe(params => {
      param = params['visual'];
    });
  }

  visual_map = false;
  visual_particle = false;
  visual_periodic = false;

  ngOnInit(): void {
    if (param == "particle"){
      this.visual_particle = true;
      this.renderer_particle.start();
    } else if (param == "periodic"){
      this.visual_periodic = true;
    } else {
      this.visual_map = true;
      this.renderer.start(false);
    }
    this.getData().subscribe(data =>
      this.saveData(data)
    );
  }

  loadMap() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/police?visual=map';
    });
  }

  loadParticle() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/police?visual=particle';
    });
  }

  loadPeriodic() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/police?visual=periodic';
    });
  }

  displayedColumns: string[] = ['name', 'count'];
  static sortedData: TableElement[] = [];
  @ViewChild(MatTable) table: MatTable<TableElement>;

  getStaticList() {
    return PolicestationsComponent.sortedData;
  }

  getData(){
    return this.http.get('/police-data', {responseType: 'text'});
  }

  saveData(data){
    var data_arr = data.split('\n');
    for (var i = 1; i < data_arr.length; i++){
      var data_info = data_arr[i].split(';');
      if (data_info.length >= 23){
        // name, landID, land, bezirkID, bezirk, artLang, plz, ort, x, y
        storage.push({name: data_info[9],landID: data_info[4],land: data_info[5],bezirkID: data_info[6],bezirk: data_info[7],artLang: data_info[8],plz: data_info[10],ort: data_info[10],x: data_info[21].replace(",",".").substring(0,8),y: data_info[22].substring(0,data_info[22].length-2).replace(",",".").substring(0,8)});
      }
    }
    if (this.visual_particle){
      this.visualizeParticle();
    } else if (this.visual_periodic){
      var tableDataBundesland = [];
      var bundeslandValue = [0,0,0,0,0,0,0,0,0];
      var bundeslandName = ["Burgenland","Kärnten","Niederösterreich","Oberösterreich","Tirol","Steiermark","Salzburg","Vorarlberg","Wien"];
      storage.forEach(element => {
        bundeslandValue[element.landID-1]++;
      });
      tableData = [];
      for (var i = 0; i < bundeslandValue.length; i++){
        tableData.push({name: bundeslandName[i],count: Math.ceil(bundeslandValue[i])});
        tableDataBundesland.push({name: bundeslandName[i], count: Math.ceil(bundeslandValue[i])});
      }
      const sortPeriodicData = tableDataBundesland.slice();
      this.renderer_periodic.Init(sortPeriodicData);
      PolicestationsComponent.sortedData = tableData.slice().sort((a, b) => {
        return PolicestationsComponent.compare(a.count, b.count, false);
      });
      this.table.renderRows();
    } else {
      this.visualizeData();
    }
  }

  visualizeData() {
    RendererComponent.bezirkDataGroup.clear();
    RendererComponent.bundeslandDataGroup.clear();
    tableData = [];
    storage.forEach(element => {
      this.visualizeEntry(element.landID,1,element.name,element.y,element.x,false);
    });
    var bundeslandValue = [0,0,0,0,0,0,0,0,0];
    var bundeslandName = ["Burgenland","Kärnten","Niederösterreich","Oberösterreich","Tirol","Steiermark","Salzburg","Vorarlberg","Wien"];
    storage.forEach(element => {
      bundeslandValue[element.landID-1]++;
    });
    var b_coordinates = [[47.838758,16.536216],[46.622816,14.30796],[48.193315,15.619872],[48.305908,14.286198],[47.26543,11.392769],[47.070868,15.438279],[47.798135,13.046481],[47.502578,9.747292],[48.208354,16.372504]];
    for(var i = 0; i < bundeslandValue.length; i++) {
      this.visualizeEntry(-1,bundeslandValue[i],bundeslandName[i],b_coordinates[i][0],b_coordinates[i][1],true);
      tableData.push({name: bundeslandName[i],count: bundeslandValue[i]});
    }
    PolicestationsComponent.sortedData = tableData.slice().sort((a, b) => {
      return PolicestationsComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
    // PolicestationsComponent.sortedData = tableData.slice().sort((a, b) => {
    //   return PolicestationsComponent.compare(a.count, b.count, false);
    // });
    // this.table.renderRows();
  }

  visualizeParticle() {
    RendererParticleComponent.deletePoints();
    var bundeslandValue = [0,0,0,0,0,0,0,0,0];
    var bundeslandName = ["Burgenland","Kärnten","Niederösterreich","Oberösterreich","Tirol","Steiermark","Salzburg","Vorarlberg","Wien"];
    storage.forEach(element => {
      bundeslandValue[element.landID-1]++;
    });
    tableData = [];
    for(var i = 0; i < bundeslandValue.length; i++) {
      RendererParticleComponent.createPoint(bundeslandValue[i],bundeslandName[i],5000);
      tableData.push({name: bundeslandName[i],count: bundeslandValue[i]});
    }
    PolicestationsComponent.sortedData = tableData.slice().sort((a, b) => {
      return PolicestationsComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
  }

  visualizeEntry(id,value,name,x,y,bundesland) {
    let m_coronaData = new THREE.MeshLambertMaterial( {color: 0x0221F7, transparent: true, opacity: 0.7, emissive: 0x0221F7} );
    var geometry = new THREE.BoxGeometry( 5, 5, value);
    if (!bundesland){
      geometry = new THREE.BoxGeometry( 2, 2, value);
    }
    var cube = new THREE.Mesh( geometry, m_coronaData );
    cube.position.z = value/2;
    cube.position.y = x * factor - deltaY;
    cube.position.x = y * factor - deltaX;
    cube.layers.set(3);
    if (id == 0){
      id = 4;
      // Burgenland
    } else if (id == 1){
      id = 3;
    } else if (id == 2){
      id = 6;
    } else if (id == 3){
      id = 4;
    } else if (id == 4){
      id = 0;
    } else if (id == 5){
      id = 8;
    } else if (id == 6){
      id = 2;
    } else if (id == 7){
      id = 1;
    } else if (id == 8){
      id = 7;
    } else if (id == 9){
      id = 5;
    }
    cube.userData.id = id;
    cube.userData.name = name;
    cube.userData.value = value;
    if (bundesland){
      RendererComponent.addBundesland(cube);
    } else {
      RendererComponent.addBezirk(cube);
    }
  }

  sortData(sort: Sort) {
    var data = tableData.slice();
    if (!sort.active || sort.direction === '') {
      PolicestationsComponent.sortedData = data;
      return;
    }
    PolicestationsComponent.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return PolicestationsComponent.compare(a.name, b.name, isAsc);
        case 'count': return PolicestationsComponent.compare(a.count, b.count, isAsc);
        default: return 0;
      }
    });
  }
  static compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
