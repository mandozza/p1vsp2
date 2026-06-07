import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/custom/SettingsClient';

export default async function SettingsPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = await User.findById(session.user.id).lean();

  return (
    <div className="container mx-auto px-4 py-12">
      <SettingsClient initialUser={JSON.parse(JSON.stringify(user))} />
    </div>
  );
}
