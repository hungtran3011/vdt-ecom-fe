import { InternalAxiosRequestConfig } from 'axios';

export interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
