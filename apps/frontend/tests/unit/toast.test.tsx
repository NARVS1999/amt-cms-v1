import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/toast';

function ToastTrigger() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast('Saved!', 'success')}>Success</button>
      <button onClick={() => showToast('Error occurred', 'error')}>Error</button>
      <button onClick={() => showToast('Info message', 'info')}>Info</button>
    </div>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Toast system', () => {
  describe('ToastProvider', () => {
    it('renders children', () => {
      render(
        <ToastProvider>
          <div>Child content</div>
        </ToastProvider>,
      );
      expect(screen.getByText('Child content')).toBeDefined();
    });

    it('shows toast when showToast is called', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Success'));
      expect(screen.getByText('Saved!')).toBeDefined();
    });

    it('success toast auto-dismisses after 2s', () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Success'));
      expect(screen.getByText('Saved!')).toBeDefined();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.queryByText('Saved!')).toBeNull();
    });

    it('error toast does NOT auto-dismiss', () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Error'));
      expect(screen.getByText('Error occurred')).toBeDefined();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByText('Error occurred')).toBeDefined();
    });

    it('dismiss button removes toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Info'));
      expect(screen.getByText('Info message')).toBeDefined();

      const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissBtn);

      expect(screen.queryByText('Info message')).toBeNull();
    });

    it('applies correct variant class for success', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Success'));
      const toast = screen.getByText('Saved!').closest('[role="status"]');
      expect(toast?.className).toContain('bg-green-600');
    });
  });

  describe('useToast', () => {
    it('throws when used outside ToastProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      function BadComponent() {
        useToast();
        return null;
      }

      expect(() => render(<BadComponent />)).toThrow(
        'useToast must be used within a ToastProvider',
      );
      spy.mockRestore();
    });
  });
});
