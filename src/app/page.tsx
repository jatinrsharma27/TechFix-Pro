import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect immediately when this component loads
  redirect('/user'); // Change '/home' to your desired destination
}