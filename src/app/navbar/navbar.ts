import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Siinax } from '../siinax';
import { UserInfo } from '../user-info';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  public service = inject(Siinax)
  public cookie = inject(CookieService)
  public router = inject(Router)

  menuOpen = false
  userName = ""

  constructor() {
    this.checkLoginStatus()
  }

  checkLoginStatus() {
    if (!this.cookie.get('user')) return

    this.service.getUserData().subscribe({
      next: (data: UserInfo) => {
        this.userName = `${data.firstName} ${data.lastName}`
      },
      error: () => {
        this.cookie.delete('user')
      }
    })
  }

  isLoggedIn(): boolean {
    return !!this.cookie.get('user')
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen
  }

  navigate(path: string) {
    this.menuOpen = false
    this.router.navigate([path])
  }

  goToProfile() {
    if (this.cookie.get('user')) {
      this.navigate('/profile')
    } else {
      this.openLogin()
    }
  }

  openLogin() {
    this.menuOpen = false
    this.service.openAuthDialog()
  }

  logout() {
    this.cookie.delete('user')
    this.userName = ""
    this.router.navigate(['/'])
  }

  isLightMode = false

  ngOnInit() {
    if (localStorage.getItem('siinaxTheme') === 'light') {
      this.isLightMode = true
      document.body.classList.add('lightMode')
    }
  }

  switchMode() {
    document.body.classList.toggle("lightMode")
    this.isLightMode = document.body.classList.contains('lightMode')
    localStorage.setItem('siinaxTheme', this.isLightMode ? 'light' : 'dark')
  }
}
