import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoronaComponent } from './corona/corona.component';
import { HomeComponent } from './home/home.component';
import { ImpfungComponent } from './impfung/impfung.component';
import { RendererComponent } from './renderer/renderer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'corona', component: CoronaComponent },
  { path: 'impfung', component: ImpfungComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routingComponents = [HomeComponent,RendererComponent]