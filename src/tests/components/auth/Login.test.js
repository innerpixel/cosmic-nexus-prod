import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import Login from '../../../views/auth/Login.vue';
import { useAuthStore } from '../../../stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/register',
      name: 'register',
      component: { template: '<div>Register</div>' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: { template: '<div>Forgot Password</div>' }
    }
  ]
});

describe('Login.vue', () => {
  const mountComponent = () => {
    return mount(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
          router,
        ],
      },
    });
  };

  it('renders login form', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('h2').text()).toBe('Sign In');
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign In');
  });

  it('validates required fields', async () => {
    const wrapper = mountComponent();
    
    // Submit empty form
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');
  });

  it('validates email format', async () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[name="email"]');
    
    await input.setValue('invalid-email');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Invalid email format');
  });

  it('submits form with valid credentials', async () => {
    const wrapper = mountComponent();
    const authStore = useAuthStore();
    authStore.login = vi.fn().mockResolvedValue();

    // Fill form with valid data
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('input[name="password"]').setValue('Password123!');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Check if store action was called with correct data
    expect(authStore.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!'
    });
  });

  it('shows error message on login failure', async () => {
    const wrapper = mountComponent();
    const authStore = useAuthStore();
    const error = 'Invalid credentials';
    authStore.login = vi.fn().mockRejectedValue(new Error(error));

    // Fill form with valid data
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('input[name="password"]').setValue('Password123!');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Check if error message is displayed
    expect(wrapper.text()).toContain(error);
  });

  it('shows loading state during submission', async () => {
    const wrapper = mountComponent();
    const authStore = useAuthStore();
    
    // Create a promise that we can resolve later
    let resolveLogin;
    authStore.login = vi.fn().mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));

    // Fill and submit form
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('input[name="password"]').setValue('Password123!');
    await wrapper.find('form').trigger('submit');

    // Check loading state
    expect(wrapper.find('button[type="submit"]').text()).toBe('Signing in...');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();

    // Resolve the login
    resolveLogin();
    await wrapper.vm.$nextTick();

    // Check button returned to normal state
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign In');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('navigates to forgot password page', async () => {
    const wrapper = mountComponent();
    const forgotPasswordLink = wrapper.find('router-link[to="/forgot-password"]');
    
    expect(forgotPasswordLink.exists()).toBe(true);
    await forgotPasswordLink.trigger('click');
    
    expect(router.currentRoute.value.name).toBe('forgot-password');
  });

  it('navigates to register page', async () => {
    const wrapper = mountComponent();
    const registerLink = wrapper.find('router-link[to="/register"]');
    
    expect(registerLink.exists()).toBe(true);
    await registerLink.trigger('click');
    
    expect(router.currentRoute.value.name).toBe('register');
  });
});
