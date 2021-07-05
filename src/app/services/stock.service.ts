import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class StockService {
  private stockEndpoint = `https://chungkhoan.cf/api/v1/tvsi`;

  constructor(private http: HttpClient) {}

  getValue4M(data) {
    return this.http.post(`${this.stockEndpoint}/4m/value`, data);
  }

  getChartValue(data) {
    return this.http.post(`${this.stockEndpoint}/chart/value`, data);
  }

  getPrice(data) {
    return this.http.post(`${this.stockEndpoint}/price`, data);
  }

  get4M(data) {
    return this.http.post(`${this.stockEndpoint}/4m`, data);
  }

  getChart4M(data) {
    return this.http.post(`${this.stockEndpoint}/4m/chart`, data);
  }

  getCanslim(code) {
    return this.http.post(`${this.stockEndpoint}/canslim`, {
      stock_code: code,
    });
  }

  getChartCanslim(data) {
    return this.http.post(`${this.stockEndpoint}/canslim/chart`, data);
  }

  updateStockWithYear(data) {
    return this.http.post(`${this.stockEndpoint}/update/year`, data);
  }

  updateStockWithQuarter(data) {
    return this.http.post(`${this.stockEndpoint}/update/quarter`, data);
  }

  filter4M(data) {
    return this.http.post(`${this.stockEndpoint}/4m/filter`, data);
  }

  filterCanslim(data) {
    return this.http.post(`${this.stockEndpoint}/canslim/filter`, data);
  }
}
