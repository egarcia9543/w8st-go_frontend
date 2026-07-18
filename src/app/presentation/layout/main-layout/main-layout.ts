import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { SideMenu } from '../../components/molecules/side-menu/side-menu';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HlmSidebarImports, SideMenu],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
