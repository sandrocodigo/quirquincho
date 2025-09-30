import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.scss']
})
export class ArchivosComponent {

  constructor(private titleService: Title) {  }

  ngOnInit(): void {
    this.titleService.setTitle('Archivos');
  }
}
