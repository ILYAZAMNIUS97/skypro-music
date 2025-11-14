import { Suspense } from 'react';
import Signin from './Signin';

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Signin />
    </Suspense>
  );
}
