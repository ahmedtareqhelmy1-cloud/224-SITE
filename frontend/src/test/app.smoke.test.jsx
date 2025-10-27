import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { store } from '@/app/store';

// Minimal smoke test to ensure App renders without crashing in test env

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>
    );
  });
});
