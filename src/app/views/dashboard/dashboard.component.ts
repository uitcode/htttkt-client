import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { getStyle, hexToRgba } from "@coreui/coreui/dist/js/coreui-utilities";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import { SharedService } from "../../services/shared.service";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { StockService } from "../../services/stock.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ChartValueComponent } from "../modals/chart-value/chart-value.component";
import { StorageService } from "../../services/storage.service";
import { ChartFourMComponent } from "../modals/chart-four-m/chart-four-m.component";
import { ChartCanslimComponent } from "../modals/chart-canslim/chart-canslim.component";

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  data = {};
  loadData4M = false;
  loadFilter = false;
  error4M: boolean = false;
  errorCanslim: boolean = false;
  showSelectYear: boolean = true;
  @ViewChild("yearInput", { read: ElementRef }) yearInput: ElementRef;

  company;
  companyValue;
  endYear = 2020;
  listRange = [
    {
      range: 1,
      percent: 30,
    },
    {
      range: 3,
      percent: 30,
    },
    {
      range: 5,
      percent: 40,
    },
  ];

  dataCanslim2;
  value4M;
  thamChieu = [20, 20, 15, 15, "<3*LN", 10, 10, 10, 15, 20, 15];
  thamChieuCanslim = [25, 25, 20, 20, 25, 25, 20, 20];

  tiTrong4M = [15, 20, 5, 15, 10, 5, 10, 5, 15];
  tiTrongCanslim = [15, 10, 10, 5, 20, 15, 15, 10];
  listTotal = [];
  listValueC = [];
  listValueA = [];
  updateYear;
  listQuarter = [
    {
      name: "q1",
      value: false,
    },
    {
      name: "q2",
      value: false,
    },
    {
      name: "q3",
      value: false,
    },
    {
      name: "q4",
      value: false,
    },
  ];
  minRange = 55;
  maxRange = 80;
  filterResult;
  filterResultCanslim;
  sort;
  price = "0";
  bsModalRef: BsModalRef;
  dataChartValue: any;
  constructor(
    private share: SharedService,
    private stockServ: StockService,
    private modalService: BsModalService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    if (!localStorage.currentStock) {
      localStorage.currentStock = "{}";
    }
    this.share.stock.subscribe((res) => {
      if (res) {
        this.company = res;
        this.loadData4M = true;
        this.stockServ
          .getPrice({ stock_code: this.company.code })
          .subscribe((resp: any) => {
            this.price =
              resp.data % 1 === 0 ? resp.data + ".000" : resp.data + "00";
          });
        this.stockServ
          .getChartValue({
            stock_code: this.company.code,
          })
          .subscribe((res: any) => {
            this.loadData4M = false;
            this.dataChartValue = res.data;
            this.storageService.setLocalValueAsObject(
              "currentStock",
              this.dataChartValue
            );
          });
        this.stockServ
          .getValue4M({
            stock_code: this.company.code,
            end_year: this.endYear,
            start_year: this.endYear - 5,
          })
          .subscribe((res: any) => {
            this.loadData4M = false;
            this.data = res.data.data;
          });
        this.stockServ
          .get4M({
            stock_code: this.company.code,
            end_year: this.endYear,
            list_percent: this.listRange,
          })
          .subscribe((res: any) => {
            this.loadData4M = false;
            this.value4M = res.data;
            this.error4M = !this.checkNull4M(res.data);
          });

        this.stockServ.getCanslim(this.company.code).subscribe((res: any) => {
          this.dataCanslim2 = res.data;
          this.errorCanslim = !this.checkNullCanslim(res.data);
        });
      }
    });
  }

  ngAfterViewInit() {}

  showChartValue(key: string, title: string, unit: string) {
    let data = this.dataChartValue[key].filter(
      (item) => item.year >= this.endYear - 5 && item.year <= this.endYear
    );
    const initialState = {
      data: data,
      title: "Biểu đồ thống kê " + title,
      stockCode: this.company.code,
      keyValue: key,
      unit: unit,
      endYear: this.endYear,
      startYear: this.endYear - 5,
    };
    this.bsModalRef = this.modalService.show(ChartValueComponent, {
      class: "modal-dialog-centered modal-xl value-chart",
      initialState,
    });
    this.bsModalRef.content.closeBtnName = "Close";
  }

  showChart4M() {
    const body = {
      end_year: this.endYear,
      list_percent: this.listRange,
      list_reference: {
        doanh_so: this.thamChieu[0],
        eps: this.thamChieu[1],
        bvps: this.thamChieu[2],
        luu_chuyen_tien_te: this.thamChieu[3],
        no_loi_nhuan: 3,
        effectiveness: this.thamChieu[5],
        effciency: this.thamChieu[6],
        productitivty: this.thamChieu[7],
        roa: this.thamChieu[8],
        roe: this.thamChieu[9],
        roic: this.thamChieu[10],
      },
      list_proportion: {
        doanh_so: this.tiTrong4M[0],
        eps: this.tiTrong4M[1],
        bvps: this.tiTrong4M[2],
        luu_chuyen_tien_te: this.tiTrong4M[3],
        no_loi_nhuan: this.tiTrong4M[4],
        effectiveness: this.tiTrong4M[5],
        effciency: this.tiTrong4M[5],
        productitivty: this.tiTrong4M[5],
        roa: this.tiTrong4M[6],
        roe: this.tiTrong4M[7],
        roic: this.tiTrong4M[8],
      },
    };
    const initialState = {
      title: "So sánh điểm số 4M",
      stockCode: this.company.code,
      endYear: this.endYear,
      body: body,
    };
    this.bsModalRef = this.modalService.show(ChartFourMComponent, {
      class: "modal-dialog-centered modal-md four-m-chart",
      initialState,
    });
    this.bsModalRef.content.closeBtnName = "Close";
  }

  showChartCanslim() {
    const body = {
      list_reference: {
        doanh_so: this.thamChieuCanslim.slice(0, 4),
        eps: this.thamChieuCanslim.slice(4, 8),
      },
      list_proportion: {
        doanh_so: this.tiTrongCanslim.slice(0, 4),
        eps: this.tiTrongCanslim.slice(4, 8),
      },
    };
    const initialState = {
      title: "So sánh điểm số Canslim",
      stockCode: this.company.code,
      endYear: this.endYear,
      body: body,
    };
    this.bsModalRef = this.modalService.show(ChartCanslimComponent, {
      class: "modal-dialog-centered modal-md canslim-chart",
      initialState,
    });
    this.bsModalRef.content.closeBtnName = "Close";
  }

  getColor(value) {
    let hue = (value * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
  }

  sumTiTrongCanslim() {
    let total = 0;
    for (const item of this.tiTrongCanslim) {
      total += item;
    }
    return total;
  }

  chooseYear() {
    fromEvent(this.yearInput.nativeElement, "input")
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (this.endYear) {
          this.stockServ
            .getValue4M({
              stock_code: this.company.code,
              end_year: this.endYear,
              start_year: this.endYear - 5,
            })
            .subscribe((res: any) => {
              this.data = res.data.data;
            });
          this.stockServ
            .get4M({
              stock_code: this.company.code,
              end_year: this.endYear,
              list_percent: this.listRange,
            })
            .subscribe((res: any) => {
              this.value4M = res.data;
              this.error4M = !this.checkNull4M(res.data);
            });
        }
      });
  }

  checkNull4M(data: any) {
    let status = true;
    for (const key in data) {
      for (const percent of data[key]) {
        if (percent === 1 || !percent) {
          status = false;
          break;
        }
      }
      if (!status) {
        break;
      }
    }
    return status;
  }

  checkNullCanslim(data: any): boolean {
    if (data.doanh_so?.length === 9 && data.eps?.length === 9) {
      return true;
    } else {
      return false;
    }
  }

  onSelect(e: any) {
    console.log(e);
  }

  handle(chiSo: [], thamChieu) {
    let sum = 0;
    if (chiSo) {
      chiSo.forEach((value, index) => {
        if (value < 0) {
          sum += 0;
        } else {
          if (value > thamChieu) {
            sum += this.listRange[index].percent;
          } else {
            sum += (value / thamChieu) * this.listRange[index].percent;
          }
        }
      });
    }
    return sum < 0 ? 0 : sum;
  }

  handleLN(chiSo, tiTrong) {
    let result = 0;
    if (chiSo) {
      if (chiSo[0] < 3 * chiSo[1]) {
        result = tiTrong;
      } else {
        result = 0;
      }
    }
    return result < 0 ? 0 : result;
  }

  handleCanslim(prev, next) {
    const result =
      next.reduce((accumulator, currentValue) => accumulator + currentValue) /
      prev.reduce((accumulator, currentValue) => accumulator + currentValue);
    return (result - 1) * 100;
  }

  caculateCanslim(chiSo, thamChieu, tiTrong) {
    let result;
    if (chiSo >= thamChieu) {
      result = 1 * tiTrong;
    } else {
      result = (chiSo / thamChieu) * tiTrong;
    }
    return result < 0 ? 0 : result;
  }

  totalC() {
    let result;
    if (this.dataCanslim2 && this.dataCanslim2.doanh_so.length === 9) {
      this.listValueC[0] = this.caculateCanslim(
        this.handleCanslim(
          [this.dataCanslim2.doanh_so[4].value],
          [this.dataCanslim2.doanh_so[0].value]
        ),
        this.thamChieuCanslim[0],
        this.tiTrongCanslim[0]
      );
      this.listValueC[1] = this.caculateCanslim(
        this.handleCanslim(
          [this.dataCanslim2.doanh_so[5].value],
          [this.dataCanslim2.doanh_so[1].value]
        ),
        this.thamChieuCanslim[1],
        this.tiTrongCanslim[1]
      );
      this.listValueC[2] = this.caculateCanslim(
        this.handleCanslim(
          [this.dataCanslim2.eps[4].value],
          [this.dataCanslim2.eps[0].value]
        ),
        this.thamChieuCanslim[4],
        this.tiTrongCanslim[4]
      );
      this.listValueC[3] = this.caculateCanslim(
        this.handleCanslim(
          [this.dataCanslim2.eps[5].value],
          [this.dataCanslim2.eps[1].value]
        ),
        this.thamChieuCanslim[5],
        this.tiTrongCanslim[5]
      );
      result = this.listValueC.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      );
    }
    return result;
  }

  totalA() {
    let result;
    if (
      this.dataCanslim2 &&
      this.dataCanslim2.doanh_so.length === 9 &&
      this.dataCanslim2.eps.length === 9
    ) {
      const saleArrayPrev = [
        this.dataCanslim2.doanh_so[4].value,
        this.dataCanslim2.doanh_so[5].value,
        this.dataCanslim2.doanh_so[6].value,
        this.dataCanslim2.doanh_so[7].value,
      ];
      const saleArrayNext = [
        this.dataCanslim2.doanh_so[0].value,
        this.dataCanslim2.doanh_so[1].value,
        this.dataCanslim2.doanh_so[2].value,
        this.dataCanslim2.doanh_so[3].value,
      ];
      const saleArrayPrev2 = [
        this.dataCanslim2.doanh_so[5].value,
        this.dataCanslim2.doanh_so[6].value,
        this.dataCanslim2.doanh_so[7].value,
        this.dataCanslim2.doanh_so[8].value,
      ];
      const saleArrayNext2 = [
        this.dataCanslim2.doanh_so[1].value,
        this.dataCanslim2.doanh_so[2].value,
        this.dataCanslim2.doanh_so[3].value,
        this.dataCanslim2.doanh_so[4].value,
      ];
      const epsPrev = [
        this.dataCanslim2.eps[4].value,
        this.dataCanslim2.eps[5].value,
        this.dataCanslim2.eps[6].value,
        this.dataCanslim2.eps[7].value,
      ];
      const epsNext = [
        this.dataCanslim2.eps[0].value,
        this.dataCanslim2.eps[1].value,
        this.dataCanslim2.eps[2].value,
        this.dataCanslim2.eps[3].value,
      ];
      const epsPrev2 = [
        this.dataCanslim2.eps[5].value,
        this.dataCanslim2.eps[6].value,
        this.dataCanslim2.eps[7].value,
        this.dataCanslim2.eps[8].value,
      ];
      const epsNext2 = [
        this.dataCanslim2.eps[1].value,
        this.dataCanslim2.eps[2].value,
        this.dataCanslim2.eps[3].value,
        this.dataCanslim2.eps[4].value,
      ];
      this.listValueA[0] = this.caculateCanslim(
        this.handleCanslim(saleArrayPrev, saleArrayNext),
        this.thamChieuCanslim[2],
        this.tiTrongCanslim[2]
      );
      this.listValueA[1] = this.caculateCanslim(
        this.handleCanslim(saleArrayPrev2, saleArrayNext2),
        this.thamChieuCanslim[3],
        this.tiTrongCanslim[3]
      );
      this.listValueA[2] = this.caculateCanslim(
        this.handleCanslim(epsPrev, epsNext),
        this.thamChieuCanslim[6],
        this.tiTrongCanslim[6]
      );
      this.listValueA[3] = this.caculateCanslim(
        this.handleCanslim(epsPrev2, epsNext2),
        this.thamChieuCanslim[7],
        this.tiTrongCanslim[7]
      );
      result = this.listValueA.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      );
    }
    return result;
  }

  finalTotal() {
    let result;
    if (this.value4M) {
      this.listTotal[0] =
        (this.handle(this.value4M.doanh_so, this.thamChieu[0]) *
          this.tiTrong4M[0]) /
        100;
      this.listTotal[1] =
        (this.handle(this.value4M.bvps, this.thamChieu[2]) *
          this.tiTrong4M[2]) /
        100;
      this.listTotal[2] =
        ((this.handle(this.value4M.effciency, this.thamChieu[6]) +
          this.handle(this.value4M.effectiveness, this.thamChieu[5]) +
          this.handle(this.value4M.productitivty, this.thamChieu[7])) *
          this.tiTrong4M[5]) /
        100;
      this.listTotal[3] =
        (this.handle(this.value4M.eps, this.thamChieu[1]) * this.tiTrong4M[1]) /
        100;
      this.listTotal[4] =
        (this.handle(this.value4M.luu_chuyen_tien_te, this.thamChieu[3]) *
          this.tiTrong4M[3]) /
        100;
      this.listTotal[5] = this.handleLN(
        this.value4M.no_loi_nhuan,
        this.tiTrong4M[4]
      );
      this.listTotal[6] =
        (this.handle(this.value4M.roa, this.thamChieu[8]) * this.tiTrong4M[6]) /
        100;
      this.listTotal[7] =
        (this.handle(this.value4M.roe, this.thamChieu[9]) * this.tiTrong4M[7]) /
        100;
      this.listTotal[8] =
        (this.handle(this.value4M.roic, this.thamChieu[10]) *
          this.tiTrong4M[8]) /
        100;
      result = this.listTotal.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      );
    }
    return result;
  }

  tongTiTrongCanslim() {
    return this.tiTrongCanslim.reduce(
      (accumulator, currentValue) => accumulator + currentValue
    );
  }

  update() {
    const quarter = this.listQuarter
      .filter((res) => res.value)
      .map((item) => item.name);
    if (this.company) {
      if (this.updateYear && quarter.length === 0) {
        this.updateWithYear();
      }
      if (quarter.length > 0 && this.updateYear) {
        this.updateWithQuarter(quarter);
      }
    }
  }

  updateWithYear() {
    const body = {
      year: [parseInt(this.updateYear)],
      stock_code: this.company.code,
    };
    this.stockServ.updateStockWithYear(body).subscribe((res: any) => {
      if (res.code === 200) {
        this.stockServ
          .getValue4M({
            stock_code: this.company.code,
            end_year: this.endYear,
            start_year: this.endYear - 5,
          })
          .subscribe((res: any) => {
            this.data = res.data.data;
          });

        this.stockServ
          .getChartValue({
            stock_code: this.company.code,
          })
          .subscribe((res: any) => {
            this.dataChartValue = res.data;
            this.storageService.setLocalValueAsObject(
              "currentStock",
              this.dataChartValue
            );
          });
        this.stockServ
          .get4M({
            stock_code: this.company.code,
            end_year: this.endYear,
            list_percent: this.listRange,
          })
          .subscribe((res: any) => {
            this.value4M = res.data;
            this.error4M = !this.checkNull4M(res.data);
          });
      }
    });
  }

  updateWithQuarter(quarter) {
    const body = {
      year: parseInt(this.updateYear),
      stock_code: this.company.code,
      quarter: quarter,
    };
    this.stockServ.updateStockWithQuarter(body).subscribe((res: any) => {
      if (res.code === 200) {
        this.stockServ.getCanslim(this.company.code).subscribe((res: any) => {
          this.dataCanslim2 = res.data;
          this.errorCanslim = !this.checkNullCanslim(res.data);
        });
      }
    });
  }

  filter4M() {
    this.filterResult = null;
    this.loadFilter = true;
    const body = {
      end_year: this.endYear,
      range_point: [this.minRange, this.maxRange],
      list_percent: this.listRange,
      list_reference: {
        doanh_so: this.thamChieu[0],
        eps: this.thamChieu[1],
        bvps: this.thamChieu[2],
        luu_chuyen_tien_te: this.thamChieu[3],
        no_loi_nhuan: 3,
        effectiveness: this.thamChieu[5],
        effciency: this.thamChieu[6],
        productitivty: this.thamChieu[7],
        roa: this.thamChieu[8],
        roe: this.thamChieu[9],
        roic: this.thamChieu[10],
      },
      list_proportion: {
        doanh_so: this.tiTrong4M[0],
        eps: this.tiTrong4M[1],
        bvps: this.tiTrong4M[2],
        luu_chuyen_tien_te: this.tiTrong4M[3],
        no_loi_nhuan: this.tiTrong4M[4],
        effectiveness: this.tiTrong4M[5],
        effciency: this.tiTrong4M[5],
        productitivty: this.tiTrong4M[5],
        roa: this.tiTrong4M[6],
        roe: this.tiTrong4M[7],
        roic: this.tiTrong4M[8],
      },
    };
    if (this.minRange >= 0 && this.maxRange) {
      this.stockServ.filter4M(body).subscribe((res: any) => {
        if (res.code === 200) {
          this.loadFilter = false;
          this.filterResult = res.data;
        }
      });
    }
  }

  filterCanslim() {
    this.filterResultCanslim = null;
    this.loadFilter = true;
    const body = {
      range_point: [this.minRange, this.maxRange],
      list_reference: {
        doanh_so: this.thamChieuCanslim.slice(0, 4),
        eps: this.thamChieuCanslim.slice(4, 8),
      },
      list_proportion: {
        doanh_so: this.tiTrongCanslim.slice(0, 4),
        eps: this.tiTrongCanslim.slice(4, 8),
      },
    };
    if (this.minRange >= 0 && this.maxRange) {
      this.stockServ.filterCanslim(body).subscribe((res: any) => {
        if (res.code === 200) {
          this.loadFilter = false;
          this.filterResultCanslim = res.data;
        }
      });
    }
  }

  onClickStock(item) {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.company = item.data;
    this.stockServ
      .getValue4M({
        stock_code: this.company.code,
        end_year: this.endYear,
        start_year: this.endYear - 5,
      })
      .subscribe((res: any) => {
        this.data = res.data.data;
      });

    this.stockServ
      .getChartValue({
        stock_code: this.company.code,
      })
      .subscribe((res: any) => {
        this.dataChartValue = res.data;
        this.storageService.setLocalValueAsObject(
          "currentStock",
          this.dataChartValue
        );
      });
    this.stockServ
      .get4M({
        stock_code: this.company.code,
        end_year: this.endYear,
        list_percent: this.listRange,
      })
      .subscribe((res: any) => {
        this.value4M = res.data;
        this.error4M = !this.checkNull4M(res.data);
      });

    this.stockServ.getCanslim(this.company.code).subscribe((res: any) => {
      this.dataCanslim2 = res.data;
      this.errorCanslim = !this.checkNullCanslim(res.data);
    });
  }

  sort4MFilter(value) {
    if (this.filterResult) {
      switch (parseInt(value)) {
        case 1:
          this.sortWithCode(this.filterResult, false);
          break;
        case 2:
          this.sortWithCode(this.filterResult, true);
          break;
        case 3:
          this.sortWithPoint(this.filterResult, false);
          break;
        case 4:
          this.sortWithPoint(this.filterResult, true);
      }
    }
  }
  sortCanslimFilter(value) {
    if (this.filterResultCanslim) {
      switch (parseInt(value)) {
        case 1:
          this.sortWithCode(this.filterResultCanslim, false);
          break;
        case 2:
          this.sortWithCode(this.filterResultCanslim, true);
          break;
        case 3:
          this.sortWithPoint(this.filterResultCanslim, false);
          break;
        case 4:
          this.sortWithPoint(this.filterResultCanslim, true);
      }
    }
  }

  sortWithCode(array, reverse) {
    if (!reverse) {
      array.sort((a, b) =>
        a.data.code > b.data.code ? 1 : b.data.code > a.data.code ? -1 : 0
      );
    } else {
      array.sort((a, b) =>
        a.data.code > b.data.code ? 1 : b.data.code > a.data.code ? -1 : 0
      );
      array.reverse();
    }
  }

  sortWithPoint(array, reverse?) {
    if (!reverse) {
      array.sort((a, b) => a.scores - b.scores);
    } else {
      array.sort((a, b) => a.scores - b.scores);
      array.reverse();
    }
  }
}
