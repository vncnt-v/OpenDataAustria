import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as THREE from 'three';
import { CoronaComponent } from '../corona/corona.component';
import { RendererParticleComponent } from '../renderer-particle/renderer-particle.component';
import { RendererPeriodicComponent } from '../renderer-periodic/renderer-periodic.component';
import { RendererComponent } from '../renderer/renderer.component';
import { MapService } from '../services/map.service';

var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var param; 
// Bundesland, Name, Bezirk, Gemeinde, Latitude, Longitude, Qualitaet 2017, Qualitaet 2018, Qualitaet 2019, Qualitaet 2020, Qualitaet 2021
var badegewaesser = [];
var tableData = [];
var bundeslandValue = [0,0,0,0,0,0,0,0,0];
var bundeslandMax = [0,0,0,0,0,0,0,0,0];
var tableDataBundesland = [];

export interface TableElement {
  name: string;
  count: number;
}

@Component({
  selector: 'app-badegewaesser',
  templateUrl: './badegewaesser.component.html',
  styleUrls: ['./badegewaesser.component.css']
})
export class BadegewaesserComponent implements OnInit {

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
      window.location.href = '/badegewaesser?visual=map';
    });
  }

  loadParticle() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/badegewaesser?visual=particle';
    });
  }

  loadPeriodic() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/badegewaesser?visual=periodic';
    });
  }

  displayedColumns: string[] = ['name', 'count'];
  static sortedData: TableElement[] = [];
  @ViewChild(MatTable) table: MatTable<TableElement>;

  getStaticList() {
    return BadegewaesserComponent.sortedData;
  }

  getData(){
    return this.http.get('/badegewaesser-data', {responseType: 'text'});
  }

  saveData(data){
    tableData = [];
    const json_obj = JSON.parse(data);
    const bundeslaender = json_obj['BUNDESLAENDER']
    bundeslaender.forEach(parent => {
      parent['BADEGEWAESSER'].forEach(child => {
        // Bundesland, Name, Bezirk, Gemeinde, Latitude, Longitude, Qualitaet 2017, Qualitaet 2018, Qualitaet 2019, Qualitaet 2020, Qualitaet 2021
        badegewaesser.push({bundesland: parent['BUNDESLAND'],name: child['BADEGEWAESSERNAME'], bezirk: child['BEZIRK'], gemeinde: child['GEMEINDE'], lat: child['LATITUDE'], long: child['LONGITUDE'], quali_2017: child['QUALITAET_2017'], quali_2018: child['QUALITAET_2018'], quali_2019: child['QUALITAET_2019'], quali_2020: child['QUALITAET_2020'], quali_2021: child['QUALITAET_2021']});
        // DEBUG TABLE DATA
        tableData.push({name: child['BADEGEWAESSERNAME'] + ' - ' + parent['BUNDESLAND'], count: child['QUALITAET_2020']});
      });
    });
    // DEBUG DATA LOG
    badegewaesser.forEach(element => {
      console.log(element);
    });
    // DEBUG TABLE DATA
    BadegewaesserComponent.sortedData = tableData.slice().sort((a, b) => {
      return BadegewaesserComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
    
    if (this.visual_particle){
      // ToDo
      this.visualizeParticle();
    } else if (this.visual_periodic){
      // ToDo
      this.visualizePeriodic();
    } else {
      // ToDo
      this.visualizeData();
    }
  }

  visualizeData() {
    RendererComponent.bezirkDataGroup.clear();
    RendererComponent.bundeslandDataGroup.clear();
    var b_coordinates = [[48.305908,14.286198],[47.26543,11.392769],[47.070868,15.438279],[47.838758,16.536216],[48.193315,15.619872],[48.208354,16.372504],[46.622816,14.30796],[47.502578,9.747292],[47.798135,13.046481]];
    var b_names = ["Oberösterreich","Tirol","Steiermark","Burgenland","Niederösterreich","Wien","Kärten","Vorarlberg","Salzburg"];
    var nextBiggerScale = 0;
    tableDataBundesland = [];
    bundeslandMax = [0,0,0,0,0,0,0,0,0];
    var maxBundesland = 0;
    this.groupValues();
    bundeslandValue.forEach(element => {
      if (maxBundesland < element) {
        maxBundesland = element;
      }
    });
    nextBiggerScale = CoronaComponent.calculateNextBiggerScale(maxBundesland);
    var speicher=bundeslandValue[0];
    bundeslandValue[0]=bundeslandValue[3];
    bundeslandValue[3]=speicher;
    speicher=bundeslandValue[1];
    bundeslandValue[1]=bundeslandValue[5];
    bundeslandValue[5]=bundeslandValue[8];
    bundeslandValue[8]=bundeslandValue[6];
    bundeslandValue[6]=speicher;
      
    for (var i = 0; i < bundeslandValue.length; i++){
      CoronaComponent.visualizeEntry(b_coordinates[i][0],b_coordinates[i][1],bundeslandValue[i]/100*(400/(nextBiggerScale/100)),b_names[i],bundeslandValue[i],i,true);
      tableDataBundesland.push({name: b_names[i], count: Math.ceil(bundeslandValue[i])});
    }
    //scene.add(assets);
    MapService.setMaxValue(nextBiggerScale,bundeslandMax);
    
    const data = tableDataBundesland.slice();

    this.table.renderRows();
  }

  visualizeEntry(element) {
    

    /*let m_coronaData = new THREE.MeshLambertMaterial( {color: 0xffffff, transparent: true, opacity: 0.7, emissive: 0xffffff} );
    
    var geometry = new THREE.BoxGeometry( 2, 2, 15);
    var cube = new THREE.Mesh( geometry, m_coronaData );
    cube.position.z = 10/2;
    cube.position.y = element.lat * factor - deltaY;
    cube.position.x = element.long * factor - deltaX;
    cube.layers.set(2);
    cube.userData.name = element.plz;
    cube.userData.value = element.artLang;
    RendererComponent.addBundesland(cube);*/
  }
  static scaleEntry(lat,long,height,name,value,id,bundesland){

  }

  groupValues(){
    badegewaesser.forEach(element => {
      if(element.bundesland=="Burgenland"){
        bundeslandValue[0]++;
      }
      else if(element.bundesland=="Kärnten"){
        bundeslandValue[1]++;
      }
      else if(element.bundesland=="Niederösterreich"){
        bundeslandValue[2]++;
      }
      else if(element.bundesland=="Oberösterreich"){
        bundeslandValue[3]++;
      }
      else if(element.bundesland=="Tirol"){
        bundeslandValue[4]++;
      }
      else if(element.bundesland=="Steiermark"){
        bundeslandValue[5]++;
      }
      else if(element.bundesland=="Salzburg"){
        bundeslandValue[6]++;
      }
      else if(element.bundesland=="Vorarlberg"){
        bundeslandValue[7]++;
      }
      else if(element.bundesland=="Wien"){
        bundeslandValue[8]++;
      }
    });
  }

  visualizeParticle() {
    RendererParticleComponent.deletePoints();
    var bundeslandName = ["Burgenland","Kärnten","Niederösterreich","Oberösterreich","Tirol","Steiermark","Salzburg","Vorarlberg","Wien"];
    this.groupValues();
    tableData = [];
    for(var i = 0; i < bundeslandValue.length; i++) {
      RendererParticleComponent.createPoint(bundeslandValue[i],bundeslandName[i]);
      tableData.push({name: bundeslandName[i],count: bundeslandValue[i]});
    }
    this.table.renderRows();
  }

  visualizePeriodic() {
    var tableDataBundesland = [];
      var bundeslandName = ["Burgenland","Kärnten","Niederösterreich","Oberösterreich","Tirol","Steiermark","Salzburg","Vorarlberg","Wien"];
      this.groupValues();
      tableData = [];
      for (var i = 0; i < bundeslandValue.length; i++){
        tableData.push({name: bundeslandName[i],count: Math.ceil(bundeslandValue[i])});
        tableDataBundesland.push({name: bundeslandName[i], count: Math.ceil(bundeslandValue[i])});
      }
      const sortPeriodicData = tableDataBundesland.slice();
      this.renderer_periodic.Init(sortPeriodicData);
  }

  sortData(sort: Sort) {
    var data = tableData.slice();
    if (!sort.active || sort.direction === '') {
      BadegewaesserComponent.sortedData = data;
      return;
    }
    BadegewaesserComponent.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return BadegewaesserComponent.compare(a.name, b.name, isAsc);
        case 'count': return BadegewaesserComponent.compare(a.count, b.count, isAsc);
        default: return 0;
      }
    });
  }
  static compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
