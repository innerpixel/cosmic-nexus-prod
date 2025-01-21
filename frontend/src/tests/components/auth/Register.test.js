import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import Register from '../../../views/auth/Register.vue';
import { useAuthStore } from '../../../stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: { template: '<div>Login</div>' }
    }
  ]
});

describe('Register.vue', () => {
  const mountComponent = () => {
    return mount(Register, {
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

  it('renders register form', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('h2').text()).toBe('Create Account');
    expect(wrapper.find('input[name="displayName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
  });

  it('validates display name format', async () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[name="displayName"]');
    
    await input.setValue('Too Many Words Here');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Display name must be 1-2 words');
  });

  it('validates email format', async () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[name="email"]');
    
    await input.setValue('invalid-email');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Invalid email format');
  });

  it('validates password requirements', async () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[name="password"]');
    
    await input.setValue('weak');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Password must be at least 8 characters');
  });

  it('submits form with valid data', async () => {
    const wrapper = mountComponent();
    const authStore = useAuthStore();
    authStore.register = vi.fn().mockResolvedValue();

    // Fill form with valid data
    await wrapper.find('input[name="displayName"]').setValue('Test User');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('input[name="password"]').setValue('Password123!');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Check if store action was called with correct data
    expect(authStore.register).toHaveBeenCalledWith({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    });
  });

  it('shows error message on registration failure', async () => {
    const wrapper = mountComponent();
    const authStore = useAuthStore();
    const error = 'Registration failed';
    authStore.register = vi.fn().mockRejectedValue(new Error(error));

    // Fill form with valid data
    await wrapper.find('input[name="displayName"]').setValue('Test User');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('input[name="password"]').setValue('Password123!');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Check if error message is displayed
    expect(wrapper.text()).toContain(error);
  });

  it('navigates to login page when clicking sign in link', async () => {
    const wrapper = mountComponent();
    const loginLink = wrapper.find('router-link[to="/login"]');
    
    expect(loginLink.exists()).toBe(true);
    await loginLink.trigger('click');
    
    expect(router.currentRoute.value.name).toBe('login');
  });
});
