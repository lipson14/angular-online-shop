import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Siinax } from '../siinax';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-details',
  imports: [Footer],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details {

  constructor(public service: Siinax, public router: Router, public cookie: CookieService, public route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      let id = params.get('id')
      if (!id) { this.router.navigate(['/shop']); return }
      this.showProduct(id)
    })

    if (this.cookie.get('user')) {
      this.service.getUserData().subscribe({
        next: (data: any) => { this.currentUserId = data._id; this.checkIfRated() },
        error: () => {}
      })
    }
  }

  product = signal<any>(undefined)
  currentQty = 1
  showReview = false
  selectedRating = 0
  currentUserId: string | null = null
  alreadyRated = false

  // server-ის rating ველი ხანდახან დაგვიანებით ან არასწორად ანახლება ხდება,
  // ამიტომ average-ს ჩვენ თვითონ ვითვლით ratings მასივიდან
  averageRating = 0
  ratingsCount = 0

  showProduct(id: string) {
    this.product.set(undefined)
    this.currentQty = 1

    this.service.getProductById(id).subscribe({
      next: (data: any) => {
        this.product.set(data)
        this.calculateRating(data.ratings || [])
        this.checkIfRated()
      },
      error: (err: any) => console.log(err)
    })
  }

  calculateRating(ratings: any[]) {
    this.ratingsCount = ratings.length
    if (ratings.length === 0) {
      this.averageRating = 0
      return
    }
    let sum = ratings.reduce((acc, r) => acc + r.value, 0)
    this.averageRating = sum / ratings.length
  }

  checkIfRated() {
    if (!this.currentUserId || !this.product()) { this.alreadyRated = false; return }
    let ratings = this.product().ratings || []
    this.alreadyRated = ratings.some((r: any) => r.userId === this.currentUserId)
  }

  changeQty(delta: number) {
    this.currentQty = Math.max(1, this.currentQty + delta)
  }

  addToCart() {
    if (this.product().stock <= 0) { alert("ეს პროდუქტი მარაგში არ არის!"); return }
    if (!this.cookie.get('user')) { alert('ჯერ გაიარეთ ავტორიზაცია!'); return }

    let info = { id: this.product()._id, quantity: this.currentQty }

    this.service.addToCart(info).subscribe({
      next: () => alert(`${this.currentQty} დაემატა კალათაში!`),
      error: (err: any) => { console.log(err); alert("კალათაში დამატება ვერ მოხერხდა") }
    })
  }

  openReview() {
    if (!this.cookie.get('user')) { alert('ჯერ გაიარეთ ავტორიზაცია!'); return }
    if (this.alreadyRated) { alert('თქვენ ეს პროდუქტი უკვე შეაფასეთ!'); return }
    this.showReview = true
  }

  submitRating() {
    if (!this.selectedRating) return

    this.service.rateProduct(this.product()._id, this.selectedRating).subscribe({
      next: () => {
        alert('თქვენი შეფასება მიღებულია!')
        this.showReview = false
        this.selectedRating = 0
        this.showProduct(this.product()._id)
      },
      error: (err: any) => {
        alert('შეფასების მიღება ვერ მოხერხდა')
      }
    })
  }
}
