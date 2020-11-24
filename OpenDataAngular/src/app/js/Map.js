import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"




var m_bundesland = new THREE.LineBasicMaterial( {color: 0xDE1232,});
var m_bundeslandAxes = new THREE.LineBasicMaterial( {color: 0x424242 });
var m_bundeslandAxesFilled = new THREE.MeshLambertMaterial( {color: 0x333333 });
// Zentralisierung der Map auf (0,0,0)
var deltaX = 730;
var deltaY = 2600;
var factor = 55;



function loadMapData(){
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
    });
}
function initMapData(data){
    var obj = JSON.parse(data);
    // austria.json
    // obj['features'][ ** BUNDENLAND ** ]['geometry']['coordinates'][ ** immer 0 außer Tirol dort 0,1 ** ][ ** KOORDINATEN INDEX **] - [0] x koodinate, [1] y koordinate
    // Ausnahe bei Tirol
    for (i = 0; i < obj['features'].length; i++){
        for (j = 0; j < obj['features'][i]['geometry']['coordinates'].length; j++){
            var vectors = [];
            if (i != 1){
                for (k = 0; k < obj['features'][i]['geometry']['coordinates'][j].length; k++){
                    vectors.push(new THREE.Vector2( obj['features'][i]['geometry']['coordinates'][j][k][0]*factor-deltaX, obj['features'][i]['geometry']['coordinates'][j][k][1]*factor-deltaY));
                }
            } else {
                for (k = 0; k < obj['features'][i]['geometry']['coordinates'][j][0].length; k++){
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