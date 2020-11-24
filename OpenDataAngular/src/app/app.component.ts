import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSVReader } from "bower_components/angular-csv-import/dist/angular-csv-import.js"

import * as Map from "./js/Map";
import "./js/CoronaData";
import Austria from '../assets/austria.json';
//import {Corona} from '../assets/CovidFaelle_GKZ';
import { Observable } from 'rxjs';


import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
declare global {
   interface Window {
      THREE: typeof THREE;
   }
}

window.THREE = THREE;
const covidData = [];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class AppComponent implements OnInit {
  
  url = 'https://covid19-dashboard.ages.at/data/CovidFaelle_GKZ.csv';
  
  //covidData: string[] = [];
  
  
  constructor(private httpClient: HttpClient) { }

  sendGetRequest() {
    
    return this.httpClient.get(this.url, {responseType: 'text'});
  }
  
  ngOnInit(): void {

    var count=5;
    console.log(Austria);
    this.sendGetRequest().subscribe(data => {
      const list = data.split('\n');
      list.forEach( e => {
        
      covidData.push(e);
      });
      });
      console.log(count);
      console.log(covidData[0]);
      console.log(covidData);
      for(var covid of covidData)
      {
          console.log(covid);
      }
      

    // Make scene global
    var scene;
    // Setup der Scene
    // Ein erstelltes Object muss der Scene hinzugefügt werden um angezeigt zu werden!
    scene = new THREE.Scene();
    // Perspektivische Kamera mit einer Sichtweite von min 0.1 und max 10.000 sowie 50 als Krümmung der Perspektive
    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.z = 300;
    camera.lookAt( 0, 0, 0 );
    var renderer =  new THREE.WebGLRenderer({antialias: true});
    // Background
    renderer.setClearColor("#151515");
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // Add Orbit Controls
    var controls = new OrbitControls( camera, renderer.domElement );
    // Add Light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(0,-1,1);
    scene.add( directionalLight );
    // Update function
    var render = function(){
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene,camera);
    }
    // Resize function
    window.addEventListener('resize',() => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    })
    render();
    console.log(renderer);
    // Load Map von Map.js 
    loadMapData();

    var m_bundesland = new THREE.LineBasicMaterial( {color: 0xDE1232,});
    var m_bundeslandAxes = new THREE.LineBasicMaterial( {color: 0x424242 });
    var m_bundeslandAxesFilled = new THREE.MeshLambertMaterial( {color: 0x333333 });
    // Zentralisierung der Map auf (0,0,0)
    var deltaX = 730;
    var deltaY = 2600;
    var factor = 55;

    

    function loadMapData(){
      /*
        $.ajax({
            method: 'GET',
            // Aktuelle Quelle: https://github.com/ginseng666/GeoJSON-TopoJSON-Austria/blob/master/2017/simplified-99.9/laender_999_geo.json?short_path=02c6e78
            // Irgendwie etwas verzerrt...
            // Sicher besser:
            // Quelle: https://www.data.gv.at/katalog/dataset/51bdc6dc-25ae-41de-b8f3-938f9056af62
            url: 'data/austria.json',
            dataType: 'text',
            success: function (data) {
                initMapData(data);
            },
            error: function() {
                alert("Error load map");
            }
        });*/}
      initMapData(Austria);

    
    function initMapData(data){
        var obj = data;
        // austria.json
        // obj['features'][ ** BUNDENLAND ** ]['geometry']['coordinates'][ ** immer 0 außer Tirol dort 0,1 ** ][ ** KOORDINATEN INDEX **] - [0] x koodinate, [1] y koordinate
        // Ausnahe bei Tirol
        for (let i = 0; i < obj['features'].length; i++){
            for (let j = 0; j < obj['features'][i]['geometry']['coordinates'].length; j++){
                var vectors = [];
                if (i != 1){
                    for (let k = 0; k < obj['features'][i]['geometry']['coordinates'][j].length; k++){
                        vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][k][1]*factor-deltaY));
                    }
                } else {
                    for (let k = 0; k < obj['features'][i]['geometry']['coordinates'][j][0].length; k++){
                        vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][0][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][0][k][1]*factor-deltaY));
                    }
                }
                // Draw red line Bundesland
                drawBundesland(vectors);
                // Draw white line Bundesland (kann bei z.B.: 1.000 als "Achse" stehen, teils als Fläche um nur die zu sehen welche die 1.000 Grenze überschreiten oder nur als Linie)
                drawBundeslandAxes(vectors);
                // ** TEST ** Draw Kärnten Fläche **
                if (i == 6){    
                    drawBundeslandAxesFilled(vectors);
                }
            }
        }
    }
    function drawBundesland(vectors){
        var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
        var line = new THREE.Line( geometry, m_bundesland );
        scene.add( line );
    }
    function drawBundeslandAxes(vectors){
        // Linie
        var geometry = new THREE.BufferGeometry().setFromPoints(vectors);
        var line = new THREE.Line( geometry, m_bundeslandAxes );
        line.position.z = 101;
        scene.add( line );
    }
    function drawBundeslandAxesFilled(vectors){
        // Fläche
        var geometry = new THREE.ShapeBufferGeometry(new THREE.Shape(vectors));
        var mesh = new THREE.Mesh( geometry, m_bundeslandAxesFilled );
        mesh.position.z = 100;
        scene.add( mesh );
    }
    // Load Corona Data von CoronaData.js
    initCoronaData(covidData);
    // Balken Farbe
    var m_coronaData = new THREE.MeshLambertMaterial( {color: 0x2194ce, transparent: true, opacity: 0.5, emissive: 0x7a2c2c} );


    function initCoronaData(data){
        // CovidFaelle_GKZ.csv bezirke durch Newlines getrennt
        console.log(typeof(data));
        console.log(data)
        //var bezirke = data.split('\n');
        // Provisorische Testung mit Koordinaten der ersten 12 Bezirke
        // Keine abdeckende Fläche sondern nur ein Balkon
        // ** ToDo - neues Konzept **
        var coordinates = [[47.84565,16.52327],[48.2999988,15.916663],[47.84565,16.52327],[47.0666664,16.3166654],[46.93848,16.14158],[47.73333,16.4],[47.94901,16.8417],[47.494970,16.508790],[47.28971,16.20595],[46.636460,14.312225],[46.61028,13.85583],[46.62722,13.36722]];
        for (let i = 0; i < data.length && i < 12; i++){
            // bezirk daten werden durch ";" getrennt
            // [0] Bezirk, [1] GKZ, [2] AnzEinwohner, [3] Anzahl, [4] AnzahlTot, [5] AnzahlFaelle7Tage
            var bezirk = data[i].split(';');
            visualizeEntry(coordinates[i][0],coordinates[i][1],bezirk[5]);
        }
        // **Test** Wien
        let y1 = data as string[][];
        //console.log(y1[0].length+"L;da");
        //bezirk = y1[data.length-1].split(';');
        visualizeEntry(48.210033,16.363449,bezirk[5]);
        // **Test**
    }
    function visualizeEntry(lat,long,height){
        // Max höhe festlegen und alle Einträge dazu in relation setzen, um ausbrüche wie bei Wien zuvermeiden
        // ** ToDo **
        var geometry = new THREE.BoxGeometry( 2, 2, height);
        var cube = new THREE.Mesh( geometry, m_coronaData );
        // deltaY, deltaX, factor von Map.js (Zentrierung der Map)
        cube.position.z = height/2;
        cube.position.y = lat * factor - deltaY;
        cube.position.x = long * factor - deltaX;
        scene.add(cube);
    }

    
  }
  

}
