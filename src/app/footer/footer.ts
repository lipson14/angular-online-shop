import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  public router = inject(Router)

  sections = [
    { title: 'HAVE A QUESTION?', items: ['EXPLORE OUR HELP CENTER'], btn: { label: 'VIEW MORE', route: '/help' } },
    { title: 'SHOP', items: ['ALL PRODUCTS', 'BEST SELLERS', 'SALE'], btn: null },
    { title: 'CONTACT', items: ['info@mysyte.com', '500 Terry Francine Street, San Francisco, CA 94158', '123-456-7890'], btn: null },
    { title: 'FOLLOW', items: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE'], btn: null },
    { title: 'LEGAL', items: ['TERMS & CONDITIONS', 'PRIVACY POLICY', 'SHIPPING POLICY', 'REFUND POLICY', 'ACCESSIBILITY STATEMENT'], btn: null }
  ];
}
