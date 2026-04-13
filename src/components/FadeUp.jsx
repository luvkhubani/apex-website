import { useInView } from '../hooks/useInView';

/**
 * Wraps children in a fade-up reveal animation.
 * delay: ms delay before the transition starts (for staggered children)
 */
export default function FadeUp({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`fade-up ${inView ? 'visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
