import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, timer } from 'rxjs';
import { map, finalize, take } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  private tokenSubject: BehaviorSubject<any | null>;
  public account: Observable<Account | null>;
  public tokens: Observable<any | null>;

  constructor(private router: Router, private http: HttpClient) {
    this.accountSubject = new BehaviorSubject<Account | null>(null);
    this.tokenSubject = new BehaviorSubject<any | null>(null);
    this.account = this.accountSubject.asObservable();
    this.tokens = this.tokenSubject.asObservable();
  }

  public get accountValue() {
    return (
      this.accountSubject.value || JSON.parse(localStorage.getItem('user')!)
    );
  }

  public get tokenValue() {
    return (
      this.tokenSubject.value || JSON.parse(localStorage.getItem('tokens')!)
    );
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(
        `${baseUrl}/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        map((account) => {
          this.accountSubject.next(account.user);
          localStorage.setItem('user', JSON.stringify(account.user));
          this.tokenSubject.next(account.tokens);
          localStorage.setItem('tokens', JSON.stringify(account.tokens));
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  logout() {
    this.http
      .post<any>(
        `${baseUrl}/logout`,
        { refreshToken: this.tokenValue?.refresh!.token || '' },
        { withCredentials: true }
      )
      .subscribe();
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    return this.http
      .post<any>(
        `${baseUrl}/refresh-tokens`,
        { refreshToken: this.tokenValue?.refresh!.token || '' },
        { withCredentials: true }
      )
      .pipe(
        map((token) => {
          this.tokenSubject.next(token);
          localStorage.setItem('tokens', JSON.stringify(token));
          this.startRefreshTokenTimer();
          return token;
        })
      );
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, {
      token,
      password,
      confirmPassword,
    });
  }

  getAll() {
    return this.http.get<Account[]>(baseUrl);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  create(params: any) {
    return this.http.post(baseUrl, params);
  }

  update(id: string, params: any) {
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map((account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue?.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(() => {
        // auto logout if the logged in account was deleted
        if (id === this.accountValue?.id) this.logout();
      })
    );
  }

  // helper methods

  private refreshTokenTimeout?: any;

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtBase64 = this.tokenValue!.refresh?.token!.split('.')[1];
    const jwtToken = JSON.parse(atob(jwtBase64));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp);
    const timeout = expires.getTime() - 60 * 1000;
    const source = interval(1000);
    //output: 0,1,2,3,4,5....
    const refreshTokenTimer = source.pipe(
      take(timeout), //take only the first 5 values
      finalize(() => {
        console.log('Sequence complete');
        this.refreshToken().subscribe();
      }) // Execute when the observable completes
    );
    refreshTokenTimer.subscribe();
  }

  private stopRefreshTokenTimer() {
    clearInterval(this.refreshTokenTimeout);
  }
}
