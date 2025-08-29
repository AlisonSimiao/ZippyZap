import { authOptions } from '@/lib/auth';
import { getServerSession} from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

const SignInLayout: React.FC<Props> = async ({children}) => {
    const session = await getServerSession(authOptions);
    
    if (session) {
        return redirect('/dashboard')
    }

  return <>{children}</>;
}

export default SignInLayout;