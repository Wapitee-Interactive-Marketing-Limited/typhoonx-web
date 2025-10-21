"use client";
import { AuroraBackground } from '@/components/ui/aurora-background';
import { NavBar } from '@/components/ui/nav-bar';
import { Home as HomeIcon, LogIn, Table } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <AuroraBackground>
      <NavBar
        items={[
          { name: 'Home', url: '/', icon: HomeIcon },
          { name: 'Login', url: '/login', icon: LogIn },
          { name: 'Merchants', url: '/admin/merchant', icon: Table },
        ]}
      />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          See how every click turns into revenue
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          TyphoonX connects every user journey, from page view to purchase — across Shopify, ads, and CRM.
        </p>
        <div className="mt-8">
          <Link href="/login" className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white hover:opacity-90">
            Get Demo
          </Link>
        </div>
      </div>
    </AuroraBackground>
  );
}

