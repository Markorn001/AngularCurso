import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
 // template: '<span>Fernando</span>',
  templateUrl: './app.component.html',
  
})

export class AppComponent {
  titulo: string = 'Contador App';
  numero: number = 0;
  base: number= 5;

  acumular(valor: number){
    this.numero+=valor;

  }

  sumar(){
    this.numero+=1000000000000000000;
  }

  restar(){
    this.numero-=1000000000000000000;
  }
}
