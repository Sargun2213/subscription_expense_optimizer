const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('sub_optimizer_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Clear token if expired or invalid
      if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('sub_optimizer_token');
        localStorage.removeItem('sub_optimizer_user');
        window.location.href = '/login';
      }
    }

    // Handle CSV or non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      const blob = await response.blob();
      return blob as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || (data.details && data.details[0]?.message) || 'Request failed';
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Auth
  async register(body: any) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async login(body: any) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Dashboard
  async getDashboard() {
    return this.request<any>('/dashboard');
  }

  // Subscriptions
  async getSubscriptions(params?: { category?: string; status?: string; search?: string; sortBy?: string; order?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.order) query.append('order', params.order);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ subscriptions: any[]; totalCount: number }>(`/subscriptions${qs}`);
  }

  async getSubscription(id: string) {
    return this.request<{ subscription: any }>(`/subscriptions/${id}`);
  }

  async createSubscription(data: any) {
    return this.request<{ message: string; subscription: any }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSubscription(id: string, data: any) {
    return this.request<{ message: string; subscription: any }>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSubscription(id: string) {
    return this.request<{ message: string }>(`/subscriptions/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  async getAnalytics(currency?: string) {
    const qs = currency ? `?currency=${currency}` : '';
    return this.request<any>(`/analytics${qs}`);
  }

  // Optimizer
  async getRecommendations() {
    return this.request<any>('/optimizer/recommendations');
  }

  async reviewRecommendation(id: string) {
    return this.request<any>(`/optimizer/recommendations/${id}/review`, {
      method: 'POST'
    });
  }

  async dismissRecommendation(id: string) {
    return this.request<any>(`/optimizer/recommendations/${id}/dismiss`, {
      method: 'POST'
    });
  }

  async getScenarios() {
    return this.request<{ scenarios: any[] }>('/optimizer/scenarios');
  }

  async createScenario(data: { name: string; description?: string; selectedSubscriptionIds: string[] }) {
    return this.request<any>('/optimizer/scenarios', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteScenario(id: string) {
    return this.request<any>(`/optimizer/scenarios/${id}`, {
      method: 'DELETE'
    });
  }

  // Settings
  async getProfile() {
    return this.request<{ user: any }>('/settings/profile');
  }

  async updateProfile(data: any) {
    return this.request<{ message: string; user: any }>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updatePreferences(data: any) {
    return this.request<{ message: string; preferences: any }>('/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(data: any) {
    return this.request<{ message: string }>('/settings/change-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async exportCsv(): Promise<Blob> {
    return this.request<Blob>('/settings/export-csv');
  }

  async deleteAccount(password: string) {
    return this.request<{ message: string }>('/settings/account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmPassword: password })
    });
  }
}

export const api = new ApiClient();
