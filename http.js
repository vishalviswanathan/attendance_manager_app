import axios from 'axios';
import {API_URL} from './constants';

const url = API_URL;

const httpClient = axios.create({
  baseURL: url,
  timeout: 10000,
});

const get = async (path, params = {}) => {
  try {
    const response = await httpClient.get(path, {params});
    return {
      status: response?.status,
      response: response?.data,
    };
  } catch (error) {
    return {
      status: error?.response?.status || 500,
      response: error?.response?.data || 'Server error',
    };
  }
};

const post = async (path, data) => {
  try {
    const response = await httpClient.post(path, data);
    return {
      status: response?.status,
      response: response?.data,
    };
  } catch (error) {
    return {
      status: error?.response?.status || 500,
      response: error?.response?.data || 'Server error',
    };
  }
};

const put = async (path, data) => {
  try {
    const response = await httpClient.put(path, data);
    return {
      status: response?.status,
      response: response?.data,
    };
  } catch (error) {
    return {
      status: error?.response?.status || 500,
      response: error?.response?.data || 'Server error',
    };
  }
};

export const httpService = {get, post, put};
