import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Siinax } from '../siinax';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-home',
  imports: [Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  constructor(public service: Siinax, public router: Router, public cookie: CookieService) {
    this.showProducts()
  }

  products = signal<any>([])

  showProducts() {
    this.service.getProducts(1, 38).subscribe({
      next: (data: any) => {
        let shuffled = data.products.sort(() => Math.random() - 0.5)
        this.products.set(shuffled.slice(0, 4))
      },
      error: (err: any) => console.log(err)
    })
  }

  addToCart(item: any) {
    if (item.stock <= 0) { alert("ეს პროდუქტი მარაგში არ არის!"); return }
    if (!this.cookie.get('user')) { alert('ჯერ გაიარეთ ავტორიზაცია'); return }

    let userQuantity = +prompt("რაოდენობა:", "1")!
    if (!userQuantity || userQuantity < 1) return

    let info = { id: item._id, quantity: userQuantity }

    this.service.addToCart(info).subscribe({
      next: () => alert("დაემატა კალათაში!"),
      error: (err: any) => { console.log(err); alert("კალათაში დამატება ვერ მოხერხდა") }
    })
  }

  goToDetails(id: string) {
    this.router.navigate(['/details'], { queryParams: { id } })
  }
}
