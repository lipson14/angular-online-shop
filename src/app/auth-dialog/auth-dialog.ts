import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Siinax } from '../siinax';

@Component({
  selector: 'app-auth-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.css'
})
export class AuthDialog {

  isOpen = false
  activeTab: 'login' | 'register' = 'login'

  constructor(public service: Siinax, public cookie: CookieService) {
    this.service.dialogTruck.subscribe((data: boolean) => {
      this.isOpen = data
    })
  }

  close() {
    this.service.closeAuthDialog()
  }

  formInfo: FormGroup = new FormGroup({
    firstName: new FormControl("", [Validators.required, Validators.pattern(/^[A-Z][a-z]{2,}$/)]),
    lastName: new FormControl("", [Validators.required, Validators.pattern(/^[A-Z][a-z]{2,}$/)]),
    age: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(8)]),
    address: new FormControl("", [Validators.required]),
    phone: new FormControl("+995", [Validators.required, Validators.pattern(/^\+995\d{9}$/)]),
    zipcode: new FormControl("", [Validators.required]),
    avatar: new FormControl("", [Validators.required]),
    gender: new FormControl("", [Validators.required])
  })

  loginForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(8)]),
  })

  @ViewChild("registerSMS") registerSMS!: ElementRef
  @ViewChild("loginSMS") loginSMS!: ElementRef

  register() {
    let info = { ...this.formInfo.value, age: Number(this.formInfo.value.age) }

    this.service.signUp(info).subscribe({
      next: (data: any) => {
        this.registerSMS.nativeElement.innerText = "რეგისტრაცია წარმატებულია!"
        this.registerSMS.nativeElement.style.color = "lightgreen"
        setTimeout(() => {
          this.registerSMS.nativeElement.innerText = ""
          this.close()
        }, 1200);
      },
      error: (cudiAmbavi: any) => {
        this.registerSMS.nativeElement.innerText = cudiAmbavi.error?.errorKeys?.join(", ") || "შეცდომა"
        this.registerSMS.nativeElement.style.color = "red"
      }
    })
  }

  login() {
    this.service.signIn(this.loginForm.value).subscribe({
      next: (data: any) => {
        this.cookie.set("user", data.access_token)
        this.loginSMS.nativeElement.innerText = "ავტორიზაცია წარმატებულია"
        this.loginSMS.nativeElement.style.color = "lightgreen"

        setTimeout(() => {
          this.loginSMS.nativeElement.innerText = ""
          this.close()
          window.location.reload()
        }, 1000);
      },
      error: (cudiAmbavi: any) => {
        this.loginSMS.nativeElement.innerText = "ავტორიზაცია ვერ მოხერხდა"
        this.loginSMS.nativeElement.style.color = "red"
        setTimeout(() => {
          this.loginSMS.nativeElement.innerText = ""
        }, 1500);
      }
    })
  }
}
