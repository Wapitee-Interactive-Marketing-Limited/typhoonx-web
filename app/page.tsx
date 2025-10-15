export default function Home() {
  if (typeof window !== 'undefined') {
    window.location.replace('/auth/callback');
  }
  return null;
}

