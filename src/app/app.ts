import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { AuthDialog } from './auth-dialog/auth-dialog';
import { Siinax } from './siinax';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, AuthDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public service: Siinax) {
    this.toggleLoading()
  }

  isLoading = signal<boolean>(false)

  toggleLoading() {
    this.service.loaderTruck.subscribe((data: boolean) => {
      this.isLoading.set(data)
    })
  }
}
