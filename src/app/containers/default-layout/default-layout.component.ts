import { debounceTime } from "rxjs/operators";
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from "@angular/core";
import { navItems } from "../../_nav";
import * as data from "../../../data/database.json";
import { fromEvent } from "rxjs";
import { SharedService } from "../../services/shared.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html",
  styleUrls: ["./default-layout.component.css"],
})
export class DefaultLayoutComponent implements AfterViewInit {
  public sidebarMinimized = false;
  public navItems = navItems;
  public inside = false;

  public code: any = (data as any).default;
  public inputCode: string;
  public searchResult;

  @ViewChild("searchInput", { read: ElementRef }) searchInput: ElementRef;
  @ViewChild("result", { static: false }) result: ElementRef;

  @HostListener("click")
  clicked() {
    this.inside = true;
  }
  @HostListener("document:click", ["$event"])
  clickedOut(event) {
    if (
      !this.searchInput.nativeElement.contains(event.target) &&
      !this.result.nativeElement.contains(event.target)
    ) {
      this.inside = false;
    }
  }

  constructor(private share: SharedService) {}

  ngAfterViewInit(): void {
    this.searchOnTime();
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  searchOnTime() {
    console.log(this.searchInput.nativeElement.value);
  }

  onSearch() {
    fromEvent(this.searchInput.nativeElement, "input")
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (this.inputCode != "") {
          this.searchResult = this.code.filter(
            (res) =>
              res.code.toUpperCase().includes(this.inputCode.toUpperCase()) ||
              res.company
                .trim()
                .toLowerCase()
                .includes(this.inputCode.trim().toLowerCase())
          );
          this.searchResult = this.searchResult.filter((stock) => stock.branch);
        } else {
          this.searchResult = null;
        }
      });
  }

  chooseStock(item) {
    this.inputCode = "";
    this.share.setStock({
      code: item.code,
      company: item.company,
    });
    this.searchResult = [];
    this.inside = false;
  }
}
