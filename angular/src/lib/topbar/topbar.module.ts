import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon';
import { ListModule } from '../list';
import { ListItemModule } from '../list-item';
import { ListSeparatorModule } from '../list-separator';
import { TopbarComponent } from './topbar.component';
import { TopbarBrandComponent } from './topbar-brand.component';
import { TopbarMobileComponent } from './topbar-mobile.component';
import { TopbarNavComponent } from './topbar-nav.component';
import { TopbarRightComponent } from './topbar-right.component';

@NgModule({
  imports: [
    CommonModule,
    IconModule,
    ListModule,
    ListItemModule,
    ListSeparatorModule,
  ],
  declarations: [
    TopbarComponent,
    TopbarBrandComponent,
    TopbarMobileComponent,
    TopbarNavComponent,
    TopbarRightComponent,
  ],
  exports: [
    TopbarComponent,
    TopbarBrandComponent,
    TopbarMobileComponent,
    TopbarNavComponent,
    TopbarRightComponent,
  ],
})
export class TopbarModule {}
