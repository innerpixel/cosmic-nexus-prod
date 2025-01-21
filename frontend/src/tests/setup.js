import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Pinia
vi.mock('pinia')

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: '/',
    name: 'home'
  })
}))

// Global component mocks
config.global.mocks = {
  $t: (key) => key,
  $route: {
    params: {},
    query: {},
    path: '/',
    name: 'home'
  }
}

// Global stubs
config.global.stubs = {
  Transition: false,
  'router-link': true,
  'router-view': true
}

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver
