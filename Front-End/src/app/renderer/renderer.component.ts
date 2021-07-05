import { Component } from '@angular/core';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapService } from '../services/map.service';
import * as THREE from 'three';
import { CoronaComponent } from '../corona/corona.component';

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent {
  module: string;
  // REQUEST MAP
  constructor(public map: MapService) { }
  // THREE JS Main Scene
  static scene;
  // Bundesländer Group
  static bundeslaenderGroup = new THREE.Group;
  // Bezirke Group
  static bezirkDataGroup = new THREE.Group;
  static bundeslandDataGroup = new THREE.Group;

  static selected = false;
  static selectedBundesland = 0;

  start(scala) {
    // Create new THREE JS Scene
    RendererComponent.scene = new THREE.Scene();

    RendererComponent.bezirkDataGroup.visible = false;

    // Raycast Bundesländer 
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(2);
    var INTERSECTED;
    // Raycast Bezirke
    const raycasterData = new THREE.Raycaster();
    raycasterData.layers.set(3);
    var INTERSECTEDDATA;

    // Get Mouse Position
    const mouse = new THREE.Vector2();
    const mouse_drag_pos = new THREE.Vector2();
    const mouse_r = new THREE.Vector2();
    mouse.x = 0;
    mouse.y = 0;

    // Set Camera
    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.x = 142.93;
    camera.position.y = 174.46;
    camera.position.z = 432.38;
    camera.lookAt( 0, 0, 0 );
    camera.layers.enable(2);
    camera.layers.enable(3);

    // THREE JS Components
    var renderer =  new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#050505");
    //renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add Controls
    var controls = new OrbitControls( camera, renderer.domElement );
    // Add Light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(0,-1,1);
    RendererComponent.scene.add( directionalLight );

    // Update function
    var render = function(){
      controls.update();
      
      var bezirkHit = false;      
      // Raycast Bezirke
      raycasterData.setFromCamera( mouse, camera );
      const intersectsData = raycasterData.intersectObjects( RendererComponent.scene.children, true );
      for (var i = 0; i < intersectsData.length && i < 10; i++){
        if (intersectsData[i] && intersectsData[i].object.visible == true) {
          bezirkHit = true;
          if (INTERSECTEDDATA != intersectsData[i].object){
            if ( INTERSECTEDDATA ) INTERSECTEDDATA.material.emissive.setHex( INTERSECTEDDATA.currentHex );
            if (document.getElementById('info-text') != null){
              
              INTERSECTEDDATA = intersectsData[i].object;
              document.getElementById('info-text').innerHTML = String(intersectsData[i].object.userData.name+"<br>"+Math.ceil(intersectsData[i].object.userData.value));
              document.getElementById('info-box').style.display = "block";
              document.getElementById('info-box').style.top = String(mouse_r.y)+"px";
              document.getElementById('info-box').style.left = String(mouse_r.x+10)+"px";
              INTERSECTEDDATA.currentHex = INTERSECTEDDATA.material.emissive.getHex();
              INTERSECTEDDATA.material.emissive.setHex( 0xff0000 );
            }
          }
          break;
        }
      }
      if (!bezirkHit){
        if ( INTERSECTEDDATA ) INTERSECTEDDATA.material.emissive.setHex( INTERSECTEDDATA.currentHex );
        INTERSECTEDDATA = null;
        if (document.getElementById('info-text') != null){
          document.getElementById('info-box').style.display = "none";
        }
      }

      // Raycast Bundesländer
      if (!bezirkHit) {
        raycaster.setFromCamera( mouse, camera );
        const intersects = raycaster.intersectObjects( RendererComponent.scene.children, true );
        if (intersects.length > 0 && intersects[0]) {
          if ( INTERSECTED != intersects[ 0 ].object && intersects[ 0 ].object.visible == true) {
            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex( 0x800000 );
          }
        } else {
          if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
          INTERSECTED = null;
        }
      } else {
        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
      }
      
      // THREE JS Components
      requestAnimationFrame(render);
      renderer.render(RendererComponent.scene,camera);
    }
    
    // Add Click Event
    var canvas_model = document.getElementsByTagName('canvas');
    if (canvas_model.length > 0){
      
      canvas_model[0].addEventListener('pointerdown', function(event){
        var bounds = canvas_model[0].getBoundingClientRect();
        mouse_drag_pos.x = ((event.clientX - bounds.left) / canvas_model[0].clientWidth ) * 2 - 1;
        mouse_drag_pos.y = - ((event.clientY - bounds.top) / canvas_model[0].clientHeight ) * 2 + 1;
      }, false)
      canvas_model[0].addEventListener('click', function(event){
        // Get Mouse Position
        var bounds = canvas_model[0].getBoundingClientRect();
        mouse.x = ( (event.clientX - bounds.left) / canvas_model[0].clientWidth ) * 2 - 1;
        mouse.y = - ( (event.clientY - bounds.top) / canvas_model[0].clientHeight ) * 2 + 1;
        if (mouse.x != mouse_drag_pos.x && mouse.y != mouse_drag_pos.y) {
          return;
        }
        // Raycast Bundesland
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects(RendererComponent.scene.children, true);
        if (intersects.length > 0) {
          // Check if show Bundesland or show all
          if (RendererComponent.bezirkDataGroup.children.length <= 0){
            return;
          }
          if(!RendererComponent.selected){
            RendererComponent.bundeslandDataGroup.visible = false;
            RendererComponent.bezirkDataGroup.visible = true;
            RendererComponent.bundeslandDataGroup.children.forEach(item => {
              item.visible = false;
            });
            // Check if Bezirk Obj id == raycasted value
            RendererComponent.bezirkDataGroup.children.forEach(item => {
              if(intersects[0].object.userData.value == item.userData.id){
                item.visible = true;
              } else {
                item.visible = false;
              }
            });
            // Check if Bundesland Obj id == raycasted value
            RendererComponent.bundeslaenderGroup.children.forEach(item => {
              if(intersects[0].object.userData.value == item.userData.value){
                item.visible = true;
              } else {
                item.visible = false;
              }
            });
            RendererComponent.selectedBundesland = intersects[0].object.userData.value;
            RendererComponent.selected = true;
            CoronaComponent.changeTable(intersects[0].object.userData.value);
            MapService.setBundeslandScala(intersects[0].object.userData.value);
            document.getElementById('show-all-button').classList.remove("hide");
          } else {
            var tmpBool = false;
            // Check if clicked selected Bundesland to show all
            RendererComponent.bundeslaenderGroup.children.forEach(item => {
              if (intersects[0].object.userData.value == item.userData.value){
                if (item.visible == true){
                  tmpBool = true;
                }
              }
            });
            // Show all Bundeslaender
            if (tmpBool){
              CoronaComponent.changeTable(-1);
              MapService.setMaxValueAll();
              RendererComponent.bezirkDataGroup.visible = false;
              RendererComponent.bundeslandDataGroup.visible = true;
              RendererComponent.bundeslaenderGroup.children.forEach(item => {
                item.visible = true;
              });
              RendererComponent.bezirkDataGroup.children.forEach(item => {
                item.visible = false;
              });
              RendererComponent.bundeslandDataGroup.children.forEach(item => {
                item.visible = true;
              });
              RendererComponent.selected = false;
              document.getElementById('show-all-button').classList.add("hide");
            }
          }
        }
      }, false)
    }

    // Add click event show all btn
    document.getElementById('show-all-button').addEventListener('click', function(event){
      CoronaComponent.changeTable(-1);
      MapService.setMaxValueAll();
      RendererComponent.bezirkDataGroup.visible = false;
      RendererComponent.bundeslandDataGroup.visible = true;
      RendererComponent.bundeslaenderGroup.children.forEach(item => {
        item.visible = true;
      });
      RendererComponent.bezirkDataGroup.children.forEach(item => {
        item.visible = false;
      });
      RendererComponent.bundeslandDataGroup.children.forEach(item => {
        item.visible = true;
      });
      RendererComponent.selected = false;
      document.getElementById('show-all-button').classList.add("hide");
    }, false);

    // THREE JS Resize function
    window.addEventListener('resize',() => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    })
    
    // Add mousemove event
    window.addEventListener( 'mousemove',(event) => {
      event.preventDefault();
      mouse_r.x = event.clientX;
      mouse_r.y = event.clientY;
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    })

    render();
    if (scala){
      this.map.setUp(true);
    } else {
      this.map.setUp(false);
    }
    
    RendererComponent.scene.add(RendererComponent.bundeslaenderGroup);
    RendererComponent.scene.add(RendererComponent.bundeslandDataGroup);
    RendererComponent.scene.add(RendererComponent.bezirkDataGroup);
  }

  static showAll() {
    RendererComponent.bezirkDataGroup.visible = false;
      RendererComponent.bundeslandDataGroup.visible = true;
      RendererComponent.bundeslaenderGroup.children.forEach(item => {
        item.visible = true;
      });
      RendererComponent.bezirkDataGroup.children.forEach(item => {
        item.visible = false;
      });
      RendererComponent.bundeslandDataGroup.children.forEach(item => {
        item.visible = true;
      });
      RendererComponent.selected = false;
      document.getElementById('show-all-button').classList.add("hide");
  }
  static addBezirk(entry: THREE.Mesh){
    if (RendererComponent.selected) {
      if (entry.userData.id != RendererComponent.selectedBundesland){
        entry.visible = false;
      } else {
        entry.visible = true;
      }
    } else {
      entry.visible = false;
    }
    RendererComponent.bezirkDataGroup.add(entry);
  }
  static addBundesland(entry: THREE.Mesh){
    if (RendererComponent.selected) {
      entry.visible = false;
    }
    RendererComponent.bundeslandDataGroup.add(entry);
  }
}