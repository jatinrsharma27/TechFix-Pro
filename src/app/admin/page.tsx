import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect immediately when this component loads
  redirect('/admin/dashboard');
}