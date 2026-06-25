import { Component, signal } from '@angular/core';
import { Siinax } from '../siinax';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from '../user-info';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, Footer, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  constructor(public service: Siinax, public router: Router, public cookie: CookieService) {
    this.showMyInfo()
    this.showCart()
  }

  myInfo = signal<UserInfo | undefined>(undefined)
  cartItems = signal<any>([])
  cartLoading = signal<boolean>(true)

  gamochenili: boolean = false
  showPasswordPopup: boolean = false
  avatarError = false

  formInfo: FormGroup = new FormGroup({
    firstName: new FormControl("", [Validators.required]),
    lastName: new FormControl("", [Validators.required]),
    age: new FormControl("", [Validators.required]),
    address: new FormControl("", [Validators.required]),
    phone: new FormControl("+995", [Validators.required]),
    zipcode: new FormControl("", [Validators.required]),
    avatar: new FormControl("", [Validators.required]),
    gender: new FormControl("", [Validators.required])
  })

  passwordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
    newPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)])
  })

  passwordMsg = ""
  passwordErr = false

  showMyInfo() {
    this.service.getUserData().subscribe({
      next: (data: UserInfo) => {
        this.myInfo.set(data)

        this.formInfo.setValue({
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          address: data.address,
          phone: data.phone,
          zipcode: data.zipcode,
          avatar: data.avatar,
          gender: data.gender
        })
      },
      error: (err: any) => console.log(err)
    })
  }

  updateUser() {
    this.service.updateUserInfo(this.formInfo.value).subscribe({
      next: (data: any) => {
        alert("პროფილი წარმატებით განახლდა, გთხოვთ გაიაროთ ავტორიზაცია თავიდან")
        this.cookie.delete("user")
        this.router.navigate(["/"])
      },
      error: (cudii: any) => console.log(cudii)
    })
  }

  changePassword() {
    let { oldPassword, newPassword, confirmPassword } = this.passwordForm.value

    if (newPassword !== confirmPassword) {
      this.passwordErr = true
      this.passwordMsg = "ახალი პაროლები არ ემთხვევა"
      return
    }

    this.service.changePassword(oldPassword, newPassword).subscribe({
      next: (data: any) => {
        if (data.access_token) {
          this.cookie.set("user", data.access_token)
        }
        this.passwordErr = false
        this.passwordMsg = "პაროლი წარმატებით შეიცვალა!"
        setTimeout(() => {
          this.passwordMsg = ""
          this.showPasswordPopup = false
          this.passwordForm.reset()
        }, 1500)
      },
      error: (err: any) => {
        this.passwordErr = true
        this.passwordMsg = err.error?.message || err.error?.errorKeys?.join(", ") || "პაროლის შეცვლა ვერ მოხერხდა"
      }
    })
  }

  // --- cart

  total = signal<number>(0)

  showCart() {
    this.cartLoading.set(true)
    this.service.getCart().subscribe({
      next: (data: any) => {
        let rawProducts = data.products || []

        if (rawProducts.length === 0) {
          this.cartItems.set([])
          this.calcTotal()
          this.cartLoading.set(false)
          return
        }

        // თუ cart-ის items-ს არ აქვს price/title (მხოლოდ id+quantity), თითოეულს
        // სრული პროდუქტის დატა მოვუტანოთ getProductById-ით
        let needsEnrichment = !rawProducts[0].price || !rawProducts[0].title

        if (!needsEnrichment) {
          this.cartItems.set(rawProducts)
          this.calcTotal()
          this.cartLoading.set(false)
          return
        }

        let enrichedCount = 0
        let enrichedItems: any[] = []

        rawProducts.forEach((cartItem: any) => {
          let productId = cartItem.id || cartItem._id || cartItem.productId
          this.service.getProductById(productId).subscribe({
            next: (fullProduct: any) => {
              enrichedItems.push({ ...fullProduct, quantity: cartItem.quantity, _id: productId })
              enrichedCount++
              if (enrichedCount === rawProducts.length) {
                this.cartItems.set(enrichedItems)
                this.calcTotal()
                this.cartLoading.set(false)
              }
            },
            error: () => {
              enrichedCount++
              if (enrichedCount === rawProducts.length) {
                this.cartItems.set(enrichedItems)
                this.calcTotal()
                this.cartLoading.set(false)
              }
            }
          })
        })
      },
      error: (err: any) => {
        this.cartItems.set([])
        this.cartLoading.set(false)
      }
    })
  }

  calcTotal() {
    let sum = this.cartItems().reduce((acc: number, item: any) => acc + (item.price?.current || 0) * item.quantity, 0)
    this.total.set(sum)
  }

  changeQty(item: any, delta: number) {
    let newQty = Math.max(1, item.quantity + delta)
    this.service.patchToCart({ id: item._id, quantity: newQty }).subscribe(() => {
      item.quantity = newQty
      this.calcTotal()
    })
  }

  removeItem(id: string) {
    this.service.deleteFromCart(id).subscribe({
      next: () => {
        this.cartItems.set(this.cartItems().filter((i: any) => i._id !== id))
        this.calcTotal()
      },
      error: (err: any) => {
        alert('წაშლა ვერ მოხერხდა')
      }
    })
  }
}
