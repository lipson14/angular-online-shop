import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserInfo } from './user-info';

@Injectable({
  providedIn: 'root',
})
export class Siinax {

  constructor(private http: HttpClient, private cookie: CookieService) {}

  loaderTruck: BehaviorSubject<boolean> = new BehaviorSubject(false)
  dialogTruck: BehaviorSubject<boolean> = new BehaviorSubject(false)

  openAuthDialog() {
    this.dialogTruck.next(true)
  }

  closeAuthDialog() {
    this.dialogTruck.next(false)
  }

  // --- auth

  signUp(info: any) {
    return this.http.post("https://api.everrest.educata.dev/auth/sign_up", info)
  }

  signIn(info: any) {
    return this.http.post("https://api.everrest.educata.dev/auth/sign_in", info)
  }

  getUserData() {
    return this.http.get<UserInfo>('https://api.everrest.educata.dev/auth', { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  updateUserInfo(info: any) {
    return this.http.patch("https://api.everrest.educata.dev/auth", info, { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.patch("https://api.everrest.educata.dev/auth/change_password", { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  // --- products

  getProducts(pageIndex: any, pageSize: number = 15) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/all?page_index=${pageIndex}&page_size=${pageSize}`)
  }

  getProductById(id: string) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/id/${id}`)
  }

  getCategories() {
    return this.http.get("https://api.everrest.educata.dev/shop/products/categories")
  }

  getBrands() {
    return this.http.get("https://api.everrest.educata.dev/shop/products/brands")
  }

  filterByBrands(item: string) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/search?page_index=1&page_size=40&keywords=${item}`)
  }

  filterByCategory(id: string) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/search?page_index=1&page_size=40&category_id=${id}`)
  }

  filterByPrice(min: number, max: number) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/search?page_index=1&page_size=40&sort_by=price&price_min=${min}&price_max=${max}`)
  }

  filterByAll(keyWords: string, category: string, min: number, max: number, rating: number, sortBy: string, direction: string, brand: string) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/search?page_index=1&page_size=30&keywords=${keyWords}&category_id=${category}&brand=${brand}&rating=${rating}&price_min=${min}&price_max=${max}${sortBy ? '&sort_by=' : ''}${sortBy}${direction ? '&sort_direction=' : ''}${direction}`)
  }

  searchProducts(keywords: string) {
    return this.http.get(`https://api.everrest.educata.dev/shop/products/search?page_index=1&page_size=20&keywords=${keywords}`)
  }

  rateProduct(productId: string, rate: number) {
    return this.http.post("https://api.everrest.educata.dev/shop/products/rate", { productId, rate }, { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  // --- cart

  getCart() {
    return this.http.get("https://api.everrest.educata.dev/shop/cart", { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  postToCart(info: any) {
    return this.http.post("https://api.everrest.educata.dev/shop/cart/product", info, { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  patchToCart(info: any) {
    return this.http.patch("https://api.everrest.educata.dev/shop/cart/product", info, { headers: { Authorization: `Bearer ${this.cookie.get('user')}` } })
  }

  addToCart(info: any) {
    return new Observable<any>(observer => {
      this.patchToCart(info).subscribe({
        next: (data: any) => {
          if (data?._id || Array.isArray(data?.products)) {
            observer.next(data)
            observer.complete()
          } else {
            this.postToCart(info).subscribe({
              next: (data2) => { observer.next(data2); observer.complete() },
              error: (err) => observer.error(err)
            })
          }
        },
        error: () => {
          this.postToCart(info).subscribe({
            next: (data2) => { observer.next(data2); observer.complete() },
            error: (err) => observer.error(err)
          })
        }
      })
    })
  }

  deleteFromCart(id: string) {
    return this.http.delete(`https://api.everrest.educata.dev/shop/cart/product`, {
      headers: { Authorization: `Bearer ${this.cookie.get('user')}` },
      body: { id }
    })
  }

  getThumbnail(url: string): string {
    return url?.includes('alta')
      ? 'https://png.pngtree.com/png-vector/20190820/ourmid/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg'
      : url;
  }
}
