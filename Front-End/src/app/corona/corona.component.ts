import { Component, OnInit, ViewChild } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as THREE from 'three';
import { MapService } from '../services/map.service';
import { RendererComponent } from '../renderer/renderer.component';
import {MatTable} from '@angular/material/table';
import { TestBed } from '@angular/core/testing';
import {Sort} from '@angular/material/sort';
import { RendererParticleComponent } from '../renderer-particle/renderer-particle.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RendererPeriodicComponent } from '../renderer-periodic/renderer-periodic.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

var deltaX = 730;
var deltaY = 2600;
var factor = 55;
var storage;
var bundeslaender_count = [0,0,0,0,0,0,0,0,0];
var bundeslandMax = [0,0,0,0,0,0,0,0,0];
var sortID = -1;
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
var tableDataBezirk = [];
var tableDataBezirkSelected = [];

@Component({
  selector: 'app-corona',
  templateUrl: './corona.component.html',
  styleUrls: ['./corona.component.css']
})
export class CoronaComponent implements OnInit {

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
      window.location.href = '/corona?visual=map';
    });
  }

  loadParticle() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/corona?visual=particle';
    });
  }

  loadPeriodic() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      window.location.href = '/corona?visual=periodic';
    });
  }

  displayedColumns: string[] = ['name', 'count'];
  static sortedData: TableElement[] = [];
  @ViewChild(MatTable) table: MatTable<TableElement>;

  data: Data[] = [
    {value: '5', viewValue: 'Infektionen 7 Tage'},
    {value: '3', viewValue: 'Infektionen gesamt'},
    {value: '4', viewValue: 'Todesfälle gesamt'},
    {value: '2', viewValue: 'Bevölkerung'}
  ];
  selectedData = this.data[0].value;

  getStaticList() {
    return CoronaComponent.sortedData;
  }

  getData(){
    return this.http.get('/corona-data', {responseType: 'text'});
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
      tableDataBezirk = [];
      for (var i = 0; i < bezirke.length-1; i++){
        var bezirk = bezirke[i+1].split(';');
        var value = CoronaComponent.calculateValue(5,bezirk);
        tableDataBezirk.push({name: bezirk[0], count: Math.ceil(value)});
      }
      const sortPeriodicData = tableDataBezirk.slice();
      CoronaComponent.sortedData = sortPeriodicData.sort((a, b) => {
        return CoronaComponent.compare(a.count, b.count, false);
      });
      this.renderer_periodic.Init(sortPeriodicData);
    } else {
      this.visualizeData(5);
    }
  }

  createParticle(dataID) {
    var bezirke = storage.split('\n');
    RendererParticleComponent.deletePoints();
    tableDataBezirk = [];
    for (var i = 0; i < bezirke.length-1; i++){
      var bezirk = bezirke[i+1].split(';');
      var value = CoronaComponent.calculateValue(dataID,bezirk);
      RendererParticleComponent.createPoint(value,bezirk[0]);
      tableDataBezirk.push({name: bezirk[0], count: Math.ceil(value)});
    }
    const table = tableDataBezirk.slice();
    CoronaComponent.sortedData = table.sort((a, b) => {
      return CoronaComponent.compare(a.count, b.count, false);
    });
    this.table.renderRows();
  }
  visualizeData(dataID) {
    RendererComponent.bezirkDataGroup.clear();
    RendererComponent.bundeslandDataGroup.clear();

      // CovidFaelle_GKZ.csv bezirke durch Newlines getrennt
      var bezirke = storage.split('\n');
      var coordinates = [[47.84927,16.52513],[47.79857,16.67285],[47.83194,16.58406],[47.47372,15.33401],[46.96564,16.10505],[47.72463,16.39832],[  47.92127,16.85852],[ 47.49500,16.50750],[47.29067,16.21588],[ 46.62103,14.28867],[ 46.61272,13.84832],[ 46.63154,13.36316],[ 46.56763,14.29043],[46.77052,14.37407],[46.80825,13.48634],[46.70837,13.79844],[ 46.65367,14.63372],[ 46.84313,15.65815],[46.70568,14.13326],[ 48.41201,15.61387],[ 48.20440,15.62291],[ 47.95872,14.77524],[ 47.81515,16.20135],[ 48.08226,14.83975],[ 48.00857,16.23350],[ 48.02313,16.78843],[ 48.32616,16.71142],[ 48.76870,14.98266],[ 48.57770,16.07394],[ 48.67603,15.67031],[ 48.34854,16.32971],[48.420198, 15.582176],[ 47.95573,15.59591],[48.21224,15.25647],[48.58455,16.57021],[48.07517,16.29150],[ 47.70866,16.04503],[48.190289, 15.629074],[ 47.91546,15.09719],[48.32742,16.06479],[ 48.83029,15.31421],[47.850043, 16.062528],[ 48.60293,15.16988],[ 48.30640,14.28610],[ 48.04702,14.41187],[ 48.16857,14.02376],[ 48.25442,13.04164],[ 48.30312,14.01181],[ 48.50534,14.51290],[ 47.79332,13.94720],[ 48.24764,13.80727],[ 47.90459,14.11779],[48.22376,14.28031],[ 48.25298,14.63943],[48.21296,13.49173],[ 48.59612,13.99442],[ 48.40196,13.55617],[47.90832,14.47703],[ 48.39565,14.29796],[ 48.00208,13.68613],[ 48.11873,13.99293],[ 47.79940,13.04400],[ 47.67939,13.11905],[47.81206,13.19901],[ 47.34503,13.22031],[ 47.12663,13.79250],[47.28589,12.69913],[ 47.07269,15.43614],[46.83005,15.19009],[47.07054,15.43746],[ 46.79038,15.52670],[ 47.37260,15.08956],[47.56555,14.24201],[ 47.10172,14.18910],[47.03326,15.15087],[47.22178,15.63566],[ 47.18507,14.69001],[47.42025,15.27768],[ 47.24785,15.97046],[46.89100,15.84306],[47.27054,11.39509],[ 47.22562,10.72594],[47.23316,11.37635],[ 47.44281,12.39889],[ 47.56576,12.14181],[ 47.12254,10.58013],[ 46.83113,12.76942],[ 47.48598,10.71663],[ 47.34371,11.72865],[ 47.16279,9.82104],[ 47.47733,9.75324],[ 47.42075,9.73708],[47.25995,9.60236],[ 48.19231,16.37136]];
      var maxValue = 0;
      var value = 0;
      var nextBiggerScale = 0;
      maxValue = CoronaComponent.calculateMax(dataID,bezirke);
      nextBiggerScale = CoronaComponent.calculateNextBiggerScale(maxValue);
      bundeslaender_count = [0,0,0,0,0,0,0,0,0];
      bundeslandMax = [0,0,0,0,0,0,0,0,0];
      tableDataBezirk = [];
      tableDataBundesland = [];
      for (var i = 0; i < bezirke.length-1; i++){
        var bezirk = bezirke[i+1].split(';');
        value = CoronaComponent.calculateValue(dataID,bezirk);
        var id = bezirk[1].charAt(0);
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
        if (bundeslandMax[id] < value) {
          bundeslandMax[id] = CoronaComponent.calculateNextBiggerScale(value);
        }
        bundeslaender_count[id] += value;
      }
      for (var i = 0; i < bezirke.length-1; i++){
        var bezirk = bezirke[i+1].split(';');
        value = CoronaComponent.calculateValue(dataID,bezirk);
        var id = bezirk[1].charAt(0);
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
        // Scale to max
        nextBiggerScale = bundeslandMax[id];
        var value_scaled = (value/100*(400/(nextBiggerScale/100)));
        CoronaComponent.visualizeEntry(coordinates[i][0],coordinates[i][1],value_scaled,bezirk[0],value,id,false);
        tableDataBezirk.push({id: id,name: bezirk[0], count: Math.ceil(value)});
      }
      var b_coordinates = [[48.305908,14.286198],[47.26543,11.392769],[47.070868,15.438279],[47.838758,16.536216],[48.193315,15.619872],[48.208354,16.372504],[46.622816,14.30796],[47.502578,9.747292],[47.798135,13.046481]];
      var b_names = ["Oberösterreich","Tirol","Steiermark","Burgenland","Niederösterreich","Wien","Kärten","Vorarlberg","Salzburg"];
      
      var maxBundesland = 0;
      bundeslaender_count.forEach(element => {
        if (maxBundesland < element) {
          maxBundesland = element;
        }
      });
      nextBiggerScale = CoronaComponent.calculateNextBiggerScale(maxBundesland);
      for (var i = 0; i < bundeslaender_count.length; i++){
        CoronaComponent.visualizeEntry(b_coordinates[i][0],b_coordinates[i][1],bundeslaender_count[i]/100*(400/(nextBiggerScale/100)),b_names[i],bundeslaender_count[i],i,true);
        tableDataBundesland.push({name: b_names[i], count: Math.ceil(bundeslaender_count[i])});
      }
      //scene.add(assets);
      MapService.setMaxValue(nextBiggerScale,bundeslandMax);
      
      const data = tableDataBundesland.slice();
      CoronaComponent.sortedData = data.sort((a, b) => {
        return CoronaComponent.compare(a.count, b.count, false);
      });

      this.table.renderRows();
  }

  static changeTable(tmpSort: number){
    sortID = tmpSort;
    var data = tableDataBundesland.slice();
    if (sortID != -1){
      tableDataBezirkSelected = [];
      tableDataBezirk.forEach(element => {
        if (element.id == sortID) {
          tableDataBezirkSelected.push({name: element.name,count: element.count});
        }
      });
      data = tableDataBezirkSelected.slice();
    }
    CoronaComponent.sortedData = data.sort((a, b) => {
      return CoronaComponent.compare(a.count, b.count, false);
    });
  }

  sortData(sort: Sort) {
    var data = tableDataBundesland.slice();
    if (this.visual_particle){
      data = tableDataBezirk.slice();
    } else {
      data = tableDataBundesland.slice();
      if (sortID != -1){
        tableDataBezirkSelected = [];
        tableDataBezirk.forEach(element => {
          if (element.id == sortID) {
            tableDataBezirkSelected.push({name: element.name,count: element.count});
          }
        });
        data = tableDataBezirkSelected.slice();
      }
    }
    if (!sort.active || sort.direction === '') {
      CoronaComponent.sortedData = data;
      return;
    }
    CoronaComponent.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return CoronaComponent.compare(a.name, b.name, isAsc);
        case 'count': return CoronaComponent.compare(a.count, b.count, isAsc);
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
    for (var i = 1; i < bezirke.length; i++){
      var bezirk = bezirke[i].split(';');
      value = this.calculateValue(dataID,bezirk);
      if (maxValue < value){
          maxValue = value;
      }
    }
    return maxValue;
  }

  static visualizeEntry(lat,long,height,name,value,id,bundesland){
    let m_coronaData = new THREE.MeshLambertMaterial( {color: 0xc972e1a, transparent: false, opacity: 0.7, emissive: 0x551111} );
    if (height < 1){
      if (height <= 0){
        m_coronaData = new THREE.MeshLambertMaterial( {color: 0x77dd77, transparent: false, opacity: 0.7} );
      }
      height = 1;
    }
    var geometry = new THREE.BoxGeometry( 2, 2, height);
    if (bundesland){
      geometry = new THREE.BoxGeometry( 5, 5, height);
    }
    var cube = new THREE.Mesh( geometry, m_coronaData );
    cube.position.z = height/2;
    cube.position.y = lat * factor - deltaY;
    cube.position.x = long * factor - deltaX;
    cube.layers.set(3);
    cube.userData.id = id;
    cube.userData.name = name;
    cube.userData.value = Math.floor(value);
    if (bundesland){
      RendererComponent.addBundesland(cube);
    } else {
      RendererComponent.addBezirk(cube);
    }
    //RendererComponent.bezirkDataGroup.add(cube);
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
    if (this.selectedData == '2'){
      this.disabled = true;
    } else {
      this.disabled = false;
    }
    if (!this.disabled && this.checkScale){
      if (this.selectedData == '3'){
        if (this.visual_particle){
          this.createParticle(6);
        } else {
          this.visualizeData(6);
        }
      } else if (this.selectedData == '4'){
        if (this.visual_particle){
          this.createParticle(7);
        } else {
          this.visualizeData(7);
        }
      } else if (this.selectedData == '5'){
        if (this.visual_particle){
          this.createParticle(8);
        } else {
          this.visualizeData(8);
        }
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
    if (this.selectedData == '3' || this.selectedData == '6'){
      if (event.checked){
        if (this.visual_particle){
          this.createParticle(6);
        } else {
          this.visualizeData(6);
        }
      } else {
        if (this.visual_particle){
          this.createParticle(8);
        } else {
          this.visualizeData(8);
        }
      }
    } else if (this.selectedData == '4' || this.selectedData == '7'){
      if (event.checked){
        if (this.visual_particle){
          this.createParticle(7);
        } else {
          this.visualizeData(7);
        }
      } else {
        if (this.visual_particle){
          this.createParticle(4);
        } else {
          this.visualizeData(4);
        }
      }
    }  else if (this.selectedData == '5' || this.selectedData == '8'){
      if (event.checked){
        if (this.visual_particle){
          this.createParticle(8);
        } else {
          this.visualizeData(8);
        }
      } else {
        if (this.visual_particle){
          this.createParticle(5);
        } else {
          this.visualizeData(5);
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
