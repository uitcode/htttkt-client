import { CommonModule } from "@angular/common";
import { TabsModule } from "ngx-bootstrap/tabs";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChartsModule } from "ng2-charts";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ButtonsModule } from "ngx-bootstrap/buttons";

import { DashboardComponent } from "./dashboard.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { LoadingComponent } from "../loading/loading.component";
import { TooltipModule } from "ngx-bootstrap/tooltip";

@NgModule({
  imports: [
    FormsModule,
    DashboardRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    TabsModule,
    CommonModule,
    TooltipModule,
  ],
  declarations: [DashboardComponent, LoadingComponent],
})
export class DashboardModule {}
