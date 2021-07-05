import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Line, LineOptions } from "@antv/g2plot";
import { AfterViewInit } from "@angular/core";
import { HostListener } from "@angular/core";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
import * as data from "../../../../data/database.json";
import { StockService } from "../../../services/stock.service";
import { StorageService } from "../../../services/storage.service";

@Component({
  selector: "app-chart-value",
  templateUrl: "./chart-value.component.html",
  styleUrls: ["./chart-value.component.scss"],
})
export class ChartValueComponent implements OnInit, AfterViewInit {
  @ViewChild("eleChart", { read: ElementRef }) eleChart: ElementRef;
  @ViewChild("searchInput", { read: ElementRef }) searchInput: ElementRef;
  @ViewChild("result", { static: false }) result: ElementRef;
  title: string;
  data: any[] = [];
  keyValue: string = "doanh_so";
  stockCode: string = "";
  inputCode: string;
  searchResult: any[] = [];
  public inside = false;
  public code: any = (data as any).default;
  listCodeStockCompare: any[] = [];
  chart: any;
  chartConfig: any;
  startDataLocal: any[] = [];
  legend: any = {
    selected: {},
  };
  unit: string = "";
  endYear: number = 2020;
  startYear: number = 2015;
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
    if (!localStorage.listStockCompare) {
      localStorage.listStockCompare = "{}";
    } else {
      let listStockCompare =
        this.storageService.getLocalValueAsObject("listStockCompare");
      listStockCompare = this.removeCurrentStock(listStockCompare);
      for (const stockCode in listStockCompare) {
        this.legend.selected[stockCode] = false;
        this.listCodeStockCompare.push(stockCode);
        this.startDataLocal.push(...listStockCompare[stockCode][this.keyValue]);
      }
    }
  }

  ngAfterViewInit() {
    let data = this.data.concat(this.startDataLocal);
    this.renderChart(data);
  }

  removeCurrentStock(listData: any): any {
    delete listData[this.stockCode];
    for (const stockCode in listData) {
      let dataMap = JSON.parse(
        JSON.stringify(listData[stockCode][this.keyValue])
      );
      listData[stockCode][this.keyValue] = dataMap.filter(
        (item) => item.year >= this.startYear && item.year <= this.endYear
      );
    }
    return listData;
  }

  chooseStock(stock: any) {
    this.inputCode = "";
    this.searchResult = [];
    let listStockCompare =
      this.storageService.getLocalValueAsObject("listStockCompare");
    this.stockServ
      .getChartValue({
        stock_code: stock.code,
      })
      .subscribe((res: any) => {
        listStockCompare[stock.code] = res.data;
        this.storageService.setLocalValueAsObject(
          "listStockCompare",
          listStockCompare
        );

        this.listCodeStockCompare.push(stock.code);
        listStockCompare = this.removeCurrentStock(listStockCompare);
        this.updateChart(listStockCompare);
      });
  }

  changeYear() {
    let currentStock =
      this.storageService.getLocalValueAsObject("currentStock");
    this.data = currentStock[this.keyValue].filter(
      (item) => item.year >= this.startYear && item.year <= this.endYear
    );
    let listStockCompare =
      this.storageService.getLocalValueAsObject("listStockCompare");
    listStockCompare = this.removeCurrentStock(listStockCompare);
    this.updateChart(listStockCompare);
  }

  updateChart(listStockCompare: any) {
    let data = [];
    data = data.concat(this.data);
    for (const stock in listStockCompare) {
      data = data.concat(listStockCompare[stock][this.keyValue]);
    }
    this.chartConfig.data = JSON.parse(JSON.stringify(data));
    this.chartConfig.legend = JSON.parse(JSON.stringify(this.legend));
    this.chart.update(this.chartConfig);
    this.inside = false;
  }

  removeCode(stockCode: string, index: number) {
    let listStockCompare =
      this.storageService.getLocalValueAsObject("listStockCompare");
    listStockCompare = this.removeCurrentStock(listStockCompare);
    delete listStockCompare[stockCode];
    this.storageService.setLocalValueAsObject(
      "listStockCompare",
      listStockCompare
    );
    this.chartConfig.legend.selected[stockCode] = true;
    this.updateChart(listStockCompare);
    this.listCodeStockCompare.splice(index, 1);
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

  renderChart(data: any[]) {
    const COLOR_PLATE_10 = [
      "#5B8FF9",
      "#5AD8A6",
      "#5D7092",
      "#F6BD16",
      "#E8684A",
      "#6DC8EC",
      "#9270CA",
      "#FF9D4D",
      "#269A99",
      "#FF99C3",
    ];

    this.chartConfig = {
      data: data,
      xField: "time",
      yField: "value",
      seriesField: "stock",
      xAxis: {},
      yAxis: {
        label: {
          // 数值格式化为千分位
          formatter: (v) =>
            `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
        },
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
        title: {
          text: `(đơn vị:  ${this.unit})`,
          style: {
            fill: "white",
          },
        },
      },
      legend: this.legend,
      color: COLOR_PLATE_10,
      height: 400,
      point: {
        shape: ({ category }) => {
          return category === "Gas fuel" ? "square" : "circle";
        },
        style: ({ year }) => {
          return {
            r: Number(year) % 4 ? 0 : 3, // 4 个数据示一个点标记
          };
        },
      },
    };

    this.chart = new Line(this.eleChart.nativeElement, this.chartConfig);

    this.chart.render();

    this.chart.on("legend-item-name:click", (args) => {
      this.legend.selected[args.target.cfg.attrs.text] =
        !this.legend.selected[args.target.cfg.attrs.text];
    });
  }
}
