import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Siinax } from '../siinax';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-shop',
  imports: [FormsModule, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {

  constructor(public service: Siinax, public router: Router, public cookie: CookieService) {
    this.showCards(1);
    this.showCategories();
    this.showBrands();
  }

  products = signal<any>([]);
  pages = signal<any>([]);
  categoryList = signal<any>([]);
  brandList = signal<any>([]);
  currentPage: number = 1;
  pageSize: number = 15;

  // --- search/filter state
  keyWords: string = ""
  activeCategory: string = ""
  activeBrand: string = ""
  minPrice: number | null = null
  maxPrice: number | null = null
  activeRating: number = 0

  showCategories() {
    this.service.getCategories().subscribe((data: any) => this.categoryList.set(data))
  }

  showBrands() {
    this.service.getBrands().subscribe((data: any) => this.brandList.set(data))
  }

  showCards(item: any) {
    this.currentPage = item;
    this.resetActiveFilters();

    this.service.getProducts(this.currentPage, this.pageSize).subscribe({
      next: (data: any) => {
        this.products.set(data.products);
        let maxPage = Math.ceil(data.total / data.limit);
        let pageList = [];
        for (let i = 1; i <= maxPage; i++) pageList.push(i);
        this.pages.set(pageList);
      },
      error: (badData: any) => console.log(badData)
    });
  }

  changeSize(event: any) {
    this.pageSize = Number(event.target.value);
    this.showCards(1);
  }

  goPrev() {
    if (this.currentPage > 1) this.showCards(this.currentPage - 1)
  }

  goNext() {
    if (this.currentPage < this.pages().length) this.showCards(this.currentPage + 1)
  }

  resetActiveFilters() {
    this.activeCategory = ""
    this.activeBrand = ""
    this.activeRating = 0
  }

  changeCategory(cat: any) {
    this.resetActiveFilters()
    this.activeCategory = cat.id
    this.pages.set([])
    this.service.filterByCategory(cat.id).subscribe((data: any) => this.products.set(data.products))
  }

  changeBrand(item: string) {
    this.resetActiveFilters()
    this.activeBrand = item
    this.pages.set([])
    this.service.filterByBrands(item).subscribe((data: any) => this.products.set(data.products))
  }

  applyPrice() {
    this.resetActiveFilters()
    this.pages.set([])
    let min = this.minPrice ?? 0
    let max = this.maxPrice ?? 99999
    this.service.filterByPrice(min, max).subscribe((data: any) => this.products.set(data.products))
  }

  filterByRating(min: number) {
    this.resetActiveFilters()
    this.activeRating = min
    this.pages.set([])
    this.service.getProducts(1, 40).subscribe((data: any) => {
      let filtered = min > 0 ? data.products.filter((p: any) => p.rating >= min) : data.products
      this.products.set(filtered)
    })
  }

  search() {
    if (!this.keyWords.trim()) { this.showCards(1); return }
    this.pages.set([])
    this.service.searchProducts(this.keyWords).subscribe((data: any) => this.products.set(data.products))
  }

  addToCart(item: any) {
    if (item.stock <= 0) { alert("ეს პროდუქტი მარაგში არ არის!"); return }
    if (!this.cookie.get('user')) { alert('ჯერ გაიარეთ ავტორიზაცია'); return }

    let userQuantity = +prompt("რაოდენობა:", "1")!
    if (!userQuantity || userQuantity < 1) return
    if (item.stock > 0 && userQuantity > item.stock) { alert(`მხოლოდ ${item.stock} ცალია მარაგში`); return }

    let info = { id: item._id, quantity: userQuantity }

    this.service.addToCart(info).subscribe({
      next: () => alert("დაემატა კალათაში!"),
      error: (err: any) => { console.log(err); alert("კალათაში დამატება ვერ მოხერხდა") }
    })
  }

  goToDetails(id: string) {
    this.router.navigate(['/details'], { queryParams: { id } })
  }

  // --- mobile sidebar
  sidebarOpen = false
  openSidebar() { this.sidebarOpen = true }
  closeSidebar() { this.sidebarOpen = false }
}
