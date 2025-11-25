/**
 * Sample Bundle File for Testing
 * This simulates a typical JavaScript bundle with various patterns
 */

// External dependencies
import { useEffect, useState } from 'react';
import axios from 'axios';
import lodash from 'lodash';

/**
 * User authentication service
 * Handles login, logout, and session management
 */
class AuthService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.token = null;
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${this.apiUrl}/auth/login`, {
        username,
        password
      });
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      return { success: true, token: this.token };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await axios.post(`${this.apiUrl}/auth/logout`, null, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.token = null;
      localStorage.removeItem('auth_token');
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  }

  isAuthenticated() {
    return this.token !== null || localStorage.getItem('auth_token') !== null;
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }
}

/**
 * Data fetching utility with caching
 */
class DataFetcher {
  constructor(baseUrl, cacheTimeout = 5000) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.cacheTimeout = cacheTimeout;
  }

  async get(endpoint) {
    const cacheKey = `GET:${endpoint}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`);
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      console.error(`Failed to post to ${endpoint}:`, error);
      throw error;
    }
  }

  invalidateCache() {
    this.cache.clear();
  }
}

// Duplicate code pattern (intentional for demo)
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateEmailAddress(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function checkEmailFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Large function (intentional for demo)
 * Simulates a complex form validation with many fields
 */
function validateComplexForm(formData) {
  const errors = {};

  if (!formData.username || formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }

  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
    errors.phone = 'Phone must be 10 digits';
  }

  if (!formData.address || formData.address.trim() === '') {
    errors.address = 'Address is required';
  }

  if (!formData.city || formData.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!formData.state || formData.state.trim() === '') {
    errors.state = 'State is required';
  }

  if (!formData.zipCode || !/^\d{5}$/.test(formData.zipCode)) {
    errors.zipCode = 'ZIP code must be 5 digits';
  }

  if (!formData.country || formData.country.trim() === '') {
    errors.country = 'Country is required';
  }

  if (!formData.terms) {
    errors.terms = 'You must accept the terms and conditions';
  }

  if (!formData.privacy) {
    errors.privacy = 'You must accept the privacy policy';
  }

  if (formData.age && (formData.age < 18 || formData.age > 120)) {
    errors.age = 'Age must be between 18 and 120';
  }

  if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
    errors.website = 'Website must be a valid URL';
  }

  return Object.keys(errors).length > 0 ? { valid: false, errors } : { valid: true };
}

// Export utilities
export { AuthService, DataFetcher, validateEmail, validateComplexForm };
