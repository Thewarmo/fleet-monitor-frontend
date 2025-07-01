import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-xl flex justify-center items-center">{/* Contenedor más grande y flexible */}
        {children}
      </div>
    </div>
  );
}
