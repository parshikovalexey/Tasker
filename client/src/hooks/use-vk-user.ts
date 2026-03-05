import { useEffect, useState } from 'react';
import { bridge } from '@/lib/vkBridge';

export type VKUser = {
  id: number;
  first_name: string;
  last_name: string;
  photo_100: string;
  photo_200: string;
};

type State =
  | { status: 'loading' }
  | { status: 'success'; user: VKUser }
  | { status: 'error'; message: string };

export function useVKUser() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    bridge
      .send('VKWebAppGetUserInfo', {})
      .then((user) => {
        setState({
          status: 'success',
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            photo_100: user.photo_100,
            photo_200: user.photo_200,
          },
        });
      })
      .catch((err) => {
        setState({ status: 'error', message: String(err?.message ?? err) });
      });
  }, []);

  return state;
}
