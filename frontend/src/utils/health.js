export function getHealthStatus(analysis) {
  const score = analysis?.satellite?.farm_health_score || 0;

  if (score >= 0 && score <= 25) {
    return { label: 'Critical', bg: '#FEE2E2', color: '#DC2626', ring: '#EF4444' };
  }
  if (score > 25 && score <= 50) {
    return { label: 'Poor', bg: '#FEF3C7', color: '#D97706', ring: '#F59E0B' };
  }
  if (score > 50 && score <= 70) {
    return { label: 'Moderate', bg: '#FEF3C7', color: '#D97706', ring: '#F59E0B' };
  }
  if (score > 70 && score <= 85) {
    return { label: 'Good', bg: '#DCFCE7', color: '#16A34A', ring: '#22C55E' };
  }
  return { label: 'Excellent', bg: '#DCFCE7', color: '#16A34A', ring: '#22C55E' };
}
