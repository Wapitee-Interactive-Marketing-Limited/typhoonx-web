export default function CallbackPage() {
  if (typeof window !== 'undefined') {
    /** 可选：你也可以在这里通知插件。你可以写 postMessage 给插件 */
    if (window.location.href.includes('#access_token')) {
      // eslint-disable-next-line no-console
      console.log('Supabase magic link redirect');
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold">Login Successful</h3>
      <p className="mt-2">You can now return to the TyphoonX Chrome Extension.</p>
    </div>
  );
}

