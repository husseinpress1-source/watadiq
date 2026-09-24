import { useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';



/** OAuth login entry — same Google-style account picker as the header popup. */

export default function WatadPassLoginPage() {

  const navigate = useNavigate();

  const [params] = useSearchParams();



  useEffect(() => {

    const returnTo = params.get('return_to') ?? params.get('next');

    const q = new URLSearchParams();

    if (returnTo) q.set('return_to', returnTo);

    const suffix = q.toString() ? `?${q.toString()}` : '';

    navigate(`/pass/signin${suffix}`, { replace: true });

  }, [navigate, params]);



  return null;

}


