export function setupIntersectionObserver() {
  if (typeof window === 'undefined') return;
  
  const elements = document.querySelectorAll('.animation-fade-in');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => observer.observe(el));
}