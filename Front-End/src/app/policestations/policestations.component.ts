import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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
      this.renderer.start();
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
      this.visualizeEntry(element);
      tableData.push({name: element.name,count: element.artLang});
    });
    PolicestationsComponent.sortedData = tableData.slice().sort((a, b) => {
      return PolicestationsComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
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
      RendererParticleComponent.createPoint(bundeslandValue[i],bundeslandName[i]);
      tableData.push({name: bundeslandName[i],count: bundeslandValue[i]});
    }
    PolicestationsComponent.sortedData = tableData.slice().sort((a, b) => {
      return PolicestationsComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
  }

  visualizeEntry(element) {
    let m_coronaData = new THREE.MeshLambertMaterial( {color: 0xffffff, transparent: true, opacity: 0.7, emissive: 0xffffff} );
    if (element.artLang == 'Polizeiinspektion'){
      m_coronaData = new THREE.MeshLambertMaterial( {color: 0x02F157, transparent: true, opacity: 0.7, emissive: 0x02F157} );
    } else if (element.artLang == 'Landespolizeidirektion'){
      m_coronaData = new THREE.MeshLambertMaterial( {color: 0x0221F7, transparent: true, opacity: 0.7, emissive: 0x0221F7} );
    } else if (element.artLang == 'Bezirkspolizeikommando'){
      m_coronaData = new THREE.MeshLambertMaterial( {color: 0xF221F7, transparent: true, opacity: 0.7, emissive: 0xF221F7} );
    } else if (element.artLang == 'Polizeiinspektion/ Bezirksleitstelle'){
      m_coronaData = new THREE.MeshLambertMaterial( {color: 0x022FF7, transparent: true, opacity: 0.7, emissive: 0x022FF7} );
    } else {
      console.log(element.artLang);
    }
    var geometry = new THREE.BoxGeometry( 2, 2, 15);
    var cube = new THREE.Mesh( geometry, m_coronaData );
    cube.position.z = 10/2;
    cube.position.y = element.y * factor - deltaY;
    cube.position.x = element.x * factor - deltaX;
    cube.layers.set(2);
    cube.userData.name = element.plz;
    cube.userData.value = element.artLang;
    RendererComponent.addBundesland(cube);
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
