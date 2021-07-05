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
// Bundesland, Name, Bezirk, Gemeinde, Latitude, Longitude, Qualitaet 2017, Qualitaet 2018, Qualitaet 2019, Qualitaet 2020, Qualitaet 2021
var badegewaesser = [];
var tableData = [];

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
      this.renderer.start(false);
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
    // ToDo
  }

  visualizeParticle() {
    // ToDo
  }

  visualizePeriodic() {
    // ToDo
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
