import { Component } from '@angular/core';
import {PeriodicTable} from '../../features/periodic-table/periodic-table';

@Component({
  selector: 'app-home',
  imports: [
    PeriodicTable
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
