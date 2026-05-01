/**
 * Tests for the RecipeImage primitive.
 * Sprint [1.5.175] — locks the contract for image rendering with onError fallback.
 */
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import RecipeImage from './RecipeImage';

describe('RecipeImage', () => {
  it('renders an <img> when src is provided', () => {
    const { container } = render(
      <RecipeImage src="https://example.com/foo.jpg" alt="foo" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/foo.jpg');
    expect(img?.getAttribute('alt')).toBe('foo');
  });

  it('renders ChefHat fallback when src is null/undefined', () => {
    const { container } = render(<RecipeImage src={null} alt="foo" />);
    expect(container.querySelector('img')).toBeNull();
    // ChefHat is an SVG icon — there should be at least one svg element.
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('transitions to fallback after onError fires', () => {
    const { container } = render(
      <RecipeImage src="https://broken.example/image.jpg" alt="broken" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('uses fallbackEmoji when provided and no src', () => {
    const { container, getByText } = render(
      <RecipeImage src={null} alt="meal" fallbackEmoji="🍽️" />,
    );
    expect(container.querySelector('svg')).toBeNull();
    expect(getByText('🍽️')).toBeTruthy();
  });
});
