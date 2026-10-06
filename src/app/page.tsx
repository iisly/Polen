import { getPollenSnapshot } from '@/lib/pollen-data';
import PollenDashboard from '@/components/PollenDashboard';

export default async function Home() {
  const snapshot = await getPollenSnapshot();

  return <PollenDashboard initialSnapshot={snapshot} />;
}
