import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

const baseUrl = `${environment.apiUrl}/cards`;

@Injectable({ providedIn: 'root' })
export class CardService {
  constructor(private router: Router, private http: HttpClient) {}

  getcardByUserId(id: string) {
    return this.http.get<any>(baseUrl + '/' + id);
  }
}
