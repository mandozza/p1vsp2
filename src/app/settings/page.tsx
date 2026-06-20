import { db } from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/custom/SettingsClient';
import { eq } from 'drizzle-orm';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const [user] = await db.select().from(User).where(eq(User.id, session.user.id));

  const initialUser = user ? { ...user, _id: user.id } : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <SettingsClient initialUser={JSON.parse(JSON.stringify(initialUser))} />
    </div>
  );
}
