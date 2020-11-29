import { Component, OnInit } from '@angular/core';
import { CoronaService } from '../services/corona.service';
import { MapService } from '../services/map.service';

interface Data {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-ui-corona',
  templateUrl: './ui-corona.component.html',
  styleUrls: ['./ui-corona.component.css']
})
export class UICoronaComponent implements OnInit {
  checkedAxes = false;
  checkedFill = false;
  checkScale = false;
  disabled = false;
  disabledAxesOptions = true;
  constructor() { }

  ngOnInit(): void {
  }
  data: Data[] = [
    {value: '5', viewValue: 'Infektionen 7 Tage'},
    {value: '3', viewValue: 'Infektionen gesamt'},
    {value: '4', viewValue: 'Todesfälle gesamt'},
    {value: '2', viewValue: 'Bevölkerung'}
  ];
  selectedData = this.data[0].value;
  
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
        CoronaService.visualizeData(6);
      } else if (this.selectedData == '4'){
        CoronaService.visualizeData(7);
      } else if (this.selectedData == '5'){
        CoronaService.visualizeData(8);
      } else {
        console.log("Error: selectData...");
      }
    } else {
      CoronaService.visualizeData(this.selectedData);
    }
  }

  // Check Scale und welcher Datensatz gewählt wurde, keine Rechnung beim 2 (Bevölkerung)
  scaleTo100000(event){
    this.checkScale = event.checked;
    if (this.selectedData == '3' || this.selectedData == '6'){
      if (event.checked){
        CoronaService.visualizeData(6);
      } else {
        CoronaService.visualizeData(3);
      }
    } else if (this.selectedData == '4' || this.selectedData == '7'){
      if (event.checked){
        CoronaService.visualizeData(7);
      } else {
        CoronaService.visualizeData(4);
      }
    }  else if (this.selectedData == '5' || this.selectedData == '8'){
      if (event.checked){
        CoronaService.visualizeData(8);
      } else {
        CoronaService.visualizeData(5);
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
  // Formatert Anzeige beim Slider ToDo 0-100%
  formatLabel(value: number) {
    return value;
  }

  static setMaxValue(value){
    console.log(value);
  }
}