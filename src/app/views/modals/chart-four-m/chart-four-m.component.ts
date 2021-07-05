import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { StockService } from "../../../services/stock.service";
import { StorageService } from "../../../services/storage.service";
import { Column } from "@antv/g2plot";
import { AfterViewInit } from "@angular/core";
import * as data from "../../../../data/database.json";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "app-chart-four-m",
  templateUrl: "./chart-four-m.component.html",
  styleUrls: ["./chart-four-m.component.scss"],
})
export class ChartFourMComponent implements OnInit, AfterViewInit {
  @ViewChild("eleChart", { read: ElementRef }) eleChart: ElementRef;
  @ViewChild("searchInput", { read: ElementRef }) searchInput: ElementRef;
  @ViewChild("result", { static: false }) result: ElementRef;
  title: string;
  stockCode: string = "";
  endYear: number = 2020;
  body: any = {};
  chart: any;
  chartConfig: any;
  inputCode: string;
  searchResult: any[] = [];
  listScores: any = [];
  listCodeStockCompare: any[] = [];
  public inside = false;
  public code: any = (data as any).default;
  currentChooseStock = "";
  showError: boolean = false;
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
  constructor(
    public bsModalRef: BsModalRef,
    private stockServ: StockService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.currentChooseStock = this.stockCode;
  }

  ngAfterViewInit() {
    this.stockServ
      .getChart4M({
        ...this.body,
        list_stock_code: [this.stockCode],
      })
      .subscribe((resp: any) => {
        this.listScores = resp.data;
        if (!resp.data.length) {
          this.showError = true;
        }
        this.renderChart(this.listScores);
      });
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
          let arrFilter = JSON.parse(JSON.stringify(this.listCodeStockCompare));
          arrFilter.push(this.stockCode);
          this.searchResult = this.searchResult.filter(
            (stock) => arrFilter.indexOf(stock.code) === -1 && stock.branch
          );
        } else {
          this.searchResult = null;
        }
      });
  }

  chooseStock(stock: any) {
    this.currentChooseStock = stock.code;
    this.inputCode = "";
    this.searchResult = [];
    this.listCodeStockCompare.push(stock.code);
    this.stockServ
      .getChart4M({
        ...this.body,
        list_stock_code: [this.stockCode, ...this.listCodeStockCompare],
      })
      .subscribe((resp: any) => {
        let lengthCheck = this.listScores.length;
        this.listScores = resp.data;
        this.updateChart(this.listScores);
        if (lengthCheck === resp.data.length) {
          this.showError = true;
          this.listCodeStockCompare.splice(
            this.listCodeStockCompare.length - 1,
            1
          );
        }
      });
  }

  removeCode(stockCode: string, index: number) {
    let findIndex = this.listScores.findIndex(
      (item) => item.stock === stockCode
    );
    this.listScores.splice(findIndex, 1);
    this.updateChart(this.listScores);
    this.listCodeStockCompare.splice(index, 1);
  }

  onClosedAlert() {
    this.showError = false;
  }

  updateChart(data: any[]) {
    this.chartConfig.data = JSON.parse(JSON.stringify(data));
    this.chart.update(this.chartConfig);
    this.inside = false;
  }

  renderChart(data: any[]) {
    this.chartConfig = {
      data: data,
      xField: "stock",
      yField: "scores",
      maxColumnWidth: 60,
      width: 400,
      color: ({ stock }) => {
        return stock === this.stockCode ? "#614871" : "#5B8FF9";
      },
      label: {
        position: "middle", // 'top', 'bottom', 'middle',
        style: {
          fill: "#FFFFFF",
          opacity: 0.6,
        },
      },
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      yAxis: {
        grid: {
          line: {
            style: {
              stroke: "#9197b1",
              lineWidth: 0.5,
              lineDash: [3, 5],
              strokeOpacity: 1,
            },
          },
        },
      },
    };

    this.chart = new Column(this.eleChart.nativeElement, this.chartConfig);

    this.chart.render();
  }
}
