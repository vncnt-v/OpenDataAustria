import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RendererComponent } from './renderer/renderer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'renderer', component: RendererComponent},
  { path: 'renderer/:url', component: RendererComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routingComponents = [HomeComponent,RendererComponent]