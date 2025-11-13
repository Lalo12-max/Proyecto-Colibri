export function EstrellasValoracion({ rating = 0, size = 16, color = '#FFD700' }) {
  const fullStars = Math.floor(rating);
  const emptyStars = Math.max(0, 5 - fullStars);

  const starStyle = { fontSize: size, color, lineHeight: `${size}px` };
  const emptyStyle = { fontSize: size, color: '#ccc', lineHeight: `${size}px` };

  return (
    <span>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`star-${i}`} style={starStyle}>★</span>
      ))}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`star-empty-${i}`} style={emptyStyle}>☆</span>
      ))}
    </span>
  );
}