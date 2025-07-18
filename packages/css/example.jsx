// Example usage in Web projects

// 1. Import CSS variables (in your main CSS/JS file)
import '@wisburg/design-tokens-css/css/variables.css';

// 2. Use tokens in JavaScript
import { tokens, useTheme, getCssVar } from '@wisburg/design-tokens-css';

// Component example
export function Button({ variant = 'primary' }) {
  const theme = useTheme(); // Uses current theme (light/dark)
  
  return (
    <button
      style={{
        backgroundColor: tokens.colors.primary[500],
        padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
        borderRadius: tokens.radius.md,
        color: tokens.colors.white
      }}
    >
      Click me
    </button>
  );
}

// 3. Use CSS variables
export function Card() {
  return (
    <div className="card">
      <style jsx>{`
        .card {
          background: var(--color-background-elevated);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: var(--spacing-4);
        }
      `}</style>
      Card content
    </div>
  );
}

// 4. Styled Components example
import styled from 'styled-components';

const StyledButton = styled.button`
  background: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  
  &:hover {
    background: var(--color-primary-600);
  }
`;
