import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Shop } from './shop/shop';
import { Details } from './details/details';
import { Profile } from './profile/profile';
import { Help } from './help/help';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  { path: "", component: Home },
  { path: "shop", component: Shop },
  { path: "details", component: Details },
  { path: "profile", component: Profile, canActivate: [authGuard] },
  { path: "help", component: Help },
];
